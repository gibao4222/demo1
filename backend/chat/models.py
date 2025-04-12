from django.db import models
from spotify_user.models import SpotifyUser

# Create your models here.
class ChatPermission(models.Model):
    requester = models.ForeignKey(SpotifyUser, on_delete=models.CASCADE, related_name='chat_requests')
    target = models.ForeignKey(SpotifyUser, on_delete=models.CASCADE, related_name='chat_permissions')
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_permissions'
        unique_together = ('requester', 'target')
        indexes = [
            models.Index(fields=['requester', 'target']),
            models.Index(fields=['is_accepted']),
        ]

    def __str__(self):
        return f"{self.requester.username} yêu cầu trò chuyện với {self.target.username}"

class Message(models.Model):
    sender = models.ForeignKey(SpotifyUser, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(SpotifyUser, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    music_link = models.URLField(blank=True, null=True)
    is_pending = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)  # Đánh dấu tin nhắn đã bị xóa
    is_recalled = models.BooleanField(default=False)  # Đánh dấu tin nhắn đã bị thu hồi
    created_at = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'messages'
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['is_pending']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Tin nhắn từ {self.sender.username} đến {self.receiver.username}"