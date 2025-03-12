from django.db import models

# Create your models here.
class SpotifyUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    author_id = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    is_active = models.BooleanField()
    password = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    vip = models.BooleanField()
    class Meta:
        db_table = 'user_user'

    def __str__(self):
        return self.username
class UserSinger(models.Model):  # Cho spotify_clone_user_singer
    id_user = models.BigIntegerField()
    id_singer = models.BigIntegerField()
    
    class Meta:
        db_table = 'user_usersinger'

    def __str__(self):
        return f"UserSinger: {self.id_user} - {self.id_singer}"

class UserAlbum(models.Model):  # Cho spotify_clone_user_album
    id_user = models.BigIntegerField()
    id_album = models.BigIntegerField()
    
    class Meta:
        db_table = 'user_useralbum'

    def __str__(self):
        return f"UserAlbum: {self.id_user} - {self.id_album}"