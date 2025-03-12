from django.contrib import admin
from .models import Album, AlbumSong, SingerAlbum
# Register your models here.
admin.site.register(Album)
admin.site.register(AlbumSong)
admin.site.register(SingerAlbum)