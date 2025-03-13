from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)

class SpotifyUser(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    author_id = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=255, unique=True)
    vip = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=(('user', 'User'), ('vip', 'VIP'), ('admin', 'Admin')), default='user')

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
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