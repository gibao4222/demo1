from rest_framework import serializers
from ..models import Album, AlbumSong
from singer.serializers import SingerSerializer
from song.serializers import SongSerializer

class AlbumSerializer(serializers.ModelSerializer):
    id_singer = SingerSerializer()
    class Meta:
        model = Album
        fields = '__all__'
        
class AlbumSongSerializer(serializers.ModelSerializer):
    id_song = SongSerializer()  # Lấy thông tin chi tiết của Song
    id_album = serializers.StringRelatedField()  # Hiển thị tên album thay vì ID
    
    class Meta:
        model = AlbumSong
        fields = '__all__'