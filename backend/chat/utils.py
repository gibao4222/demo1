from django.db.models import Q
from spotify_user.models import UserFollowing
from .models import ChatPermission

def can_chat_directly(sender, receiver):
    sender_follows_receiver = UserFollowing.objects.filter(
        follower=sender, following=receiver
    ).exists()
    receiver_follows_sender = UserFollowing.objects.filter(
        follower=receiver, following=sender
    ).exists()
    return sender_follows_receiver and receiver_follows_sender

def can_send_message(sender, receiver):
    if can_chat_directly(sender, receiver):
        return True
    permission = ChatPermission.objects.filter(requester=sender, target=receiver).first()
    return permission and permission.is_accepted