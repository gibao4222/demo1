from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from spotify_user.models import SpotifyUser


from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings


import requests
import pyqrcode
import os
from ..serializers import SpotifyUserSerializer






class LoginStep1View(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Vui lòng cung cấp email và mật khẩu"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Xác thực người dùng
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({"error": "Email hoặc mật khẩu không đúng"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            spotify_user = SpotifyUser.objects.get(email=email)
            if not spotify_user.is_active:
                return Response({"error": "Tài khoản đã bị khóa"}, status=status.HTTP_403_FORBIDDEN)

            # Trả về URL mã QR để quét
            qr_code_url = spotify_user.get_qr_code_url()
            return Response({
                "message": "Vui lòng quét mã QR bằng Google Authenticator và nhập mã OTP",
                "qr_code_url": qr_code_url,
                "user_id": user.id  # Trả về user_id để dùng ở bước 2
            }, status=status.HTTP_200_OK)
        except SpotifyUser.DoesNotExist:
            return Response({"error": "Không tìm thấy người dùng Spotify"}, status=status.HTTP_404_NOT_FOUND)
        
class LoginStep2View(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        otp = request.data.get('otp')

        if not user_id or not otp:
            return Response({"error": "Vui lòng cung cấp user_id và mã OTP"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            spotify_user = SpotifyUser.objects.get(user=user)

            # Xác minh mã OTP
            if not spotify_user.verify_otp(otp):
                return Response({"error": "Mã OTP không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

            # Tạo JWT token
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': spotify_user.username,
                'role': spotify_user.role,
                'vip': spotify_user.vip
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)
        except SpotifyUser.DoesNotExist:
            return Response({"error": "Không tìm thấy người dùng Spotify"}, status=status.HTTP_404_NOT_FOUND)
        
class RegisterView(APIView):
    def post(self, request):
        serializer = SpotifyUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Đăng ký thành công"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Vui lòng cung cấp refresh token"}, status=status.HTTP_400_BAD_REQUEST)

            # Blacklist refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Đăng xuất thành công"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": f"Lỗi khi đăng xuất: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


