from django.db import models
from django.contrib.auth.models import User
import pyotp
import pyqrcode
import os
from django.conf import settings

# Create your models here.

class SpotifyUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='spotify_user')
    email = models.EmailField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=255, unique=True)
    vip = models.BooleanField(default=False)
    social_id = models.CharField(max_length=255, blank=True, null=True)  # ID từ Facebook/Google
    PROVIDER_CHOICES = [
        ('facebook', 'Facebook'),
        ('google', 'Google'),
        ('', 'None'),
    ]
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, blank=True, null=True)   # 'facebook' hoặc 'google'
    role = models.CharField(max_length=50, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    two_factor_secret = models.CharField(max_length=100, blank=True, null=True)  # Lưu secret key cho 2FA
    
    class Meta:
        db_table = 'user_user'
        
    
    def __str__(self):
        return self.username
    
    def generate_two_factor_secret(self):
        """Tạo secret key cho Google Authenticator"""
        if not self.two_factor_secret:
            self.two_factor_secret = pyotp.random_base32()
            self.save()
        return self.two_factor_secret

    def get_qr_code_url(self):
        """Tạo URL mã QR để quét bằng Google Authenticator"""
        secret = self.generate_two_factor_secret()
        uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=self.email,
            issuer_name="YourAppName"
        )

        # Tạo hình ảnh QR từ URI
        qr = pyqrcode.create(uri)

        # Lưu hình ảnh QR vào thư mục media
        qr_path = os.path.join(settings.MEDIA_ROOT, 'qr_codes', f'qr_{self.user.id}.png')
        qr.png(qr_path, scale=5)

        # Trả về URL tuyệt đối của hình ảnh
        return f"http://localhost:8000{settings.MEDIA_URL}qr_codes/qr_{self.user.id}.png"

    def verify_otp(self, otp):
        """Xác minh mã OTP"""
        if not self.two_factor_secret:
            return False
        totp = pyotp.TOTP(self.two_factor_secret)
        return totp.verify(otp)
    
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