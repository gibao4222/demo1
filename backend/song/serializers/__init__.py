from rest_framework import serializers
from ..models import Song
from singer.models import Singer

class SingerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Singer
        fields = ['id', 'name']

class SongSerializer(serializers.ModelSerializer):
    singers = serializers.SerializerMethodField()
    
    class Meta:
        model = Song
        fields = ['id', 'name', 'image', 'popularity', 'release_date', 'url_lyric', 'url_song', 'url_video', 'singers']
        
    def get_singers(self, obj):
        # Lấy danh sách nghệ sĩ thông qua bảng trung gian SingerSong
        singer_songs = obj.song_singers.all()  # Sử dụng related_name='song_singers'
        singers = [singer_song.id_singer for singer_song in singer_songs]
        return SingerSerializer(singers, many=True).data