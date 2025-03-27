from django.contrib import admin
from .models import SpotifyUser, UserSinger, UserAlbum
# Register your models here.
admin.site.register(SpotifyUser)
admin.site.register(UserSinger)
admin.site.register(UserAlbum)