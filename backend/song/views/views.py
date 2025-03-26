from rest_framework import viewsets
from ..serializers import SongSerializer
from ..models import Song

import requests
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongListView(APIView):
    """
    API để lấy danh sách tất cả các bài hát
    """
    def get(self, request):
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

class StreamSongView(APIView):
    def get(self, request, song_id):
        try:
            song = Song.objects.get(pk=song_id)
            song_url = song.url_song  # URL của bài hát

            # Gửi request để lấy dữ liệu từ URL
            response = requests.get(song_url, stream=True)

            if response.status_code != 200:
                return Response({"error": "Cannot fetch the song"}, status=404)

            # Trả về StreamingHttpResponse để phát trực tiếp
            return StreamingHttpResponse(
                response.iter_content(chunk_size=1024),
                content_type="audio/mpeg",
            )

        except Song.DoesNotExist:
            return Response({"error": "Song not found"}, status=404)