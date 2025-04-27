from rest_framework import viewsets
from spotify_user.serializers import SpotifyUserSerializer
from singer.serializers import SingerSerializer
from song.serializers import SongSerializer
from singer.models import Singer
from song.models import Song
from rest_framework import generics
from unidecode import unidecode
from django.contrib.auth.models import User
from playlist.models import Playlist
from album.models import Album
from playlist.serializers import PlaylistSerializer
from album.serializers import AlbumSerializer
from django.db.models import Q
from ..serializers import SpotifyUserSerializer, UserAlbumSerializer, UserSingerSerializer, UserSongSerializer, UserFollowingSerializer
from ..models import SpotifyUser, UserAlbum, UserSinger, UserSong, UserFollowing
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class SpotifyUserViewSet(viewsets.ModelViewSet):
    queryset = SpotifyUser.objects.all()
    serializer_class = SpotifyUserSerializer

class UserAlbumViewSet(viewsets.ModelViewSet):
    queryset = UserAlbum.objects.all()
    serializer_class = UserAlbumSerializer

class UserSingerViewSet(viewsets.ModelViewSet):
    queryset = UserSinger.objects.all()
    serializer_class = UserSingerSerializer








# API Thích/Hủy thích bài hát
class LikeSongView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        song_id = request.query_params.get('song_id')

        if not song_id:
            return Response({"lỗi": "song_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        is_liked = UserSong.objects.filter(id_user=user_id, id_song=song_id).exists()
        return Response({"is_liked": is_liked}, status=status.HTTP_200_OK)
 

    def post(self, request):
        user_id = request.user.id
        song_id = request.data.get('song_id')

        if not song_id:
            return Response({"lỗi": "song_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem song_id có tồn tại trong bảng song_song hay không
        if not Song.objects.filter(id=song_id).exists():
            return Response({"lỗi": "Không tìm thấy bài hát"}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra xem người dùng đã thích bài hát này chưa
        if UserSong.objects.filter(id_user=user_id, id_song=song_id).exists():
            return Response({"lỗi": "Bạn đã thích bài hát này"}, status=status.HTTP_400_BAD_REQUEST)

        # Nếu bài hát tồn tại và người dùng chưa thích, tiến hành lưu
        data = {'id_user': user_id, 'id_song': song_id}
        serializer = UserSongSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"thông báo": "Thích bài hát thành công"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user_id = request.user.id
        song_id = request.query_params.get('song_id')

        if not song_id:
            return Response({"lỗi": "song_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            like = UserSong.objects.get(id_user=user_id, id_song=song_id)
            like.delete()
            return Response({"thông báo": "Hủy thích bài hát thành công"}, status=status.HTTP_200_OK)
        except UserSong.DoesNotExist:
            return Response({"lỗi": "Bạn chưa thích bài hát này"}, status=status.HTTP_404_NOT_FOUND)

# Tìm kiếm danh sách phát
class PlaylistSearchView(generics.ListAPIView):
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        search_term = self.request.query_params.get('search', None)
        if not search_term:
            return Playlist.objects.none()

        search_term_no_diacritics = unidecode(search_term).lower().replace(" ", "")
        return Playlist.objects.filter(name__icontains=search_term_no_diacritics)

# Tìm kiếm album
class AlbumSearchView(generics.ListAPIView):
    serializer_class = AlbumSerializer

    def get_queryset(self):
        search_term = self.request.query_params.get('search', None)
        if not search_term:
            return Album.objects.none()

        search_term_no_diacritics = unidecode(search_term).lower().replace(" ", "")
        return Album.objects.filter(name__icontains=search_term_no_diacritics)


# Tìm kiếm bài hát
class SongSearchView(generics.ListAPIView):
    serializer_class = SongSerializer

    def get_queryset(self):
        search_term = self.request.query_params.get('search', None)
        if not search_term:
            return Song.objects.none()

        search_term_no_diacritics = unidecode(search_term).lower().replace(" ", "")
        return Song.objects.filter(
            Q(name__icontains=search_term_no_diacritics) |
            Q(song_singers__id_singer__name__icontains=search_term_no_diacritics)
        ).prefetch_related('song_singers__id_singer').distinct()
    


# Tìm kiếm nghệ sĩ
class SingerSearchView(generics.ListAPIView):
    serializer_class = SingerSerializer

    def get_queryset(self):
        search_term = self.request.query_params.get('search', None)
        if not search_term:
            return Singer.objects.none()

        # Chuyển search_term thành không dấu, viết thường, và loại bỏ khoảng trắng
        search_term_no_diacritics = unidecode(search_term).lower().replace(" ", "")

        # Lấy tất cả nghệ sĩ
        all_singers = Singer.objects.all()

        # Lọc thủ công: so sánh name không dấu với search_term không dấu
        filtered_singers = [
            singer for singer in all_singers
            if search_term_no_diacritics in unidecode(singer.name).lower().replace(" ", "")
        ]

        return filtered_singers



class UserSearchView(generics.ListAPIView):
    serializer_class = SpotifyUserSerializer

    def get_queryset(self):
        search_term = self.request.query_params.get('search', None)
        
        if not search_term:
            return SpotifyUser.objects.none()

        # Chuyển search_term thành không dấu, viết thường và loại bỏ khoảng trắng thừa
        search_term_no_diacritics = unidecode(search_term).lower().strip()

        # Lấy tất cả users
        all_users = SpotifyUser.objects.filter(is_active=True)  

        # Lọc thủ công: so sánh username không dấu với search_term không dấu
        filtered_users = [
            user for user in all_users
            if search_term_no_diacritics in unidecode(user.username).lower()
        ]

        return filtered_users

    # def get(self, request, *args, **kwargs):

    #     queryset = self.get_queryset()
    #     serializer = self.serializer_class(queryset, many=True)
    #     return Response({
    #         "results": serializer.data,
    #         "count": len(serializer.data)
    #     })



# API Theo dõi/Hủy theo dõi Nghệ sĩ
class FollowArtistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Kiểm tra trạng thái theo dõi nghệ sĩ"""
        user_id = request.user.id
        singer_id = request.query_params.get('singer_id')

        if not singer_id:
            return Response({"lỗi": "singer_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        is_following = UserSinger.objects.filter(id_user=user_id, id_singer=singer_id).exists()
        return Response({"is_following": is_following}, status=status.HTTP_200_OK)

    def post(self, request):
        user_id = request.user.id
        singer_id = request.data.get('singer_id')

        if not singer_id:
            return Response({"lỗi": "singer_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        if UserSinger.objects.filter(id_user=user_id, id_singer=singer_id).exists():
            return Response({"lỗi": "Bạn đã theo dõi nghệ sĩ này"}, status=status.HTTP_400_BAD_REQUEST)

        data = {'id_user': user_id, 'id_singer': singer_id}
        serializer = UserSingerSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"thông báo": "Theo dõi nghệ sĩ thành công"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user_id = request.user.id
        singer_id = request.query_params.get('singer_id')

        if not singer_id:
            return Response({"lỗi": "singer_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            follow = UserSinger.objects.get(id_user=user_id, id_singer=singer_id)
            follow.delete()
            return Response({"thông báo": "Hủy theo dõi nghệ sĩ thành công"}, status=status.HTTP_200_OK)
        except UserSinger.DoesNotExist:
            return Response({"lỗi": "Bạn chưa theo dõi nghệ sĩ này"}, status=status.HTTP_404_NOT_FOUND)




# API Theo dõi/Hủy theo dõi Người dùng

class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Theo dõi người dùng dựa vào ID"""
        try:
            follower = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        following_id = request.data.get('following_id')

        if not following_id:
            return Response({"lỗi": "following_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        # Chuyển đổi following_id thành số nguyên
        try:
            following_id = int(following_id)
        except (ValueError, TypeError):
            print(f"following_id không hợp lệ: {following_id}, type: {type(following_id)}")
            return Response({"lỗi": "following_id phải là một số nguyên"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra tự theo dõi
        print(f"follower.id: {follower.id}, following_id: {following_id}, type(follower.id): {type(follower.id)}, type(following_id): {type(following_id)}")
        if follower.id == following_id:
            return Response({"lỗi": "Bạn không thể tự theo dõi chính mình"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            following = SpotifyUser.objects.get(id=following_id)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Người dùng cần theo dõi không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        if UserFollowing.objects.filter(follower=follower, following=following).exists():
            return Response({"lỗi": "Bạn đã theo dõi người dùng này"}, status=status.HTTP_400_BAD_REQUEST)

        follow = UserFollowing.objects.create(follower=follower, following=following)
        serializer = UserFollowingSerializer(follow)
        return Response({"thông_báo": "Theo dõi người dùng thành công", "dữ_liệu": serializer.data}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Hủy theo dõi người dùng dựa vào ID"""
        try:
            follower = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        following_id = request.query_params.get('following_id')

        if not following_id:
            return Response({"lỗi": "following_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            following_id = int(following_id)
        except (ValueError, TypeError):
            print(f"following_id không hợp lệ: {following_id}, type: {type(following_id)}")
            return Response({"lỗi": "following_id phải là một số nguyên"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            follow = UserFollowing.objects.get(follower=follower, following__id=following_id)
            follow.delete()
            return Response({"thông_báo": "Hủy theo dõi người dùng thành công"}, status=status.HTTP_200_OK)
        except UserFollowing.DoesNotExist:
            return Response({"lỗi": "Bạn chưa theo dõi người dùng này"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        """Kiểm tra trạng thái theo dõi của người dùng hiện tại với một người dùng khác"""
        try:
            follower = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({"lỗi": "user_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            print(f"user_id không hợp lệ: {user_id}, type: {type(user_id)}")
            return Response({"lỗi": "user_id phải là một số nguyên"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            following = SpotifyUser.objects.get(id=user_id)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Người dùng không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        is_following = UserFollowing.objects.filter(follower=follower, following=following).exists()
        return Response({"is_following": is_following}, status=status.HTTP_200_OK)






class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Lấy thông tin người dùng hiện tại"""
        try:
            # Lấy SpotifyUser tương ứng với người dùng hiện tại
            spotify_user = SpotifyUser.objects.get(user=request.user)
            serializer = SpotifyUserSerializer(spotify_user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except SpotifyUser.DoesNotExist:
            return Response(
                {"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"},
                status=status.HTTP_404_NOT_FOUND
            )