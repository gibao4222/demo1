from django.contrib import admin
from .models import Singer, SingerSong
# Register your models here.
admin.site.register(Singer)
admin.site.register(SingerSong)