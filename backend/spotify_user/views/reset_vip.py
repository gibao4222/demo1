from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from spotify_user.models import SpotifyUser

class CheckVIPStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            spotify_user = user.spotify_user  # Truy cập SpotifyUser qua quan hệ OneToOne
        except SpotifyUser.DoesNotExist:
            # Nếu chưa có SpotifyUser, tạo mới
            spotify_user = SpotifyUser.objects.create(user=user, role='user')

        current_time = timezone.now()

        # Kiểm tra và reset VIP nếu hết hạn
        if spotify_user.vip and spotify_user.vip_start_date:
            time_elapsed = current_time - spotify_user.vip_start_date
            if time_elapsed > timedelta(days=30):
                spotify_user.vip = False
                spotify_user.vip_start_date = None
                spotify_user.save()

        return Response({
            'username': user.username,
            'vip': spotify_user.vip,
            'vip_start_date': spotify_user.vip_start_date,
            'role': spotify_user.role
        }, status=status.HTTP_200_OK)