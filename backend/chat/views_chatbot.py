from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from singer.models import Singer
from song.models import Song
from genre.models import Genre
from singer.models import SingerSong
import re
import requests

class ChatViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['POST'], url_path='chat')
    def chat(self, request):
        user_id = request.data.get('user_id')
        query = request.data.get('query', '').strip()

        if not user_id or not query:
            return Response({"response": "Vui lòng cung cấp user_id và query."}, status=400)

        # Phân tích truy vấn để tìm ca sĩ và thể loại
        singer_name = None
        genre_name = None

        # Tìm ca sĩ trong truy vấn (ví dụ: "ca sĩ 10cm")
        singer_match = re.search(r"ca sĩ (\w+)", query, re.IGNORECASE)
        if singer_match:
            singer_name = singer_match.group(1)

        # Tìm thể loại trong truy vấn (ví dụ: "bài hát pop")
        genre_match = re.search(r"bài hát (\w+)", query, re.IGNORECASE)
        if genre_match:
            genre_name = genre_match.group(1)

        # Truy vấn database
        if singer_name and genre_name:
            singer = Singer.objects.filter(name__iexact=singer_name).first()
            if singer:
                genre = Genre.objects.filter(name__iexact=genre_name).first()
                if genre:
                    songs = Song.objects.filter(
                        id_genre=genre,
                        singersinger__id_singer=singer
                    )[:5]  # Lấy tối đa 5 bài

                    if songs.exists():
                        song_list = [f"- {song.name} (released: {song.release_date})" for song in songs]
                        response = f"Songs {genre_name} by singer {singer_name}:\n" + "\n".join(song_list)
                        return Response({"response": response})

        # Nếu không tìm thấy trong database, gọi Ollama
        try:
            ollama_response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama3.2",
                    "prompt": f"Find songs in the genre {genre_name} by singer {singer_name}. Answer briefly, listing the song title and year of release if available.",
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "top_k": 40
                    }
                }
            )
            ollama_response.raise_for_status()
            response_text = ollama_response.json().get("response", "Không tìm thấy thông tin.")
            return Response({"response": response_text})
        except Exception as e:
            return Response({"response": f"Lỗi khi gọi mô hình ngôn ngữ: {str(e)}"}, status=500)