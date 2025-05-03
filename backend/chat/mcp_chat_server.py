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
<<<<<<< HEAD
from singer.models import Singer, SingerSong
=======
from singer.models import Singer
>>>>>>> thanhduom
from genre.models import Genre
from playlist.models import Playlist
from history.models import History
from spotify_user.models import SpotifyUser
<<<<<<< HEAD
from album.models import Album
from underthesea import word_tokenize, pos_tag
=======
>>>>>>> thanhduom

context = zmq.Context()
socket = context.socket(zmq.REP)

# Bind socket trên cổng 5557
try:
    socket.bind("tcp://*:5557")
    logger.debug("Bind socket thành công trên cổng 5557")
except zmq.error.ZMQError as e:
    logger.error(f"Lỗi khi bind socket: {e}")
    sys.exit(1)

<<<<<<< HEAD
# Biến toàn cục để lưu ngữ cảnh cuộc trò chuyện
conversation_context = {}

=======
>>>>>>> thanhduom
def get_spotify_user(user_id):
    """
    Lấy SpotifyUser dựa trên user_id (có thể là SpotifyUser.id hoặc auth.User.id)
    """
    try:
<<<<<<< HEAD
=======
        # Thử tìm SpotifyUser trực tiếp
>>>>>>> thanhduom
        logger.debug(f"Looking for SpotifyUser with id: {user_id}")
        spotify_user = SpotifyUser.objects.get(id=user_id)
        return spotify_user
    except SpotifyUser.DoesNotExist:
        try:
<<<<<<< HEAD
=======
            # Nếu không tìm thấy, thử tìm auth.User và lấy SpotifyUser liên kết
>>>>>>> thanhduom
            logger.debug(f"Looking for auth.User with id: {user_id}")
            auth_user = User.objects.get(id=user_id)
            spotify_user = SpotifyUser.objects.get(user=auth_user)
            return spotify_user
        except (User.DoesNotExist, SpotifyUser.DoesNotExist):
            logger.error(f"User with id {user_id} not found")
            return None

<<<<<<< HEAD

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
=======
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
>>>>>>> thanhduom

while True:
    try:
        logger.debug("Waiting for message from views_chatbot")
        message = socket.recv_json()
<<<<<<< HEAD
        logger.debug(f"Received message: {message}")
        action = message.get('action')
=======
        action = message.get('action')
        logger.debug(f"Received message: action={action}")
>>>>>>> thanhduom

        if action == 'chat_query':
            user_id = message.get('user_id')
            user_query = message.get('query', '').lower()
            
<<<<<<< HEAD
=======
            # Lấy SpotifyUser
>>>>>>> thanhduom
            logger.debug(f"Processing chat query for user_id: {user_id}, query: {user_query}")
            spotify_user = get_spotify_user(user_id)
            if not spotify_user:
                logger.error(f"User with id {user_id} not found")
                socket.send_json({'error': f'User with id {user_id} not found'})
                continue
<<<<<<< HEAD

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
=======
            
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
>>>>>>> thanhduom
            mcp_data = {
                'context': {
                    'user_id': user_id,
                    'db_data': db_data,
<<<<<<< HEAD
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
=======
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
>>>>>>> thanhduom

        else:
            logger.error(f"Invalid action: {action}")
            socket.send_json({'error': 'Invalid action'})
    except Exception as e:
        logger.error(f"Error in main loop: {str(e)}")
        socket.send_json({'error': str(e)})