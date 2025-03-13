from rest_framework import viewsets
from ..serializers import SpotifyUserSerializer, UserAlbumSerializer, UserSingerSerializer
from ..models import SpotifyUser, UserAlbum, UserSinger
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny

class SpotifyUserViewSet(viewsets.ModelViewSet):
    queryset = SpotifyUser.objects.all()
    serializer_class = SpotifyUserSerializer

class UserAlbumViewSet(viewsets.ModelViewSet):
    queryset = UserAlbum.objects.all()
    serializer_class = UserAlbumSerializer

class UserSingerViewSet(viewsets.ModelViewSet):
    queryset = UserSinger.objects.all()
    serializer_class = UserSingerSerializer
    
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error':'Invaild credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status =status.HTTP_200_OK)