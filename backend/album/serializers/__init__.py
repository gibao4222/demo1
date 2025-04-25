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

    def validate_id_song(self, value):
        # Kiểm tra xem bài hát đã được liên kết với album nào chưa
        if self.instance is None:  # Chỉ kiểm tra khi tạo mới, không phải khi cập nhật
            if AlbumSong.objects.filter(id_song=value).exists():
                raise serializers.ValidationError("Bài hát này đã được liên kết với một album khác.")
        return value
    
    class Meta:
        model = AlbumSong
        fields = '__all__'