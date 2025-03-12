from django.db import models

# Create your models here.
class Singer(models.Model):
    id = models.BigAutoField(primary_key=True)
    birthday = models.DateField()
    description = models.CharField(max_length=255)
    followers = models.IntegerField()
    image = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

class SingerSong(models.Model):  # Cho spotify_clone_singer_song
    id_singer = models.BigIntegerField()
    id_song = models.BigIntegerField()