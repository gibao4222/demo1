from rest_framework import viewsets
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

    def post(self, request):
        user_id = request.user.id
        song_id = request.data.get('song_id')

        if not song_id:
            return Response({"lỗi": "song_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        if UserSong.objects.filter(id_user=user_id, id_song=song_id).exists():
            return Response({"lỗi": "Bạn đã thích bài hát này"}, status=status.HTTP_400_BAD_REQUEST)

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

# API Theo dõi/Hủy theo dõi Nghệ sĩ
class FollowArtistView(APIView):
    permission_classes = [IsAuthenticated]

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
        # Ánh xạ request.user sang SpotifyUser
        try:
            follower = SpotifyUser.objects.get(user=request.user)
        except SpotifyUser.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy SpotifyUser cho người dùng này"}, status=status.HTTP_404_NOT_FOUND)

        following_id = request.data.get('following_id')

        if not following_id:
            return Response({"lỗi": "following_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

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
        return Response({"thông báo": "Theo dõi người dùng thành công", "dữ liệu": serializer.data}, status=status.HTTP_201_CREATED)

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
            follow = UserFollowing.objects.get(follower=follower, following__id=following_id)
            follow.delete()
            return Response({"thông báo": "Hủy theo dõi người dùng thành công"}, status=status.HTTP_200_OK)
        except UserFollowing.DoesNotExist:
            return Response({"lỗi": "Bạn chưa theo dõi người dùng này"}, status=status.HTTP_404_NOT_FOUND)