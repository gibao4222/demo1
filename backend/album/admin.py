from django.contrib import admin
from .models import Album, AlbumSong
# Register your models here.
admin.site.register(Album)
admin.site.register(AlbumSong)