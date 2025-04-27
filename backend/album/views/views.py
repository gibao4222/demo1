from django.db import connection, transaction
from django.db.models import Max
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import AlbumSerializer, AlbumSongSerializer
from ..models import Album, AlbumSong

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

    def get_queryset(self):
        # Lấy tham số isInLibrary từ query string
        is_in_library = self.request.query_params.get('isInLibrary', None)
        queryset = Album.objects.all()  # Lấy tất cả dữ liệu ban đầu

        # Nếu có tham số isInLibrary, lọc dữ liệu
        if is_in_library is not None:
            try:
                # Chuyển đổi giá trị isInLibrary thành boolean
                is_in_library_bool = is_in_library.lower() == 'true'
                queryset = queryset.filter(isInLibrary=is_in_library_bool)
            except ValueError:
                # Nếu giá trị không hợp lệ, trả về queryset rỗng
                queryset = Album.objects.none()

        return queryset

    @action(detail=False, methods=['POST'], url_path='create-album')
    def create_album(self, request):
        with transaction.atomic():
            # Kiểm tra xem tên album đã tồn tại chưa
            album_name = request.data.get('name')
            if Album.objects.filter(name=album_name).exists():
                return Response(
                    {'error': 'Tên album đã tồn tại. Vui lòng chọn tên khác.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with connection.cursor() as cursor:
                if Album.objects.exists():
                    max_id = Album.objects.aggregate(Max('id'))['id__max']
                    next_id = max_id + 1 if max_id is not None else 1
                    cursor.execute(f"ALTER TABLE album_album AUTO_INCREMENT = {next_id};")
                else:
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

    @action(detail=True, methods=['PUT'], url_path='update-library-status')
    def update_library_status(self, request, pk=None):
        album = self.get_object()
        is_in_library = request.data.get('isInLibrary', None)
        if is_in_library is None:
            return Response(
                {'error': 'Vui lòng cung cấp giá trị isInLibrary'},
                status=status.HTTP_400_BAD_REQUEST
            )
        album.isInLibrary = is_in_library
        album.save()
        serializer = self.get_serializer(album)
        return Response(serializer.data)

class AlbumSongViewSet(viewsets.ModelViewSet):
    queryset = AlbumSong.objects.all()
    serializer_class = AlbumSongSerializer

    def get_queryset(self):
        album_id = self.request.query_params.get('id_album', None)
        queryset = AlbumSong.objects.all()

        # Nếu có tham số id_album, lọc dữ liệu
        if album_id is not None:
            try:
                queryset = queryset.filter(id_album=album_id)
            except ValueError:
                queryset = AlbumSong.objects.none()

        return queryset

    @action(detail=False, methods=['POST'], url_path='create-album-song')
    def create_album_song(self, request):
        with transaction.atomic():
            id_song = request.data.get('id_song')
            albumsong_name = request.data.get('name')

            # Kiểm tra bài hát đã được liên kết với album khác chưa
            if id_song and AlbumSong.objects.filter(id_song=id_song).exists():
                return Response(
                    {"error": "Bài hát này đã được liên kết với một album khác."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Kiểm tra tên album song đã tồn tại chưa
            if albumsong_name and AlbumSong.objects.filter(name=albumsong_name).exists():
                return Response(
                    {"error": "Tên album song đã tồn tại. Vui lòng chọn tên khác."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with connection.cursor() as cursor:
                if AlbumSong.objects.exists():
                    max_id = AlbumSong.objects.aggregate(Max('id'))['id__max'] or 0
                    next_id = max_id + 1
                    cursor.execute(f"ALTER TABLE album_albumsong AUTO_INCREMENT = {next_id};")
                else:
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