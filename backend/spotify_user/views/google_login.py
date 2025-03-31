import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from spotify_user.models import SpotifyUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt

class GoogleLoginView(APIView):
    @csrf_exempt
    def post(self, request):
        google_id_token = request.data.get('access_token')  # Đây thực chất là ID token
        if not google_id_token:
            return Response({"error": "Vui lòng cung cấp ID token từ Google"}, status=status.HTTP_400_BAD_REQUEST)

        # Xác thực ID token với Google
        try:
            google_response = requests.get(
                f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={google_id_token}'
            )
            google_data = google_response.json()

            if 'error' in google_data:
                return Response({"error": "Token Google không hợp lệ", "details": google_data}, status=status.HTTP_400_BAD_REQUEST)

            google_id = google_data.get('sub')  # Google ID
            email = google_data.get('email')

            if not email:
                return Response({"error": "Không lấy được email từ Google"}, status=status.HTTP_400_BAD_REQUEST)

        except requests.RequestException as e:
            return Response({"error": "Lỗi khi kết nối với Google", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Tìm hoặc tạo User
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Tạo username từ email hoặc Google ID
            username = f"google_{google_id}"
            if User.objects.filter(username=username).exists():
                username = f"google_{google_id}_{email.split('@')[0]}"

            user = User.objects.create_user(
                username=username,
                email=email,
                password=None  # Không cần password cho đăng nhập xã hội
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

        # Tạo JWT token
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': spotify_user.username,
            'role': spotify_user.role,
            'vip': spotify_user.vip
        }, status=status.HTTP_200_OK)