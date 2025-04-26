# history/utils.py
from datetime import timedelta
from django.utils import timezone
from .models import History
from song.models import Song
from genre.models import Genre
from singer.models import Singer

def get_user_listening_history(user_id, days=7):
    time_threshold = timezone.now() - timedelta(days=days)
    history = History.objects.filter(
        id_user=user_id,
        listen_date__gte=time_threshold
    ).select_related('id_song', 'id_genre', 'id_singer')

    listening_data = []
    for entry in history:
        listening_data.append({
            'song_name': entry.id_song.name,
            'song_id': entry.id_song.id,
            'genre': entry.id_genre.name if entry.id_genre else None,
            'singer': entry.id_singer.name if entry.id_singer else None,
            'play_duration': entry.play_duration,
            'listen_count': entry.listen_count,
            'listen_date': entry.listen_date.isoformat(),
        })
    return listening_data

def summarize_listening_history(user_id, days=7):
    history = get_user_listening_history(user_id, days)

    # Tổng hợp thông tin chi tiết cho từng bài hát
    song_stats = {}
    for entry in history:
        song_name = entry['song_name']
        if song_name not in song_stats:
            song_stats[song_name] = {
                'listen_count': 0,
                'play_duration': 0,
                'genre': entry['genre'],
                'singer': entry['singer']
            }
        song_stats[song_name]['listen_count'] += entry['listen_count']
        song_stats[song_name]['play_duration'] += entry['play_duration']

    # Lấy thông tin thể loại và ca sĩ phổ biến
    genre_counts = {}
    singer_counts = {}
    for entry in history:
        genre = entry['genre']
        singer = entry['singer']
        if genre:
            genre_counts[genre] = genre_counts.get(genre, 0) + entry['listen_count']
        if singer:
            singer_counts[singer] = singer_counts.get(singer, 0) + entry['listen_count']

    favorite_genre = max(genre_counts, key=genre_counts.get, default=None) if genre_counts else None
    favorite_singer = max(singer_counts, key=singer_counts.get, default=None) if singer_counts else None

    return {
        'song_stats': song_stats,  # Trả về dictionary với thông tin chi tiết
        'favorite_genre': favorite_genre,
        'favorite_singer': favorite_singer,
    }