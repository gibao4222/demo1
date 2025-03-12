from django.db import models

# Create your models here.
class Playlist(models.Model):
    id = models.BigAutoField(primary_key=True)
    create_date = models.DateField()
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    id_user = models.BigIntegerField()
    image = models.CharField(max_length=255)

class PlaylistSong(models.Model):  # Cho spotify_clone_playlist_song
    id_playlist = models.BigIntegerField()
    id_song = models.BigIntegerField()