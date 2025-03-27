from rest_framework import serializers
from ..models import Singer, SingerSong

class SingerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Singer
        fields = '__all__'
        
class SingerSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = SingerSong
        fields = '__all__'