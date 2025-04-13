# chat/consumers.py
import redis
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from spotify_user.models import SpotifyUser
from .models import Message, ChatPermission
from .utils import can_chat_directly, can_send_message

redis_client = redis.Redis(host='localhost', port=6379, db=0)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'].is_anonymous:
            print("User is anonymous, closing connection")
            await self.close()
            return

        self.user = self.scope['user']
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Đánh dấu tất cả tin nhắn chưa xem là đã xem
        await self.mark_unseen_messages()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('content', '')
        image = data.get('image', '')
        music_link = data.get('music_link', '')
        receiver_id = data.get('receiver_id')

        if not receiver_id:
            await self.send(text_data=json.dumps({
                'error': 'receiver_id là bắt buộc'
            }))
            return

        if not content and not image and not music_link:
            await self.send(text_data=json.dumps({
                'error': 'Tin nhắn không thể trống'
            }))
            return

        sender = await self.get_spotify_user(self.user.id)
        receiver = await self.get_spotify_user(receiver_id)

        if not receiver:
            await self.send(text_data=json.dumps({
                'error': 'Người nhận không tồn tại'
            }))
            return

        if sender == receiver:
            await self.send(text_data=json.dumps({
                'error': 'Không thể gửi tin nhắn cho chính mình'
            }))
            return
        
        
        can_chat = await self.can_send_message(sender, receiver)
        is_pending = not can_chat

        message = await self.save_message(sender, receiver, content, image, music_link, is_pending)
        
        if not is_pending:
            # Đánh dấu tin nhắn là đã xem nếu người nhận đang trong phòng chat
            await self.mark_message_as_seen(message)

        
        await self.store_message_in_redis(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'image': message.image.url if message.image else '',
                    'music_link': message.music_link,
                    'sender': sender.username if sender and sender.username else 'Người dùng không xác định',
                    'sender_id': str(message.sender.user.id),
                    'is_pending': is_pending,
                    'is_deleted': message.is_deleted,
                    'is_recalled': message.is_recalled,
                    'created_at': message.created_at.isoformat(),
                    'is_seen': message.is_seen,
                }
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
        }))

    async def delete_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delete_message',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
        }))

    async def recall_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'recall_message',
            'message_id': event['message_id'],
        }))

    @database_sync_to_async
    def get_spotify_user(self, user_id):
        try:
            return SpotifyUser.objects.get(user__id=user_id)
        except SpotifyUser.DoesNotExist:
            return None

    @database_sync_to_async
    def can_send_message(self, sender, receiver):
        try:
            if can_chat_directly(sender, receiver):
                return True
            permission = ChatPermission.objects.filter(requester=sender, target=receiver).first()
            if permission and permission.is_accepted:
                return True
            if not permission:
                ChatPermission.objects.create(requester=sender, target=receiver)
            return False
        except Exception as e:
            print(f"Error in can_send_message: {e}")
            return False  # Nếu có lỗi, không cho phép gửi tin nhắn trực tiếp

    @database_sync_to_async
    def save_message(self, sender, receiver, content, image, music_link, is_pending):
        return Message.objects.create(
            sender=sender,
            receiver=receiver,
            content=content,
            image=None,
            music_link=music_link,
            is_pending=is_pending,
            is_seen=False
        )

    @database_sync_to_async
    def store_message_in_redis(self, message):
        try:
            print(f"Storing message in Redis: sender_id={message.sender.user.id}, sender_username={message.sender.username}")
            room_key = f"chat:{min(message.sender.user.id, message.receiver.user.id)}_{max(message.sender.user.id, message.receiver.user.id)}"
            message_data = {
                'id': message.id,
                'sender_id': message.sender.user.id,  # Sử dụng id của auth_user
                'sender': message.sender.username if message.sender and message.sender.username else 'Người dùng không xác định',
                'receiver_id': message.receiver.user.id,  # Sử dụng id của auth_user
                'content': message.content,
                'image': message.image.url if message.image else '',
                'music_link': message.music_link,
                'is_pending': message.is_pending,
                'is_deleted': message.is_deleted,
                'is_recalled': message.is_recalled,
                'is_seen': message.is_seen,
                'created_at': message.created_at.isoformat(),
            }
            redis_client.rpush(room_key, json.dumps(message_data))
            redis_client.expire(room_key, 24 * 60 * 60)  # Hết hạn sau 24 giờ
        except Exception as e:
            print(f"Error in store_message_in_redis: {e}")
        
    @database_sync_to_async
    def mark_unseen_messages(self):
        try:
            user_id = self.user.id 
            room_parts = self.room_name.split('_')
            other_user_id = int(room_parts[0]) if int(room_parts[0]) != user_id else int(room_parts[1])
            receiver = SpotifyUser.objects.get(user__id=user_id)
            sender = SpotifyUser.objects.get(user__id=other_user_id)

            messages = Message.objects.filter(sender=sender, receiver=receiver, is_seen=False)
            for message in messages:
                message.is_seen = True
                message.save()
        except Exception as e:
            print(f"Error in mark_unseen_messages: {e}")
            # Không raise lỗi để tránh ngắt WebSocket
            
            
    @database_sync_to_async
    def mark_message_as_seen(self, message):
        try:
            message.is_seen = True
            message.save()
            print(f"Marked message {message.id} as seen")
        except Exception as e:
            print(f"Error in mark_message_as_seen: {e}")