from django.db import models

# Create your models here.

class SpotifyUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    vip = models.BooleanField(default=False)
    social_id = models.CharField(max_length=255, blank=True, null=True)  # ID từ Facebook/Google
    provider = models.CharField(max_length=50, blank=True, null=True)   # 'facebook' hoặc 'google'
    
    class Meta:
        db_table = 'user_user'
        
    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password
        self.password = make_password(raw_password)
        self.save()

    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)
    
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