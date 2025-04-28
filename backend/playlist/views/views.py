from django.db import transaction, connection
from django.db.models import Max, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers import PlaylistSerializer, PlaylistSongSerializer
from ..models import Playlist, PlaylistSong
from song.models import Song
import os
import uuid
import zmq
from django.conf import settings

from django.utils import timezone
import random
from rest_framework.views import APIView
APPLE_MUSIC_STYLE_IMAGES = [
"https://i.pinimg.com/736x/93/a6/19/93a61965a5b5de881ce78b62f1ea8364.jpg"
"https://i.pinimg.com/736x/26/4c/3b/264c3b4fbc20fdfb7d313fd42c1f7e77.jpg"
"https://i.pinimg.com/736x/72/4d/c3/724dc3be91f562881f0ee8a38fb04b8e.jpg"
"https://i.pinimg.com/736x/3c/c4/50/3cc450726b9aa4b99a1a902cc710340c.jpg"
"https://i.pinimg.com/736x/14/64/20/1464201164e8b32a8347645e859fc95f.jpg"
]




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
    

    # @action(detail=False, methods=['POST'], url_path='create-recommended-playlist')
    # def create_recommended_playlist(self, request):
    #     """Tạo playlist gợi ý dựa trên lịch sử nghe của người dùng."""
    #     # Lấy user_id từ request
    #     user_id = request.data.get('user_id')
    #     if not user_id:
    #         return Response(
    #             {'error': 'user_id là bắt buộc'},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    #     # Gửi yêu cầu đến mcp_server
    #     context = zmq.Context()
    #     socket = context.socket(zmq.REQ)
    #     socket.setsockopt(zmq.RCVTIMEO, 20000)  
    #     socket.connect("tcp://localhost:5555")
    #     socket.send_json({'user_id': user_id, 'action': 'get_recommendations'})

    #     # Nhận phản hồi từ mcp_server
    #     try:
    #         recommendations = socket.recv_json()
    #     except zmq.error.Again:
    #         socket.close()
    #         return Response(
    #             {'error': 'Hết thời gian chờ phản hồi từ mcp_server'},
    #             status=status.HTTP_504_GATEWAY_TIMEOUT
    #         )
    #     finally:
    #         socket.close()

    #     # Kiểm tra lỗi trong phản hồi
    #     if 'error' in recommendations:
    #         return Response(
    #             recommendations,
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #         )

    #     # Lấy danh sách tên bài hát được gợi ý và chuẩn hóa
    #     recommended_song_names = [name.encode('utf-8').decode('utf-8').replace('\xa0', ' ').strip().lower() for name in recommendations.get('recommended_song_names', [])]
    #     print(f"Bài hát được gợi ý từ mcp_server: {recommended_song_names}")
    #     print(f"Bài hát (dạng thô): {[repr(name) for name in recommended_song_names]}")
    #     if not recommended_song_names:
    #         return Response(
    #             {'error': 'Không nhận được bài hát gợi ý nào'},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    #     # Sử dụng Q objects để tìm kiếm không phân biệt hoa thường
    #     query = Q()
    #     for song_name in recommended_song_names:
    #         query |= Q(name__iexact=song_name)

    #     recommended_songs = Song.objects.filter(query)
    #     print(f"Các bài hát được tìm thấy: {list(recommended_songs.values('name'))}")
    #     song_ids = list(recommended_songs.values_list('id', flat=True))
    #     print(f"ID bài hát: {song_ids}")

    #     # Kiểm tra nếu không tìm thấy bài hát trong cơ sở dữ liệu
    #     if not song_ids:
    #         return Response(
    #             {
    #                 'error': 'Không tìm thấy bài hát gợi ý nào trong cơ sở dữ liệu',
    #                 'recommended_songs': recommended_song_names
    #             },
    #             status=status.HTTP_404_NOT_FOUND
    #         )

    #     # Tạo playlist mới
    #     playlist_data = {
    #         'name': f"Danh sách gợi ý - {timezone.now().strftime('%Y-%m-%d')}",
    #         'create_date': timezone.now().date(),
    #         'is_active': False,
    #         'id_user': user_id,
    #     }
    #     playlist_serializer = PlaylistSerializer(data=playlist_data)
    #     playlist_serializer.is_valid(raise_exception=True)
    #     playlist = playlist_serializer.save()
    #     print(f"Đã tạo playlist: {playlist_serializer.data}")

    #     # Thêm các bài hát được gợi ý vào playlist
    #     songs_added_count = 0
    #     for song_id in song_ids:
    #         playlist_song_data = {
    #             'id_playlist': playlist.id,
    #             'id_song': song_id,
    #         }
    #         playlist_song_serializer = PlaylistSongSerializer(data=playlist_song_data)
    #         if playlist_song_serializer.is_valid():
    #             playlist_song_serializer.save()
    #             songs_added_count += 1
    #             print(f"Đã thêm bài hát ID {song_id} vào playlist")
    #         else:
    #             print(f"Lỗi xác thực cho song_id {song_id}: {playlist_song_serializer.errors}")
    #             return Response(
    #                 {
    #                     'error': f'Không thể thêm song_id {song_id} vào playlist',
    #                     'validation_errors': playlist_song_serializer.errors
    #                 },
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #     # Trả về phản hồi
    #     return Response(
    #         {
    #             'playlist': playlist_serializer.data,
    #             'songs_added': songs_added_count,
    #         },
    #         status=status.HTTP_201_CREATED
    #     )
                 
           

    @action(detail=False, methods=['POST'], url_path='create-recommended-playlist')
    def create_recommended_playlist(self, request):
        """Tạo playlist gợi ý dựa trên lịch sử nghe của người dùng."""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id là bắt buộc'},
                status=status.HTTP_400_BAD_REQUEST
            )

        context = zmq.Context()
        socket = context.socket(zmq.REQ)
        socket.setsockopt(zmq.RCVTIMEO, 20000)
        socket.connect("tcp://localhost:5555")
        socket.send_json({'user_id': user_id, 'action': 'get_recommendations'})

        try:
            recommendations = socket.recv_json()
        except zmq.error.Again:
            socket.close()
            return Response(
                {'error': 'Hết thời gian chờ phản hồi từ mcp_server'},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        finally:
            socket.close()

        if 'error' in recommendations:
            return Response(
                recommendations,
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        recommended_song_names = [name.encode('utf-8').decode('utf-8').replace('\xa0', ' ').strip().lower() for name in recommendations.get('recommended_song_names', [])]
        print(f"Bài hát được gợi ý từ mcp_server: {recommended_song_names}")
        print(f"Bài hát (dạng thô): {[repr(name) for name in recommended_song_names]}")
        if not recommended_song_names:
            return Response(
                {'error': 'Không nhận được bài hát gợi ý nào'},
                status=status.HTTP_400_BAD_REQUEST
            )

        query = Q()
        for song_name in recommended_song_names:
            query |= Q(name__iexact=song_name)

        recommended_songs = Song.objects.filter(query)
        print(f"Các bài hát được tìm thấy: {list(recommended_songs.values('name'))}")
        song_ids = list(recommended_songs.values_list('id', flat=True))
        print(f"ID bài hát: {song_ids}")

        if not song_ids:
            return Response(
                {
                    'error': 'Không tìm thấy bài hát gợi ý nào trong cơ sở dữ liệu',
                    'recommended_songs': recommended_song_names
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Chọn ngẫu nhiên một hình ảnh theo phong cách Apple Music
        random_image = random.choice(APPLE_MUSIC_STYLE_IMAGES)

        # Tạo playlist mới
        playlist_data = {
            'name': f"Danh sách gợi ý - {timezone.now().strftime('%Y-%m-%d')}",
            'create_date': timezone.now().date(),
            'is_active': False,
            'id_user': user_id,
            'image': random_image,  # Sử dụng hình ảnh ngẫu nhiên giống phong cách Apple Music
        }
        playlist_serializer = PlaylistSerializer(data=playlist_data)
        playlist_serializer.is_valid(raise_exception=True)
        playlist = playlist_serializer.save()
        print(f"Đã tạo playlist: {playlist_serializer.data}")

        songs_added_count = 0
        for song_id in song_ids:
            playlist_song_data = {
                'id_playlist': playlist.id,
                'id_song': song_id,
            }
            playlist_song_serializer = PlaylistSongSerializer(data=playlist_song_data)
            if playlist_song_serializer.is_valid():
                playlist_song_serializer.save()
                songs_added_count += 1
                print(f"Đã thêm bài hát ID {song_id} vào playlist")
            else:
                print(f"Lỗi xác thực cho song_id {song_id}: {playlist_song_serializer.errors}")
                return Response(
                    {
                        'error': f'Không thể thêm song_id {song_id} vào playlist',
                        'validation_errors': playlist_song_serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            {
                'playlist': playlist_serializer.data,
                'songs_added': songs_added_count,
            },
            status=status.HTTP_201_CREATED
        )

    

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

