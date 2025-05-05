import os
import sys
import django
import zmq
import json
import logging
import requests
import time

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Thêm đường dẫn dự án vào sys.path
BASE_DIR = '/var/www/demo1/backend'
sys.path.append(BASE_DIR)

# Thiết lập DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Kiểm tra và khởi tạo Django
try:
    from myproject import settings
    django.setup()
    logger.debug("Khởi tạo Django thành công")
except ImportError as e:
    logger.error(f"Lỗi: Không tìm thấy module myproject.settings: {e}")
    sys.exit(1)
except Exception as e:
    logger.error(f"Lỗi khi khởi tạo Django: {e}")
    sys.exit(1)

# Import các module Django
from django.db.models import Q
from django.contrib.auth.models import User
from song.models import Song
from singer.models import Singer
from genre.models import Genre
from playlist.models import Playlist
from album.models import Album
from spotify_user.models import SpotifyUser

# Thiết lập ZeroMQ
context = zmq.Context()
socket = context.socket(zmq.REP)
try:
    socket.bind("tcp://*:5557")
    logger.debug("Bind socket thành công trên cổng 5557")
except zmq.error.ZMQError as e:
    logger.error(f"Lỗi khi bind socket: {e}")
    sys.exit(1)

# Biến toàn cục lưu ngữ cảnh
conversation_context = {}
OLLAMA_API_URL = "http://localhost:11434/api/generate"

def get_spotify_user(user_id):
    """
    Lấy SpotifyUser dựa trên user_id
    """
    try:
        spotify_user = SpotifyUser.objects.get(id=user_id)
        return spotify_user
    except SpotifyUser.DoesNotExist:
        try:
            auth_user = User.objects.get(id=user_id)
            spotify_user = SpotifyUser.objects.get(user=auth_user)
            return spotify_user
        except (User.DoesNotExist, SpotifyUser.DoesNotExist):
            logger.error(f"User with id {user_id} not found")
            return None

def analyze_query(user_query, user_id):
    """
    Phân tích câu hỏi người dùng bằng VinaLLama với cơ chế thử lại
    """
    user_query = user_query.lower().strip()
    if not user_query:
        return None, None, None

    # Kiểm tra câu hỏi về tên trang web
    if "tên" in user_query and any(kw in user_query for kw in ["trang web", "website", "ứng dụng", "app"]):
        return "website", "name", {}

    # Tạo prompt để phân tích ý định và thực thể
    prompt = (
        f"Bạn là một AI phân tích câu hỏi người dùng cho một trang web nghe nhạc trực tuyến. "
        f"Nhiệm vụ của bạn là xác định ý định (intent) và các thực thể (entities) từ câu hỏi sau: '{user_query}'.\n"
        f"Các ý định (action) có thể là: info, list, count, find_singer, find_album, find_genre.\n"
        f"Các thực thể (entity_type) có thể là: song, singer, album, genre, playlist, website.\n"
        f"Trả về kết quả dưới dạng JSON với các key: entity_type, action, params.\n"
        f"Ví dụ:\n"
        f'- Câu hỏi: "Thông tin bài hát Shape of You" -> {{"entity_type": "song", "action": "info", "params": {{"song_name": "Shape of You"}}}}\n'
        f'- Câu hỏi: "Danh sách bài hát của Sơn Tùng" -> {{"entity_type": "song", "action": "list", "params": {{"artist_name": "Sơn Tùng"}}}}\n'
        f'- Câu hỏi: "Có bao nhiêu bài hát trong hệ thống?" -> {{"entity_type": "website", "action": "stats", "params": {{}}}}\n'
        f'Nếu không xác định được, trả về: {{"entity_type": null, "action": null, "params": {{}}}}'
    )

    # Gửi yêu cầu đến Ollama với cơ chế thử lại
    api_payload = {
        "model": "vina:latest",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    headers = {'Content-Type': 'application/json'}
    max_retries = 3
    retry_delay = 5  # giây

    for attempt in range(max_retries):
        try:
            response = requests.post(OLLAMA_API_URL, headers=headers, json=api_payload, timeout=30)
            if response.status_code == 200:
                result = response.json().get('response', '')
                try:
                    parsed = json.loads(result)
                    entity_type = parsed.get('entity_type')
                    action = parsed.get('action')
                    params = parsed.get('params', {})
                    logger.debug(f"Analyzed query - entity_type: {entity_type}, action: {action}, params: {params}")
                    return entity_type, action, params
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse Ollama response: {result}")
                    return None, None, None
            elif response.status_code == 500 and "llm server loading model" in response.text:
                logger.warning(f"Ollama model is still loading, retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                logger.error("Ollama model failed to load after max retries")
                return None, None, None
            else:
                logger.error(f"Ollama API error: {response.text}")
                return None, None, None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to Ollama: {str(e)}")
            if attempt < max_retries - 1:
                logger.warning(f"Retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
                continue
            return None, None, None

def query_database(entity_type, action, params, context=None):
    """
    Truy vấn database dựa trên entity_type, action và params
    """
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
            if action == "name":
                return {"website_name": "Spotify Clone"}
            elif action == "stats":
                total_genres = Genre.objects.count()
                return {
                    "total_songs": Song.objects.count(),
                    "total_singers": Singer.objects.count(),
                    "total_albums": Album.objects.count(),
                    "total_genres": total_genres
                }
            elif action == "list":
                songs = Song.objects.select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:5]
                genres = Genre.objects.values('name')[:5]
                return {
                    "songs": [
                        {
                            "name": s['name'],
                            "genre": s['id_genre__name'] if s['id_genre__name'] else "Không xác định",
                            "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None
                        } for s in songs
                    ],
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

            # Phân tích câu hỏi bằng VinaLLama
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
            if entity_type == "song" and action == "list" and "songs" in db_data:
                conversation_context[user_id]["last_songs"] = [song["name"] for song in db_data["songs"]]

            # Gửi dữ liệu đến ollama_chat_client
            logger.debug("Connecting to ollama_chat_client on port 5558")
            ollama_socket = context.socket(zmq.REQ)
            ollama_socket.setsockopt(zmq.RCVTIMEO, 60000)
            ollama_socket.connect("tcp://localhost:5558")
            mcp_data = {
                'context': {
                    'user_id': user_id,
                    'db_data': db_data,
                    'user_query': user_query,
                    'conversation_context': conversation_context.get(user_id, {})
                },
                'request': 'chat_response'
            }
            logger.debug(f"Sending data to ollama_chat_client: {mcp_data}")
            ollama_socket.send_json(mcp_data)

            try:
                logger.debug("Waiting for response from ollama_chat_client")
                response = ollama_socket.recv_json()
                logger.debug(f"Received response from ollama_chat_client: {response}")
                socket.send_json(response)
            except zmq.error.Again:
                logger.error("Timeout waiting for response from ollama_chat_client")
                socket.send_json({'error': 'Timeout waiting for response from ollama_chat_client'})
            except Exception as e:
                logger.error(f"Error receiving response from ollama_chat_client: {str(e)}")
                socket.send_json({'error': f'Error communicating with ollama_chat_client: {str(e)}'})
            finally:
                ollama_socket.close()

        else:
            logger.error(f"Invalid action: {action}")
            socket.send_json({'error': 'Invalid action'})
    except Exception as e:
        logger.error(f"Error in main loop: {str(e)}")
        socket.send_json({'error': str(e)})