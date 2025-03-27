from django.contrib import admin
from .models import SpotifyUser, UserSinger, UserAlbum, UserFollowing, UserSong
# Register your models here.
admin.site.register(SpotifyUser)
admin.site.register(UserSinger)
admin.site.register(UserAlbum)

admin.site.register(UserSong)

# Kiểm tra UserFollowing
admin.site.register(UserFollowing)
