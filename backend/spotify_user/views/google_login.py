import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from spotify_user.models import SpotifyUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class GoogleLoginView(APIView):
    @csrf_exempt
    def post(self, request):
        google_id_token = request.data.get('access_token')
        if not google_id_token:
            return Response({"error": "Vui lòng cung cấp ID token từ Google"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Xác thực ID token với Google
            idinfo = id_token.verify_oauth2_token(
                google_id_token,
                google_requests.Request(),
                "660579609549-kogcos0i04ldpherele2li974f9ulm01.apps.googleusercontent.com"  # Client ID của bạn
            )

            google_id = idinfo['sub']
            email = idinfo['email']

            if not email:
                return Response({"error": "Không lấy được email từ Google"}, status=status.HTTP_400_BAD_REQUEST)

        except ValueError as e:
            return Response({"error": "Token Google không hợp lệ", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm hoặc tạo User
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            username = f"google_{google_id}"
            if User.objects.filter(username=username).exists():
                username = f"google_{google_id}_{email.split('@')[0]}"

            user = User.objects.create_user(
                username=username,
                email=email,
                password=None
            )

        # Tìm hoặc tạo SpotifyUser
        try:
            spotify_user = SpotifyUser.objects.get(user=user)
        except SpotifyUser.DoesNotExist:
            spotify_user = SpotifyUser.objects.create(
                user=user,
                email=email,
                username=user.username,
                social_id=google_id,
                provider='google',
                is_active=True,
                role='user',
                vip=False
            )

        refresh = RefreshToken.for_user(user)
        # Serialize SpotifyUser để trả về thông tin đầy đủ
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': spotify_user.username,
            'role': spotify_user.role,
            'vip': spotify_user.vip
        }, status=status.HTTP_200_OK)