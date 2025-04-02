from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import ChatPermission, Message
from .utils import can_chat_directly, can_send_message
from spotify_user.models import SpotifyUser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import redis
import json

# Kết nối Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

def store_message_in_redis(message):
    room_key = f"chat:{min(message.sender.id, message.receiver.id)}_{max(message.sender.id, message.receiver.id)}"
    message_data = {
        'id': message.id,
        'sender_id': message.sender.id,
        'receiver_id': message.receiver.id,
        'content': message.content,
        'image': message.image,
        'music_link': message.music_link,
        'is_pending': message.is_pending,
        'is_deleted': message.is_deleted,
        'is_recalled': message.is_recalled,
        'created_at': message.created_at.isoformat(),
    }
    redis_client.rpush(room_key, json.dumps(message_data))
    redis_client.expire(room_key, 24 * 60 * 60)  # Hết hạn sau 24 giờ

class ChatPermissionView(APIView):
    # permission_classes = [IsAuthenticated]

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
        try:
            sender = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        receiver_id = request.data.get('receiver_id')
        content = request.data.get('content', '')
        image = request.data.get('image', '')
        music_link = request.data.get('music_link', '')

        if not receiver_id:
            return Response({"lỗi": "receiver_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = SpotifyUser.objects.get(id=receiver_id)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Người nhận không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        if can_send_message(sender, receiver):
            is_pending = False
        else:
            is_pending = True
            if not ChatPermission.objects.filter(requester=sender, target=receiver).exists():
                ChatPermission.objects.create(requester=sender, target=receiver)

        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            content=content,
            image=image,
            music_link=music_link,
            is_pending=is_pending
        )

        # Lưu vào Redis
        store_message_in_redis(message)

        # Gửi qua WebSocket
        channel_layer = get_channel_layer()
        room_name = f"{min(sender.id, receiver.id)}_{max(sender.id, receiver.id)}"
        async_to_sync(channel_layer.group_send)(
            f'chat_{room_name}',
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'image': message.image,
                    'music_link': message.music_link,
                    'sender': sender.username,
                    'is_pending': is_pending,
                    'created_at': message.created_at.isoformat(),
                }
            }
        )

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

            # Gửi thông báo qua WebSocket
            channel_layer = get_channel_layer()
            room_name = f"{min(message.sender.id, message.receiver.id)}_{max(message.sender.id, message.receiver.id)}"
            async_to_sync(channel_layer.group_send)(
                f'chat_{room_name}',
                {
                    'type': 'delete_message',
                    'message_id': message.id,
                    'user_id': user.id,
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

            # Gửi thông báo qua WebSocket
            channel_layer = get_channel_layer()
            room_name = f"{min(message.sender.id, message.receiver.id)}_{max(message.sender.id, message.receiver.id)}"
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

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        target_id = request.query_params.get('target_id')
        if not target_id:
            return Response({"lỗi": "target_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = SpotifyUser.objects.get(id=target_id)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra Redis trước
        room_key = f"chat:{min(user.id, target.id)}_{max(user.id, target.id)}"
        messages_in_redis = redis_client.lrange(room_key, 0, -1)
        messages = []
        if messages_in_redis:
            messages = [json.loads(msg) for msg in messages_in_redis]
        else:
            # Nếu không có trong Redis, truy vấn từ MySQL
            messages_query = Message.objects.filter(
                (Q(sender=user, receiver=target) | Q(sender=target, receiver=user))
            ).order_by('created_at')
            messages = [
                {
                    'id': msg.id,
                    'content': msg.content,
                    'image': msg.image,
                    'music_link': msg.music_link,
                    'sender': msg.sender.username,
                    'is_pending': msg.is_pending,
                    'is_deleted': msg.is_deleted,
                    'is_recalled': msg.is_recalled,
                    'created_at': msg.created_at.isoformat(),
                } for msg in messages_query
            ]
            # Lưu lại vào Redis
            for msg in messages:
                redis_client.rpush(room_key, json.dumps(msg))
            redis_client.expire(room_key, 24 * 60 * 60)

        return Response({"messages": messages}, status=status.HTTP_200_OK)