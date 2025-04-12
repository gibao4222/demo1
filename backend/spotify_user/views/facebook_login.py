import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from spotify_user.models import SpotifyUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
import facebook

class FacebookLoginView(APIView):
    @csrf_exempt
    def post(self, request):
        fb_access_token = request.data.get('access_token')
        if not fb_access_token:
            return Response({"error": "Vui lòng cung cấp access token từ Facebook"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            graph = facebook.GraphAPI(fb_access_token)
            fb_data = graph.get_object('me', fields='id,email')

            fb_id = fb_data.get('id')
            email = fb_data.get('email')

            if not email:
                return Response({"error": "Không lấy được email từ Facebook"}, status=status.HTTP_400_BAD_REQUEST)

        except facebook.GraphAPIError as e:
            return Response({"error": "Token Facebook không hợp lệ", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            username = f"fb_{fb_id}"
            if User.objects.filter(username=username).exists():
                username = f"fb_{fb_id}_{email.split('@')[0]}"

            user = User.objects.create_user(
                username=username,
                email=email,
                password=None
            )

        try:
            spotify_user = SpotifyUser.objects.get(user=user)
        except SpotifyUser.DoesNotExist:
            spotify_user = SpotifyUser.objects.create(
                user=user,
                email=email,
                username=user.username,
                social_id=fb_id,
                provider='facebook',
                is_active=True,
                role='user',
                vip=False
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': spotify_user.username,
            'role': spotify_user.role,
            'vip': spotify_user.vip
        }, status=status.HTTP_200_OK)