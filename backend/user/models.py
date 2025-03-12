from django.db import models

# Create your models here.
class User(models.Model):
    id = models.BigAutoField(primary_key=True)
    author_id = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    is_active = models.BooleanField()
    password = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    vip = models.BooleanField()

class UserSinger(models.Model):  # Cho spotify_clone_user_singer
    id_user = models.BigIntegerField()
    id_singer = models.BigIntegerField()

class UserAlbum(models.Model):  # Cho spotify_clone_user_album
    id_user = models.BigIntegerField()
    id_album = models.BigIntegerField()