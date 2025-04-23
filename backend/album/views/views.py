from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import AlbumSerializer, AlbumSongSerializer
from ..models import Album, AlbumSong


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

    @action(detail=False, methods=['POST'], url_path='create-album')
    def create_album(self, request):
        if not Album.objects.exists():
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE album_album AUTO_INCREMENT = 1;")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'], url_path='change-album')
    def change_album(self, request, pk=None):
        album = self.get_object()
        serializer = self.get_serializer(album, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['DELETE'], url_path='delete-album')
    def delete_album(self, request, pk=None):
        album = self.get_object()
        album.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#=================== AKBUM-SONG =========================

class AlbumSongViewSet(viewsets.ModelViewSet):
    queryset = AlbumSong.objects.all()
    serializer_class = AlbumSongSerializer

    def get_queryset(self):
        # Lấy tham số id_album từ query string
        album_id = self.request.query_params.get('id_album', None)
        queryset = AlbumSong.objects.all()  # Lấy tất cả dữ liệu ban đầu

        # Nếu có tham số id_album, lọc dữ liệu
        if album_id is not None:
            try:
                queryset = queryset.filter(id_album=album_id)
            except ValueError:
                # Nếu id_album không phải là số hợp lệ, trả về queryset rỗng
                queryset = AlbumSong.objects.none()

        return queryset

    @action(detail=False, methods=['POST'], url_path='create-album-song')
    def create_album_song(self, request):
        if not AlbumSong.objects.exists():
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE album_albumsong AUTO_INCREMENT = 1;")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'], url_path='change-album-song')
    def change_album_song(self, request, pk=None):
        album_song = self.get_object()
        serializer = self.get_serializer(album_song, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['DELETE'], url_path='delete-album-song')
    def delete_album_song(self, request, pk=None):
        album_song = self.get_object()
        album_song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)