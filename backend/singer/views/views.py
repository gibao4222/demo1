from rest_framework import viewsets
from ..serializers import SingerSerializer, SingerSongSerializer
from ..models import Singer, SingerSong

class SingerViewSet(viewsets.ModelViewSet):
    queryset = Singer.objects.all()
    serializer_class = SingerSerializer

class SingerSongViewSet(viewsets.ModelViewSet):
    queryset = SingerSong.objects.all()
    serializer_class = SingerSongSerializer