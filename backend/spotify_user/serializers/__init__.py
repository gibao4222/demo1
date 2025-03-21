from rest_framework import serializers
from ..models import SpotifyUser, UserAlbum, UserSinger

class SpotifyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpotifyUser
        fields = '__all__'
        
class UserAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAlbum
        fields = '__all__'
        
class UserSingerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSinger
        fields = '__all__'
        