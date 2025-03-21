from rest_framework import viewsets
from ..serializers import SpotifyUserSerializer, UserAlbumSerializer, UserSingerSerializer
from ..models import SpotifyUser, UserAlbum, UserSinger


class SpotifyUserViewSet(viewsets.ModelViewSet):
    queryset = SpotifyUser.objects.all()
    serializer_class = SpotifyUserSerializer

class UserAlbumViewSet(viewsets.ModelViewSet):
    queryset = UserAlbum.objects.all()
    serializer_class = UserAlbumSerializer

class UserSingerViewSet(viewsets.ModelViewSet):
    queryset = UserSinger.objects.all()
    serializer_class = UserSingerSerializer