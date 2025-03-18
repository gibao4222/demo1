from rest_framework import viewsets
from ..serializers import PlaylistSerializer, PlaylistSongSerializer
from ..models import Playlist, PlaylistSong

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

class PlaylistSongViewSet(viewsets.ModelViewSet):
    queryset = PlaylistSong.objects.all()
    serializer_class = PlaylistSongSerializer