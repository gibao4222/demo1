from rest_framework import serializers
from ..models import History

class HistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = History
        fields = '__all__'
        read_only_fields = ['listen_date', 'play_duration', 'listen_count', 'id_genre', 'id_singer']