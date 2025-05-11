from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import SongSerializer
from ..models import Song

from singer.models import SingerSong, Singer
import requests
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch

import os
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.parsers import MultiPartParser
from ..fingerprint import get_audio_fingerprint, compare_fingerprints
import tempfile

import logging
from django.core.cache import cache
from rest_framework import status, viewsets


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.prefetch_related(
        Prefetch(
         'song_singer',
         queryset=SingerSong.objects.select_related('id_singer'),
         to_attr='singer_song'
        )
    )
    serializer_class = SongSerializer


    @action(detail=False, methods=['POST'], url_path='create-song')
    def create_song(self, request):
        # Nếu bảng rỗng, reset AUTO_INCREMENT
        if not Song.objects.exists():
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE song_song AUTO_INCREMENT = 1;")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'], url_path='change-song')
    def change_song(self, request, pk=None):
        song = self.get_object()
        serializer = self.get_serializer(song, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['DELETE'], url_path='delete-song')
    def delete_song(self, request, pk=None):
        song = self.get_object()
        song.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['POST'], url_path='search-by-audio')
    def search_song_by_audio(self, request):
        """
        Tìm kiếm bài hát bằng file audio
        """
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Lưu file tạm thời
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
                for chunk in audio_file.chunks():
                    tmp_file.write(chunk)
                tmp_path = tmp_file.name
            
            # Tạo fingerprint từ file gửi lên
            query_fp = get_audio_fingerprint(tmp_path)
            
            if query_fp is None:
                return Response({'error': 'Could not process audio file'}, status=status.HTTP_400_BAD_REQUEST)
            
            # So sánh với tất cả bài hát trong database
            songs = Song.objects.exclude(fingerprint__isnull=True).prefetch_related(
                Prefetch(
                    'song_singer',
                    queryset=SingerSong.objects.select_related('id_singer'),
                    to_attr='singer_song'
                )
            )
            
            results = []
            for song in songs:
                similarity = compare_fingerprints(query_fp, song.fingerprint)
                if similarity > 0.3:  # Ngưỡng similarity
                    serializer = self.get_serializer(song)
                    song_data = serializer.data
                    song_data['similarity'] = float(similarity)
                    results.append(song_data)
            
            # Sắp xếp theo độ tương đồng giảm dần
            results.sort(key=lambda x: x['similarity'], reverse=True)
            
            return Response({
                'success': True,
                'results': results[:1], 
                'message': 'Search completed successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'An error occurred during audio search'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        finally:
            # Đảm bảo xóa file tạm dù có lỗi hay không
            if 'tmp_path' in locals() and os.path.exists(tmp_path):
                os.unlink(tmp_path)
   

class SongListView(APIView):
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

class SongRelatedSinger (APIView):
     def get(self, request, pk=None):
        try:
            singer_ids = SingerSong.objects.filter(id_song=pk).values_list('id_singer', flat=True)
            song_ids = SingerSong.objects.filter(id_singer__in=singer_ids).values_list('id_song', flat=True).distinct()
            related_songs = Song.objects.filter(id__in=song_ids).prefetch_related(
                Prefetch(
                    'song_singer',
                    queryset=SingerSong.objects.select_related('id_singer'),
                    to_attr='singer_song'
                )
            )
            serializer = SongSerializer(related_songs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Song.DoesNotExist:
            return Response({"error": "Song not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
#Lấy danh sách bài hát theo ca sĩ
class SingerSongListView(APIView):
    def get(self, request, singer_id):
        try:
            singer_songs = SingerSong.objects.filter(id_singer=singer_id)
            song_ids = singer_songs.values_list('id_song', flat=True)
            songs = Song.objects.filter(id__in=song_ids).prefetch_related(
                Prefetch(
                    'song_singer',
                    queryset=SingerSong.objects.select_related('id_singer'),
                    to_attr='singer_song'
                )
            )
            serializer = SongSerializer(songs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

