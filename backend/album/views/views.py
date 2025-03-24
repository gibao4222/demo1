from rest_framework import viewsets
from ..serializers import AlbumSerializer, AlbumSongSerializer, SingerAlbumSerializer
from ..models import Album, AlbumSong, SingerAlbum


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class AlbumSongViewSet(viewsets.ModelViewSet):
    queryset = AlbumSong.objects.all()
    serializer_class = AlbumSongSerializer

class SingerAlbumViewSet(viewsets.ModelViewSet):
    queryset = SingerAlbum.objects.all()
    serializer_class = SingerAlbumSerializer
    