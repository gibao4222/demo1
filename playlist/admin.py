from django.contrib import admin
from .models import Playlist, PlaylistSong
# Register your models here.
admin.site.register(Playlist)
admin.site.register(PlaylistSong)