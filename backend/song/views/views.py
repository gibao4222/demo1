from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import SongSerializer
from ..models import Song

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

    @action(detail=False, methods=['POST'], url_path='create-song')
    def create_song(self, request):
        # Nếu bảng rỗng, reset AUTO_INCREMENT
        if not Song.objects.exists():
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE song_song AUTO_INCREMENT = 1;")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'], url_path='change-song')
    def change_song(self, request, pk=None):
        song = self.get_object()
        serializer = self.get_serializer(song, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['DELETE'], url_path='delete-song')
    def delete_song(self, request, pk=None):
        song = self.get_object()
        song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)