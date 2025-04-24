from rest_framework import serializers
from ..models import Song

class SongSerializer(serializers.ModelSerializer):
    # Thêm trường album để lấy thông tin album từ mối quan hệ song_albums
    album = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = '__all__' 

    def get_album(self, obj):
        try:
            # Lấy bản ghi AlbumSong liên quan đến bài hát này
            album_song = obj.song_albums.first()  # Lấy bản ghi đầu tiên (mỗi bài hát chỉ thuộc 1 album)
            if album_song and album_song.id_album:
                # Trả về thông tin album dưới dạng dictionary mà không cần AlbumSerializer
                return {
                    "id": album_song.id_album.id,
                    "name": album_song.id_album.name,
                    "image": album_song.id_album.image,
                    "is_active": album_song.id_album.is_active,
                    "popularity": album_song.id_album.popularity,
                    "release_date": album_song.id_album.release_date,
                    "id_singer": album_song.id_album.id_singer.id  # Chỉ lấy ID của singer
                }
            return None
        except Exception as e:
            print(f"Error fetching album for song {obj.id}: {e}")
            return None