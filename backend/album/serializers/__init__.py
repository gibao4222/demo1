from rest_framework import serializers
from ..models import Album, AlbumSong, SingerAlbum

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'
        
class AlbumSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlbumSong
        fields = '__all__'
        
class SingerAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = SingerAlbum
        fields = '__all___'