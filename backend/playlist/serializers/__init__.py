from rest_framework import serializers
from ..models import Playlist, PlaylistSong
from song.models import Song

class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'

class PlaylistSongSerializer(serializers.ModelSerializer):
    # Biểu diễn id_playlist và id_song dưới dạng ID (mặc định của ForeignKey)
    id_playlist = serializers.PrimaryKeyRelatedField(queryset=Playlist.objects.all())
    id_song = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all())

    # class Meta:
    #     model = PlaylistSong
    #     fields = ['id', 'id_playlist', 'id_song', 'date_added']

class PlaylistSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistSong
        fields = '__all__'