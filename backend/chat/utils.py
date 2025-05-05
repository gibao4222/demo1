from django.db.models import Q
from spotify_user.models import UserFollowing
from .models import ChatPermission, Message
from django.db import transaction

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

# utils.py
def convert_pending_messages(requester, target):
    """
    Chuyển tất cả tin nhắn pending giữa requester và target thành trực tiếp.
    Trả về số lượng tin nhắn đã được cập nhật.
    """
    try:
        with transaction.atomic():
            # Log thông tin requester và target
            print(f"Requester: {requester.id}, Target: {target.id}")
            
            # Kiểm tra xem có tin nhắn pending nào tồn tại không
            pending_messages = Message.objects.filter(
                Q(sender=requester, receiver=target) | Q(sender=target, receiver=requester),
                is_pending=True
            )
            print(f"Found {pending_messages.count()} pending messages before update")
            for msg in pending_messages:
                print(f"Pending message: ID={msg.id}, Sender={msg.sender.id}, Receiver={msg.receiver.id}, Content={msg.content}, Is_Pending={msg.is_pending}")

            # Cập nhật tin nhắn
            updated_count = pending_messages.update(is_pending=False)
            print(f"Updated {updated_count} pending messages in convert_pending_messages")
            return updated_count
    except Exception as e:
        print(f"Error in convert_pending_messages: {e}")
        return 0