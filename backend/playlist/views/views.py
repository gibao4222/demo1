from django.db import transaction, connection
from django.db.models import Max
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import PlaylistSerializer, PlaylistSongSerializer
from ..models import Playlist, PlaylistSong
import os
import uuid
from django.conf import settings
from rest_framework.views import APIView

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

    @action(detail=True, methods=['PUT'], url_path='change_playlists')
    def change_playlists(self, request, pk=None):
        playlist = self.get_object()
        
        data = request.data.copy()
        
        image_file = request.FILES.get('image')
        if image_file:
            # Kiểm tra định dạng file
            if not image_file.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                return Response({'error': 'Only PNG, JPG, JPEG files are allowed.'}, status=400)
            
            # Kiểm tra kích thước file (tối đa 5MB)
            if image_file.size > 5 * 1024 * 1024:
                return Response({'error': 'File size exceeds 5MB limit.'}, status=400)

            # Tạo tên file duy nhất để tránh trùng lặp
            file_extension = os.path.splitext(image_file.name)[1]
            file_name = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(settings.MEDIA_ROOT, 'image_playlist', file_name)

            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)

            # Lưu đường dẫn vào trường image
            data['image'] = f"{settings.MEDIA_URL}image_playlist/{file_name}"
        else:
            # Nếu không có file mới, giữ giá trị image hiện tại
            if 'image' not in data:
                data['image'] = playlist.image
                
        serializer = self.get_serializer(playlist, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='create_playlist')
    def create_playlist(self, request):
        with transaction.atomic():
            # Kiểm tra xem tên playlist đã tồn tại chưa
            playlist_name = request.data.get('name')
            if Playlist.objects.filter(name=playlist_name).exists():
                return Response(
                    {'error': 'Tên playlist đã tồn tại. Vui lòng chọn tên khác.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with connection.cursor() as cursor:
                if Playlist.objects.exists():
                    max_id = Playlist.objects.aggregate(Max('id'))['id__max']
                    next_id = max_id + 1 if max_id is not None else 1
                    cursor.execute(f"ALTER TABLE playlist_playlist AUTO_INCREMENT = {next_id};")
                else:
                    cursor.execute("ALTER TABLE playlist_playlist AUTO_INCREMENT = 1;")
            
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

    def retrieve(self, request, pk=None):
        playlist_songs = PlaylistSong.objects.filter(id_playlist=pk)
        serializer = self.get_serializer(playlist_songs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='create-playlist-song')
    def create_playlist_song(self, request):
        with transaction.atomic():
            # Kiểm tra xem bài hát đã tồn tại trong playlist chưa
            id_playlist = request.data.get('id_playlist')
            id_song = request.data.get('id_song')
            
            if PlaylistSong.objects.filter(id_playlist=id_playlist, id_song=id_song).exists():
                return Response(
                    {'error': 'Bài hát đã tồn tại trong playlist.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with connection.cursor() as cursor:
                if PlaylistSong.objects.exists():
                    max_id = PlaylistSong.objects.aggregate(Max('id'))['id__max']
                    next_id = max_id + 1 if max_id is not None else 1
                    cursor.execute(f"ALTER TABLE playlist_playlistsong AUTO_INCREMENT = {next_id};")
                else:
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
        try:
            playlist_song = self.get_object()
            playlist_song.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PlaylistSong.DoesNotExist:
            return Response(
                {"detail": "Không tìm thấy bài hát trong danh sách phát."},
                status=status.HTTP_404_NOT_FOUND
            )


class UserPlaylistListView(APIView):
    def get(self, request, user_id):
        try:
            playlists = Playlist.objects.filter(id_user=user_id, is_active=True)
            if not playlists.exists():
                return Response(
                    {"message":"Không tìm thấy playlist công khai nào cho user này."},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = PlaylistSerializer(playlists, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)