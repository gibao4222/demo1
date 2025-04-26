from django.shortcuts import render
from django.http import HttpResponse

from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse
from .models import Song
from .serializers import SongSerializer
import os

def song_list(request):
    return HttpResponse("List of songs")

class SongListView(APIView):
    def get(self, request):
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

class StreamSongView(APIView):
    def get(self, request, song_id):
        try:
            song = Song.objects.get(id=song_id)
            return FileResponse(song.file.open(), content_type="audio/mpeg")
        except Song.DoesNotExist:
            return Response({"error": "Song not found"}, status=404)

