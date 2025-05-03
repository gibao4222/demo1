import os
import sys
import django
import zmq
import json
from datetime import datetime, timedelta
import logging
import random

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Thêm đường dẫn dự án vào sys.path
BASE_DIR = '/var/www/demo1/backend'
sys.path.append(BASE_DIR)

# Kiểm tra sys.path
logger.debug(f"sys.path: {sys.path}")

# Thiết lập DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
logger.debug(f"DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}")

# Kiểm tra file settings có tồn tại không
try:
    from myproject import settings
    logger.debug("Tìm thấy module myproject.settings")
except ImportError as e:
    logger.error(f"Lỗi: Không tìm thấy module myproject.settings. Kiểm tra đường dẫn và tên file settings. Lỗi: {e}")
    sys.exit(1)

# Khởi tạo Django
try:
    django.setup()
    logger.debug("Khởi tạo Django thành công")
except Exception as e:
    logger.error(f"Lỗi khi khởi tạo Django: {e}")
    sys.exit(1)

# Import các module Django sau khi django.setup()
from django.db.models import Q, Count, Sum
from django.contrib.auth.models import User
from song.models import Song
from singer.models import Singer, SingerSong
from genre.models import Genre
from playlist.models import Playlist
from history.models import History
from spotify_user.models import SpotifyUser
from album.models import Album
from underthesea import word_tokenize, pos_tag

context = zmq.Context()
socket = context.socket(zmq.REP)

# Bind socket trên cổng 5557
try:
    socket.bind("tcp://*:5557")
    logger.debug("Bind socket thành công trên cổng 5557")
except zmq.error.ZMQError as e:
    logger.error(f"Lỗi khi bind socket: {e}")
    sys.exit(1)

# Biến toàn cục để lưu ngữ cảnh cuộc trò chuyện
conversation_context = {}

def get_spotify_user(user_id):
    """
    Lấy SpotifyUser dựa trên user_id (có thể là SpotifyUser.id hoặc auth.User.id)
    """
    try:
        logger.debug(f"Looking for SpotifyUser with id: {user_id}")
        spotify_user = SpotifyUser.objects.get(id=user_id)
        return spotify_user
    except SpotifyUser.DoesNotExist:
        try:
            logger.debug(f"Looking for auth.User with id: {user_id}")
            auth_user = User.objects.get(id=user_id)
            spotify_user = SpotifyUser.objects.get(user=auth_user)
            return spotify_user
        except (User.DoesNotExist, SpotifyUser.DoesNotExist):
            logger.error(f"User with id {user_id} not found")
            return None


def analyze_query(user_query, user_id):
    user_query = user_query.lower()
    tokens = word_tokenize(user_query)
    pos_tags = pos_tag(user_query)
    logger.debug(f"Tokens: {tokens}, POS tags: {pos_tags}")

    entities = {
        "song": ["bài hát", "song", "track"],
        "singer": ["ca sĩ", "singer", "artist", "nghệ sĩ"],
        "album": ["album"],
        "genre": ["thể loại", "genre"],
        "website": ["trang web", "website"],
        "playlist": ["playlist", "danh sách phát"]
    }
    actions = {
        "info": ["thông tin", "là gì", "là ai", "chi tiết", "về", "biết thêm"],
        "list": ["danh sách", "liệt kê", "các"],
        "count": ["bao nhiêu", "số lượng"],
        "find_singer": ["của ca sĩ nào", "trình bày bởi", "do ai"],
        "find_album": ["thuộc album nào"],
        "find_genre": ["thuộc thể loại nào"]
    }

    # Ưu tiên website
    if any(kw in user_query for kw in entities["website"]) and any(kw in user_query for kw in actions["count"] + actions["list"]):
        return "website", "stats" if "bao nhiêu" in user_query else "list", {}

    entity_type = None
    entity_name = None
    for entity, keywords in entities.items():
        for keyword in keywords:
            if keyword in user_query:
                entity_type = entity
                # Tìm vị trí từ khóa
                words = user_query.split()
                keyword_idx = next((i for i, w in enumerate(words) if keyword in w), -1)
                if keyword_idx != -1:
                    # Lấy phạm vi danh từ trước từ khóa
                    pos_list = [tag[1] for tag in pos_tag(" ".join(words[:keyword_idx]))]
                    name_start = max(0, len(pos_list) - 2) if "N" in pos_list else 0
                    entity_name = " ".join(words[name_start:keyword_idx]).strip()
                    # Loại bỏ từ dừng dựa trên POS
                    stop_pos = ["E", "R", "CH", "V"]
                    entity_name = " ".join(w for i, w in enumerate(entity_name.split()) if pos_tag(w)[0][1] not in stop_pos)
                break
        if entity_type:
            break

    action = next((act for act, kws in actions.items() if any(kw in user_query for kw in kws)), None)

    params = {}
    if entity_type == "song" and action == "find_singer":
        if "của" in tokens:
            song_end_idx = tokens.index("của")
            params["song_name"] = " ".join(tokens[:song_end_idx]).replace("bài hát", "").strip()
        else:
            params["song_name"] = entity_name or " ".join(t for t, tag in pos_tag(" ".join(tokens)) if tag == "N").strip()
    elif entity_type == "singer":
        if "ca sĩ" in tokens:
            singer_start_idx = tokens.index("ca sĩ") + 1
            params["artist_name"] = " ".join(tokens[singer_start_idx:]).strip()
        else:
            params["artist_name"] = entity_name or " ".join(t for t, tag in pos_tag(" ".join(tokens)) if tag == "N").strip()
    elif entity_type == "album" and action == "find_singer":
        if "của" in tokens:
            album_end_idx = tokens.index("của")
            params["album_name"] = " ".join(tokens[:album_end_idx]).strip()
        else:
            params["album_name"] = entity_name or " ".join(t for t, tag in pos_tag(" ".join(tokens)) if tag == "N").strip()
    elif entity_type == "genre":
        params["genre_name"] = entity_name or " ".join(t for t, tag in pos_tag(" ".join(tokens)) if tag == "N").strip()

    logger.debug(f"Analyzed query - entity_type: {entity_type}, action: {action}, params: {params}")
    return entity_type, action, params if entity_type and action else (None, None, None)

def query_database(entity_type, action, params, context=None):
    try:
        if entity_type == "song":
            if action == "info":
                song_name = params.get("song_name", "").lower()
                query = Song.objects.filter(name__icontains=song_name).select_related('id_genre').first()
                if query:
                    singers = Singer.objects.filter(singer_song__id_song=query).values_list('name', flat=True)
                    return {
                        "name": query.name,
                        "genre": query.id_genre.name if query.id_genre else "Không xác định",
                        "singers": list(singers),
                        "release_date": query.release_date.strftime('%Y-%m-%d') if query.release_date else None
                    }
                return {"error": f"Không tìm thấy bài hát '{song_name}'"}
            elif action == "list":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    songs = Song.objects.filter(song_singer__id_singer__name__icontains=artist_name).select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:10]
                    return {"songs": [{"name": s['name'], "genre": s['id_genre__name'], "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None} for s in songs]}
                return {"error": "Vui lòng cung cấp tên ca sĩ"}
            elif action == "find_singer":
                song_name = params.get("song_name", "").lower()
                if song_name:
                    song = Song.objects.filter(name__icontains=song_name).select_related('id_genre').first()
                    if song:
                        singers = Singer.objects.filter(singer_song__id_song=song).values_list('name', flat=True)
                        return {"song_name": song.name, "singers": list(singers)}
                    return {"error": f"Không tìm thấy bài hát '{song_name}'"}
                return {"error": "Vui lòng cung cấp tên bài hát"}

        elif entity_type == "singer":
            if action == "info":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    singer = Singer.objects.filter(name__icontains=artist_name).first()
                    if singer:
                        return {
                            "name": singer.name,
                            "description": singer.description or "Không có mô tả",
                            "followers": singer.followers,
                            "birthday": singer.birthday.strftime('%Y-%m-%d') if singer.birthday else None
                        }
                    return {"error": f"Không tìm thấy ca sĩ '{artist_name}'"}
                return {"error": "Vui lòng cung cấp tên ca sĩ"}
            elif action == "count":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    song_count = Song.objects.filter(song_singer__id_singer__name__icontains=artist_name).count()
                    return {"artist_name": artist_name, "song_count": song_count}
                return {"error": "Vui lòng cung cấp tên ca sĩ"}

        elif entity_type == "album":
            if action == "info" or action == "find_singer":
                album_name = params.get("album_name", "").lower()
                if album_name:
                    album = Album.objects.filter(name__icontains=album_name).select_related('id_singer').first()
                    if album:
                        return {
                            "name": album.name,
                            "release_date": album.release_date.strftime('%Y-%m-%d') if album.release_date else None,
                            "artist": album.id_singer.name if album.id_singer else "Không xác định",
                            "popularity": album.popularity
                        }
                    return {"error": f"Không tìm thấy album '{album_name}'"}
                return {"error": "Vui lòng cung cấp tên album"}
            elif action == "list":
                album_name = params.get("album_name", "").lower()
                if album_name:
                    songs = Song.objects.filter(album__name__icontains=album_name).select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:10]
                    return {"album_name": album_name, "songs": [{"name": s['name'], "genre": s['id_genre__name'], "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None} for s in songs]}
                return {"error": "Vui lòng cung cấp tên album"}

        elif entity_type == "genre":
            if action == "info":
                genre_name = params.get("genre_name", "").lower()
                if genre_name:
                    genre = Genre.objects.filter(name__icontains=genre_name).first()
                    if genre:
                        songs = Song.objects.filter(id_genre=genre).values('name')[:5]
                        return {"name": genre.name, "songs": [s['name'] for s in songs]}
                    return {"error": f"Không tìm thấy thể loại '{genre_name}'"}
                return {"error": "Vui lòng cung cấp tên thể loại"}
            elif action == "list":
                genre_name = params.get("genre_name", "").lower()
                if genre_name:
                    songs = Song.objects.filter(id_genre__name__icontains=genre_name).select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:10]
                    return {"genre_name": genre_name, "songs": [{"name": s['name'], "genre": s['id_genre__name'], "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None} for s in songs]}
                return {"error": "Vui lòng cung cấp tên thể loại"}

        elif entity_type == "website":
            if action == "stats":
                # Bổ sung total_genres vào kết quả
                total_genres = Genre.objects.count()
                return {
                    "total_songs": Song.objects.count(),
                    "total_singers": Singer.objects.count(),
                    "total_albums": Album.objects.count(),
                    "total_genres": total_genres
                }
            elif action == "list":
                # Thêm danh sách genres vào phản hồi list
                genres = Genre.objects.values('name')[:5]
                return {
                    "songs": list(Song.objects.values('name')[:5]),
                    "singers": list(Singer.objects.values('name')[:5]),
                    "albums": list(Album.objects.values('name')[:5]),
                    "genres": list(genres)
                }

        logger.error(f"Invalid entity_type or action: {entity_type}, {action}")
        return {"error": "Yêu cầu không hợp lệ"}
    except Exception as e:
        logger.error(f"Database query error: {str(e)}")
        return {"error": f"Lỗi truy vấn database: {str(e)}"}

while True:
    try:
        logger.debug("Waiting for message from views_chatbot")
        message = socket.recv_json()
        logger.debug(f"Received message: {message}")
        action = message.get('action')

        if action == 'chat_query':
            user_id = message.get('user_id')
            user_query = message.get('query', '').lower()
            
            logger.debug(f"Processing chat query for user_id: {user_id}, query: {user_query}")
            spotify_user = get_spotify_user(user_id)
            if not spotify_user:
                logger.error(f"User with id {user_id} not found")
                socket.send_json({'error': f'User with id {user_id} not found'})
                continue

            # Khởi tạo ngữ cảnh nếu chưa có
            if user_id not in conversation_context:
                conversation_context[user_id] = {}

            # Phân tích câu hỏi
            entity_type, action, params = analyze_query(user_query, user_id)

            # Nếu câu hỏi liên quan đến playlist, cần truyền thêm spotify_user
            if entity_type == "playlist":
                params["spotify_user"] = spotify_user

            # Truy vấn database nếu xác định được đối tượng
            if entity_type:
                db_data = query_database(entity_type, action, params, conversation_context.get(user_id, {}))
            else:
                db_data = {"general_query": True}

            # Cập nhật ngữ cảnh
            if entity_type == "song" and action == "list_by_singer" and "songs" in db_data:
                conversation_context[user_id]["last_songs"] = [song["name"] for song in db_data["songs"]]

            logger.debug("Connecting to gemini_chat_client on port 5558")
            gemini_socket = context.socket(zmq.REQ)
            gemini_socket.setsockopt(zmq.RCVTIMEO, 60000)
            gemini_socket.connect("tcp://localhost:5558")
            mcp_data = {
                'context': {
                    'user_id': user_id,
                    'db_data': db_data,
                    'user_query': user_query,
                    'conversation_context': conversation_context.get(user_id, {})
                },
                'request': 'chat_response'
            }
            logger.debug(f"Sending data to gemini_chat_client: {mcp_data}")
            gemini_socket.send_json(mcp_data)

            try:
                logger.debug("Waiting for response from gemini_chat_client")
                response = gemini_socket.recv_json()
                logger.debug(f"Received response from gemini_chat_client: {response}")
                socket.send_json(response)
            except zmq.error.Again:
                logger.error("Timeout waiting for response from gemini_chat_client")
                socket.send_json({'error': 'Timeout waiting for response from gemini_chat_client'})
            except Exception as e:
                logger.error(f"Error receiving response from gemini_chat_client: {str(e)}")
                socket.send_json({'error': f'Error communicating with gemini_chat_client: {str(e)}'})
            finally:
                gemini_socket.close()

        else:
            logger.error(f"Invalid action: {action}")
            socket.send_json({'error': 'Invalid action'})
    except Exception as e:
        logger.error(f"Error in main loop: {str(e)}")
        socket.send_json({'error': str(e)})