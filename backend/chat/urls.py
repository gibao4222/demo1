from django.urls import path
from .views import ChatPermissionView, MessageView, MessageListView
# from .views_chatbot import ChatbotView
urlpatterns = [
    path('permission/', ChatPermissionView.as_view(), name='chat-permission'),
    path('message/', MessageView.as_view(), name='send-message'),
    path('messages/', MessageListView.as_view(), name='message-list'),
    # path('chatbot/', ChatbotView.as_view(), name='chatbot'),
]