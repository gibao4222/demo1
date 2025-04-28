from django.db.models import Q
from spotify_user.models import UserFollowing
from .models import ChatPermission, Message

def can_chat_directly(sender, receiver):
    sender_follows_receiver = UserFollowing.objects.filter(
        follower=sender, following=receiver
    ).exists()
    receiver_follows_sender = UserFollowing.objects.filter(
        follower=receiver, following=sender
    ).exists()
    return sender_follows_receiver and receiver_follows_sender

# def can_send_message(sender, receiver):
#     if can_chat_directly(sender, receiver):
#         return True
#     permission = ChatPermission.objects.filter(requester=sender, target=receiver).first()
#     return permission and permission.is_accepted

def can_send_message_with_limit(sender, receiver):
    has_direct_message = Message.objects.filter(
        Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender),
        is_pending=False
    ).exists()
    if has_direct_message:
        return True, False, False
    
    if can_chat_directly(sender, receiver):
        return True, False, False
    
    permission = ChatPermission.objects.filter(
        Q(requester=sender, target=receiver) | Q(requester=receiver, target=sender),
        is_accepted=True
    ).first()
    if permission:
        return True, False, False
    
    pending_message = Message.objects.filter(
        sender=sender, receiver=receiver, is_pending=True
    ).exists()
    if pending_message:
        return False, True, False
    
    permission = ChatPermission.objects.filter(requester=sender, target=receiver).first()
    if not permission:
        return True, True, True
    return True, True, False

def convert_pending_messages(sender, receiver):
    """
    Chuyển tất cả tin nhắn pending giữa sender và receiver thành trực tiếp.
    Trả về danh sách tin nhắn đã được cập nhật.
    """
    try:
        with transaction.atomic():
            pending_messages = Message.objects.filter(
                Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender),
                is_pending=True
            )
            pending_messages.update(is_pending=False)
            return list(pending_messages)
    except Exception as e:
        print(f"Error in convert_pending_messages: {e}")
        return []