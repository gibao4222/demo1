import os
import sys
import django
import zmq
import json
from datetime import datetime, timedelta
import logging

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
from singer.models import Singer
from genre.models import Genre
from playlist.models import Playlist
from history.models import History
from spotify_user.models import SpotifyUser

context = zmq.Context()
socket = context.socket(zmq.REP)

# Bind socket trên cổng 5557
try:
    socket.bind("tcp://*:5557")
    logger.debug("Bind socket thành công trên cổng 5557")
except zmq.error.ZMQError as e:
    logger.error(f"Lỗi khi bind socket: {e}")
    sys.exit(1)

def get_spotify_user(user_id):
    """
    Lấy SpotifyUser dựa trên user_id (có thể là SpotifyUser.id hoặc auth.User.id)
    """
    try:
        # Thử tìm SpotifyUser trực tiếp
        logger.debug(f"Looking for SpotifyUser with id: {user_id}")
        spotify_user = SpotifyUser.objects.get(id=user_id)
        return spotify_user
    except SpotifyUser.DoesNotExist:
        try:
            # Nếu không tìm thấy, thử tìm auth.User và lấy SpotifyUser liên kết
            logger.debug(f"Looking for auth.User with id: {user_id}")
            auth_user = User.objects.get(id=user_id)
            spotify_user = SpotifyUser.objects.get(user=auth_user)
            return spotify_user
        except (User.DoesNotExist, SpotifyUser.DoesNotExist):
            logger.error(f"User with id {user_id} not found")
            return None

def query_database(query_type, params):
    try:
        if query_type == "song_search":
            query = params.get("query", "").lower()
            logger.debug(f"Searching songs with query: {query}")
            songs = Song.objects.filter(
                Q(name__icontains=query) | 
                Q(song_singer__id_singer__name__icontains=query) |
                Q(id_genre__name__icontains=query)
            ).distinct().values('name', 'id_genre__name')[:10]
            # Lấy danh sách nghệ sĩ cho mỗi bài hát
            result = []
            for song in songs:
                singers = Singer.objects.filter(singer_song__id_song__name=song['name']).values_list('name', flat=True)
                result.append({
                    "name": song['name'],
                    "singers": list(singers),
                    "genre": song['id_genre__name']
                })
            logger.debug(f"Song search result: {result}")
            return result
        
        elif query_type == "artist_info":
            artist_name = params.get("artist_name", "").lower()
            logger.debug(f"Searching artist info for: {artist_name}")
            artists = Singer.objects.filter(name__icontains=artist_name).values('name', 'description', 'followers')[:5]
            result = [{"name": a["name"], "description": a["description"] or "No description available", "followers": a["followers"]} for a in artists]
            logger.debug(f"Artist info result: {result}")
            return result
        
        elif query_type == "playlist_info":
            spotify_user = params.get("spotify_user")
            if not spotify_user:
                logger.error("Invalid user for playlist info")
                return {"error": "Invalid user"}
            logger.debug(f"Fetching playlists for user: {spotify_user.id}")
            playlists = Playlist.objects.filter(id_user=spotify_user, is_active=True).values('name', 'id', 'description')[:5]
            result = [{"name": p["name"], "id": p["id"], "description": p["description"] or "No description"} for p in playlists]
            logger.debug(f"Playlist info result: {result}")
            return result
        
        elif query_type == "listening_history":
            user_id = params.get("user_id")
            logger.debug(f"Fetching listening history for user_id: {user_id}")
            # Lấy lịch sử nghe trong 7 ngày
            date_threshold = datetime.now() - timedelta(days=7)
            history = History.objects.filter(
                id_user__id=user_id,
                listen_date__gte=date_threshold
            ).select_related('id_song', 'id_genre', 'id_singer')
            
            # Tổng hợp số lần nghe theo bài hát
            song_stats = history.values('id_song__name').annotate(
                total_listens=Sum('listen_count')
            ).order_by('-total_listens')[:5]
            
            # Tìm thể loại yêu thích
            favorite_genre = history.values('id_genre__name').annotate(
                total_listens=Sum('listen_count')
            ).order_by('-total_listens').first()
            
            # Tìm nghệ sĩ yêu thích
            favorite_singer = history.values('id_singer__name').annotate(
                total_listens=Sum('listen_count')
            ).order_by('-total_listens').first()
            
            result = {
                "song_stats": [{"name": s["id_song__name"], "listens": s["total_listens"]} for s in song_stats],
                "favorite_genre": favorite_genre["id_genre__name"] if favorite_genre else "Unknown",
                "favorite_singer": favorite_singer["id_singer__name"] if favorite_singer else "Unknown"
            }
            logger.debug(f"Listening history result: {result}")
            return result
        
        logger.error(f"Invalid query type: {query_type}")
        return {"error": "Invalid query type"}
    except Exception as e:
        logger.error(f"Database query error: {str(e)}")
        return {"error": f"Database query error: {str(e)}"}

while True:
    try:
        logger.debug("Waiting for message from views_chatbot")
        message = socket.recv_json()
        action = message.get('action')
        logger.debug(f"Received message: action={action}")

        if action == 'chat_query':
            user_id = message.get('user_id')
            user_query = message.get('query', '').lower()
            
            # Lấy SpotifyUser
            logger.debug(f"Processing chat query for user_id: {user_id}, query: {user_query}")
            spotify_user = get_spotify_user(user_id)
            if not spotify_user:
                logger.error(f"User with id {user_id} not found")
                socket.send_json({'error': f'User with id {user_id} not found'})
                continue
            
            # Phân loại câu hỏi
            if any(keyword in user_query for keyword in ['song', 'music', 'track', 'find']):
                db_data = query_database("song_search", {"query": user_query})
            elif any(keyword in user_query for keyword in ['artist', 'singer', 'band', 'info']):
                artist_name = user_query.replace("info about", "").replace("information on", "").replace("artist", "").replace("singer", "").strip()
                db_data = query_database("artist_info", {"artist_name": artist_name})
            elif 'playlist' in user_query:
                db_data = query_database("playlist_info", {"spotify_user": spotify_user})
            elif 'history' in user_query or 'listening' in user_query:
                # Dùng auth.User.id cho History
                auth_user_id = spotify_user.user.id
                db_data = query_database("listening_history", {"user_id": auth_user_id})
            else:
                auth_user_id = spotify_user.user.id
                db_data = query_database("listening_history", {"user_id": auth_user_id})

            # Gửi dữ liệu đến Ollama
            logger.debug("Connecting to ollama_chat_client on port 5558")
            ollama_socket = context.socket(zmq.REQ)
            ollama_socket.setsockopt(zmq.RCVTIMEO, 60000)  # Timeout 60 giây
            ollama_socket.connect("tcp://localhost:5558")
            mcp_data = {
                'context': {
                    'user_id': user_id,
                    'db_data': db_data,
                    'user_query': user_query
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