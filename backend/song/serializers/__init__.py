from rest_framework import serializers
from ..models import Song

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'  # Hoặc liệt kê các trường cụ thể: ['id', 'name', 'popularity', ...]