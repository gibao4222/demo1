from django.contrib import admin
from .models import ChatPermission, Message
# Register your models here.
admin.site.register(ChatPermission)
admin.site.register(Message)