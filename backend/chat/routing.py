from django.urls import re_path
from . import consumers
from myproject.middleware import JWTAuthMiddleware

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', JWTAuthMiddleware(consumers.ChatConsumer.as_asgi())),
]