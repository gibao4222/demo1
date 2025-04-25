from rest_framework import serializers
from ..models import Song
from singer.serializers import SingerSerializer
class SongSerializer(serializers.ModelSerializer):
    artists = serializers.SerializerMethodField()
    class Meta:
        model = Song
        fields = '__all__' 
    def get_artists(self, obj):
        return [
            {
                'id': ss.id_singer.id,
                'name': ss.id_singer.name
            }
            for ss in getattr(obj, 'singer_song', [])
        ]
   