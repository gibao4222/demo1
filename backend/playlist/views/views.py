from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import PlaylistSerializer, PlaylistSongSerializer
from ..models import Playlist, PlaylistSong
from django.db import connection

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

    @action(detail=True, methods=['PUT'], url_path='change_playlists')
    def change_playlists(self, request, pk=None):
        playlist = self.get_object()
        serializer = self.get_serializer(playlist, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='create_playlist')
    def create_playlist(self, request):
        # Kiểm tra xem bảng có dữ liệu không
        if not Playlist.objects.exists():
            # Nếu bảng rỗng, reset sequence
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE playlist_playlist AUTO_INCREMENT = 1;")

        # Tạo bản ghi mới
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['DELETE'], url_path='delete_playlists')
    def delete_playlists(self, request, pk=None):
        playlist = self.get_object()
        playlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PlaylistSongViewSet(viewsets.ModelViewSet):
    queryset = PlaylistSong.objects.all()
    serializer_class = PlaylistSongSerializer

    @action(detail=False, methods=['POST'], url_path='create-playlist-song')
    def create_playlist_song(self, request):
        if not PlaylistSong.objects.exists():
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE playlist_playlistsong AUTO_INCREMENT = 1;")
                
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'], url_path='change-playlist-song')
    def change_playlist_song(self, request, pk=None):
        playlist_song = self.get_object()
        serializer = self.get_serializer(playlist_song, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['DELETE'], url_path='delete-playlist-song')
    def delete_playlist_song(self, request, pk=None):
        playlist_song = self.get_object()
        playlist_song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)