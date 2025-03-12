from django.db import models

# Create your models here.
class Album(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.CharField(max_length=255)
    is_active = models.BooleanField()
    name = models.CharField(max_length=255)
    popularity = models.IntegerField()

class AlbumSong(models.Model):  # Cho spotify_clone_album_song
    id_album = models.BigIntegerField()
    id_song = models.BigIntegerField()

class SingerAlbum(models.Model):  # Cho spotify_clone_singer_album
    id_singer = models.BigIntegerField()
    id_album = models.BigIntegerField()