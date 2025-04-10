from rest_framework import serializers
from ..models import SpotifyUser, UserAlbum, UserSinger, UserSong, UserFollowing
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}
        
        
class SpotifyUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = SpotifyUser
        fields = ['id','email', 'username', 'user', 'vip', 'role']
        extra_kwargs = {'vip': {'read_only': True}, 'role': {'read_only': True}}
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password']
        )
        spotify_user = SpotifyUser.objects.create(
            user=user,
            **validated_data
        )
        return spotify_user
        
class UserAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAlbum
        fields = '__all__'
        
class UserSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSong
        fields = ['id_user', 'id_song']

class UserSingerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSinger
        fields = ['id_user', 'id_singer']

class UserFollowingSerializer(serializers.ModelSerializer):
    follower = SpotifyUserSerializer(read_only=True)
    following = SpotifyUserSerializer(read_only=True)

    class Meta:
        model = UserFollowing
        fields = ['follower', 'following', 'created_at']
        
        
