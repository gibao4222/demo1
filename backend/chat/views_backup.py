from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ChatPermission, Message
from .utils import can_chat_directly, can_send_message
from spotify_user.models import SpotifyUser
from django.contrib.auth.models import User

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import redis
import json
from .serializers import ChatPermissionSerializer, MessageSerializers
from rest_framework.pagination import PageNumberPagination
import logging
logger = logging.getLogger(__name__)

# Kết nối Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

def store_message_in_redis(message):
    room_key = f"chat:{min(message.sender.id, message.receiver.id)}_{max(message.sender.id, message.receiver.id)}"
    message_data = {
        'id': message.id,
        'sender_id': message.sender.id,
        'receiver_id': message.receiver.id,
        'content': message.content,
        'image': message.image.url if message.image else '',
        'music_link': message.music_link,
        'is_pending': message.is_pending,
        'is_deleted': message.is_deleted,
        'is_recalled': message.is_recalled,
        'is_seen': message.is_seen,
        'created_at': message.created_at.isoformat(),
        'sender': message.sender.username,
    }
    try:
        redis_client.rpush(room_key, json.dumps(message_data))
        redis_client.expire(room_key, 24 * 60 * 60)
        logger.debug(f"Lưu tin nhắn vào Redis thành công: {room_key}")
    except Exception as e:
        logger.error(f"Lỗi khi lưu tin nhắn vào Redis: {str(e)}")

class ChatPermissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            target = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        requests = ChatPermission.objects.filter(target=target, is_accepted=False)
        serializer = ChatPermissionSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            requester = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        target_id = request.data.get('target_id')
        if not target_id:
            return Response({"lỗi": "target_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = SpotifyUser.objects.get(id=target_id)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        if requester == target:
            return Response({"lỗi": "Không thể gửi yêu cầu trò chuyện cho chính mình"}, status=status.HTTP_400_BAD_REQUEST)
    
        if ChatPermission.objects.filter(requester=requester, target=target).exists():
            return Response({"lỗi": "Yêu cầu trò chuyện đã tồn tại"}, status=status.HTTP_400_BAD_REQUEST)

        permission = ChatPermission.objects.create(requester=requester, target=target)
        return Response({"thông báo": "Yêu cầu trò chuyện đã được gửi"}, status=status.HTTP_201_CREATED)

    def put(self, request):
        try:
            target = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        requester_id = request.data.get('requester_id')
        action = request.data.get('action')

        if not requester_id or not action:
            return Response({"lỗi": "requester_id và action là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            permission = ChatPermission.objects.get(requester__id=requester_id, target=target, is_accepted=False)
        except ChatPermission.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy yêu cầu trò chuyện"}, status=status.HTTP_404_NOT_FOUND)

        if action == 'accept':
            permission.is_accepted = True
            permission.save()
            Message.objects.filter(sender=permission.requester, receiver=target, is_pending=True).update(is_pending=False)
            return Response({"thông báo": "Đã chấp nhận yêu cầu trò chuyện"}, status=status.HTTP_200_OK)
        elif action == 'reject':
            permission.delete()
            Message.objects.filter(sender=permission.requester, receiver=target, is_pending=True).delete()
            return Response({"thông báo": "Đã từ chối yêu cầu trò chuyện"}, status=status.HTTP_200_OK)
        else:
            return Response({"lỗi": "Hành động không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.debug(f"Dữ liệu nhận được: {request.data}, FILES: {request.FILES}")
        try:
            sender = SpotifyUser.objects.get(user=request.user)
            logger.debug(f"Sender: {sender.username}")
        except SpotifyUser.DoesNotExist:
            logger.error("Không tìm thấy SpotifyUser cho người dùng này")
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        receiver_id = request.data.get('receiver_id')
        content = request.data.get('content', '')
        image = request.FILES.get('image')
        music_link = request.data.get('music_link', '')
        logger.debug(f"receiver_id: {receiver_id}, content: {content}, image: {image}, music_link: {music_link}")

        if not receiver_id:
            logger.error("receiver_id là bắt buộc")
            return Response({"lỗi": "receiver_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        if not content and not image and not music_link:
            logger.error("Tin nhắn không thể trống")
            return Response({"lỗi": "Tin nhắn không thể trống"}, status=status.HTTP_400_BAD_REQUEST)

        if image and image.size > 5 * 1024 * 1024:
            logger.error("File ảnh quá lớn")
            return Response({"lỗi": "File ảnh quá lớn, tối đa 5MB"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            receiver_user = User.objects.get(id=receiver_id)
            logger.debug(f"Receiver User: {receiver_user}")
            try:
                receiver = receiver_user.spotify_user  # Sửa lỗi
                logger.debug(f"Receiver SpotifyUser: {receiver}")
            except SpotifyUser.DoesNotExist:
                logger.error("SpotifyUser không tồn tại cho người nhận")
                return Response({"lỗi": "SpotifyUser không tồn tại cho người nhận"}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            logger.error("Người nhận không tồn tại")
            return Response({"lỗi": "Người nhận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        

        if sender == receiver:
            logger.error("Không thể gửi tin nhắn cho chính mình")
            return Response({"lỗi": "Không thể gửi tin nhắn cho chính mình"}, status=status.HTTP_400_BAD_REQUEST)

        if can_send_message(sender, receiver):
            is_pending = False
        else:
            is_pending = True
            if not ChatPermission.objects.filter(requester=sender, target=receiver).exists():
                ChatPermission.objects.create(requester=sender, target=receiver)

        try:
            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=content,
                image=image,
                music_link=music_link,
                is_pending=is_pending,
                is_seen=False
            )
            logger.debug("Tin nhắn đã được lưu vào cơ sở dữ liệu")
        except Exception as e:
            logger.error(f"Lỗi khi lưu tin nhắn: {str(e)}")
            return Response({"lỗi": f"Lỗi khi lưu tin nhắn: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Lưu vào Redis
        logger.debug("Lưu tin nhắn vào Redis")
        store_message_in_redis(message)

        # Gửi qua WebSocket
        logger.debug("Gửi tin nhắn qua WebSocket")
        channel_layer = get_channel_layer()
        room_name = f"{min(request.user.id, receiver_user.id)}_{max(request.user.id, receiver_user.id)}"
        async_to_sync(channel_layer.group_send)(
            f'chat_{room_name}',
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'image': message.image.url if message.image else '',
                    'music_link': message.music_link,
                    'sender': sender.user.username,
                    'sender_id': str(sender.user.id),
                    'is_pending': is_pending,
                    'is_deleted': message.is_deleted,
                    'is_recalled': message.is_recalled,
                    'is_seen': message.is_seen,
                    'created_at': message.created_at.isoformat(),
                }
            }
        )
        logger.debug("Hoàn tất gửi tin nhắn")
        return Response({"thông báo": "Tin nhắn đã được gửi", "is_pending": is_pending}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Xóa tin nhắn (chỉ phía người gửi)"""
        try:
            user = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        message_id = request.query_params.get('message_id')
        if not message_id:
            return Response({"lỗi": "message_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            message = Message.objects.get(id=message_id, sender=user)
            message.is_deleted = True
            message.save()

            # Cập nhật dữ liệu trong Redis
            room_key = f"chat:{min(message.sender.user.id, message.receiver.user.id)}_{max(message.sender.user.id, message.receiver.user.id)}"
            messages_in_redis = redis_client.lrange(room_key, 0, -1)
            if messages_in_redis:
                updated_messages = []
                for msg in messages_in_redis:
                    msg_data = json.loads(msg)
                    if msg_data['id'] == message.id:
                        msg_data['is_deleted'] = True
                    updated_messages.append(json.dumps(msg_data))
                redis_client.delete(room_key)
                for msg in updated_messages:
                    redis_client.rpush(room_key, msg)
                redis_client.expire(room_key, 24 * 60 * 60)
            
            # Gửi thông báo qua WebSocket
            channel_layer = get_channel_layer()
            room_name = f"{min(message.sender.user.id, message.receiver.user.id)}_{max(message.sender.user.id, message.receiver.user.id)}"
            async_to_sync(channel_layer.group_send)(
                f'chat_{room_name}',
                {
                    'type': 'delete_message',
                    'message_id': message.id,
                    'user_id': request.user.id,
                }
            )

            return Response({"thông báo": "Tin nhắn đã được xóa"}, status=status.HTTP_200_OK)
        except Message.DoesNotExist:
            return Response({"lỗi": "Tin nhắn không tồn tại hoặc bạn không có quyền xóa"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        """Thu hồi tin nhắn (cả hai phía)"""
        try:
            user = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        message_id = request.data.get('message_id')
        if not message_id:
            return Response({"lỗi": "message_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            message = Message.objects.get(id=message_id, sender=user)
            message.is_recalled = True
            message.save()
            
            # Cập nhật dữ liệu trong Redis
            room_key = f"chat:{min(message.sender.user.id, message.receiver.user.id)}_{max(message.sender.user.id, message.receiver.user.id)}"
            messages_in_redis = redis_client.lrange(room_key, 0, -1)
            if messages_in_redis:
                updated_messages = []
                for msg in messages_in_redis:
                    msg_data = json.loads(msg)
                    if msg_data['id'] == message.id:
                        msg_data['is_recalled'] = True
                    updated_messages.append(json.dumps(msg_data))
                redis_client.delete(room_key)
                for msg in updated_messages:
                    redis_client.rpush(room_key, msg)
                redis_client.expire(room_key, 24 * 60 * 60)

            # Gửi thông báo qua WebSocket
            channel_layer = get_channel_layer()
            room_name = f"{min(message.sender.user.id, message.receiver.user.id)}_{max(message.sender.user.id, message.receiver.user.id)}"
            async_to_sync(channel_layer.group_send)(
                f'chat_{room_name}',
                {
                    'type': 'recall_message',
                    'message_id': message.id,
                }
            )

            return Response({"thông báo": "Tin nhắn đã được thu hồi"}, status=status.HTTP_200_OK)
        except Message.DoesNotExist:
            return Response({"lỗi": "Tin nhắn không tồn tại hoặc bạn không có quyền thu hồi"}, status=status.HTTP_404_NOT_FOUND)

class MessageListPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 100

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = MessageListPagination
    
    def get(self, request):
        try:
            user = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        target_id = request.query_params.get('target_id')
        if not target_id:
            return Response({"lỗi": "target_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=target_id)  # Lấy User từ auth_user
            target = SpotifyUser.objects.get(user=target_user)  # Lấy SpotifyUser tương ứng
        except User.DoesNotExist:
            return Response({"lỗi": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "SpotifyUser không tồn tại cho người dùng mục tiêu"}, status=status.HTTP_404_NOT_FOUND)

        room_key = f"chat:{min(request.user.id, target_user.id)}_{max(request.user.id, target_user.id)}"
        messages_in_redis = redis_client.lrange(room_key, 0, -1)
        messages = []
        if messages_in_redis:
            messages = [json.loads(msg) for msg in messages_in_redis]
        else:
            messages_query = Message.objects.filter(
                (Q(sender=user, receiver=target) | Q(sender=target, receiver=user))
            ).order_by('created_at')
            serializer = MessageSerializers(messages_query, many=True)
            messages = serializer.data
            for msg in messages:
                redis_client.rpush(room_key, json.dumps(msg))
            redis_client.expire(room_key, 24 * 60 * 60)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(messages, request)
        return paginator.get_paginated_response(page)