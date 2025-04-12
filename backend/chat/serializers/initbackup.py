from rest_framework import serializers
from ..models import ChatPermission, Message

class ChatPermissionSerializer(serializers.ModelSerializer):
    requester = serializers.CharField(source='requester.username')
    target = serializers.CharField(source='target.username')
    requester_id = serializers.IntegerField(source='requester.id')
    
    class Meta:
        model = ChatPermission
        fields = ['id', 'requester', 'requester_id', 'target', 'is_accepted', 'created_at']
        
class MessageSerializers(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username')
    sender_id = serializers.IntegerField(source='sender.user.id', read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'image', 'music_link', 'sender', 'sender_id', 'is_pending', 'is_deleted', 'is_recalled', 'is_seen', 'created_at']
    
    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return ''