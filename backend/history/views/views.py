from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.models import User
from ..models import History
from song.models import Song
from singer.models import SingerSong
from ..serializers import HistorySerializer
import logging

logger = logging.getLogger(__name__)

class HistoryViewSet(viewsets.ModelViewSet):
    queryset = History.objects.all()
    serializer_class = HistorySerializer

    @action(detail=False, methods=['post'])
    def add_song_history(self, request):
        try:
            song_id = request.data.get('id_song')
            user_id = request.data.get('id_user')

            if not song_id or not user_id:
                return Response(
                    {"status": "error", "message": "song_id and user_id are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

          
            try:
                song = Song.objects.get(id=song_id)
            except Song.DoesNotExist:
                return Response({"status": "error", "message": "Song not found"}, status=404)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"status": "error", "message": "User not found"}, status=404)

            genre = song.id_genre
            singer = None
            singer_song = SingerSong.objects.filter(id_song=song).first()
            if singer_song:
                singer = singer_song.id_singer
            history = History.objects.filter(id_song=song, id_user=user).first()

            if history:
                history.listen_count = (history.listen_count or 0) + 1
                history.listen_date = timezone.now()
                history.play_duration = history.play_duration or 0
                history.id_genre = genre
                history.id_singer = singer
                history.save()
            else:

                history = History.objects.create(
                    id_song=song,
                    id_user=user,
                    listen_date=timezone.now(),
                    play_duration=0,
                    listen_count=1,
                    id_genre=genre,
                    id_singer=singer
                )

            return Response({
                "status": "success",
                "history_id": history.id,
                "song": song.name,
                "genre": genre.name if genre else None,
                "singer": singer.name if singer else None,
                "listen_count": history.listen_count,
            }, status=200)

        except Exception as e:
            logger.exception("Internal server error")
            return Response(
                {"status": "error", "message": "Internal server error"},
                status=500
            )
