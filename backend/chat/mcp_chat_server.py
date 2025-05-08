import os
import sys
import django
import asyncio
import logging
<<<<<<< HEAD
import aiohttp
import asyncio
import time
import traceback
import hashlib
from asgiref.sync import sync_to_async
=======
import json
from fastapi import FastAPI
from typing import Dict, Any
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import aiohttp
import traceback
from asgiref.sync import sync_to_async
from django.core.cache import cache
import hashlib
>>>>>>> gibao

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Đặt đường dẫn gốc của project
BASE_DIR = "/var/www/demo1/backend"
<<<<<<< HEAD

# Thay đổi thư mục làm việc hiện tại
os.chdir(BASE_DIR)
logger.debug(f"Current working directory changed to: {os.getcwd()}")

# Thêm BASE_DIR và myproject vào sys.path
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, 'myproject'))
logger.debug(f"sys.path: {sys.path}")

# Kiểm tra sự tồn tại của thư mục và file
if not os.path.exists(os.path.join(BASE_DIR, 'myproject')):
    logger.error("Thư mục myproject không tồn tại trong BASE_DIR")
    sys.exit(1)

if not os.path.exists(os.path.join(BASE_DIR, 'myproject', 'settings.py')):
    logger.error("File settings.py không tồn tại trong myproject")
    sys.exit(1)

# Thiết lập DJANGO_SETTINGS_MODULE
os.environ['DJANGO_SETTINGS_MODULE'] = 'myproject.settings'

# Kiểm tra import trước khi setup
try:
    import myproject.settings
    logger.debug("Import myproject.settings thành công")
except ImportError as e:
    logger.error(f"Lỗi khi import myproject.settings: {e}")
    logger.error(f"Current working directory: {os.getcwd()}")
    sys.exit(1)

# Khởi tạo Django
try:
    django.setup()
    logger.debug("Khởi tạo Django thành công")
except Exception as e:
    logger.error(f"Lỗi khi khởi tạo Django: {e}")
    sys.exit(1)

# Import các model sau khi django.setup()
from django.db.models import Q
from django.contrib.auth.models import User
from song.models import Song
from singer.models import Singer
from genre.models import Genre
from playlist.models import Playlist
from album.models import Album
from spotify_user.models import SpotifyUser
from django.core.cache import cache

# Thiết lập ZeroMQ
context = zmq.Context()
socket = context.socket(zmq.REP)
socket.setsockopt(zmq.LINGER, 0)  # Prevent socket lingering
try:
    socket.bind("tcp://*:5557")
    logger.debug("Bind socket thành công trên cổng 5557")
except zmq.error.ZMQError as e:
    logger.error(f"Lỗi khi bind socket: {e}")
    sys.exit(1)
=======
os.chdir(BASE_DIR)
logger.debug(f"Current working directory changed to: {os.getcwd()}")

# Cấu hình Django
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()

# Import models từ Django
from singer.models import Singer  # Thay bằng model thực tế của bạn
from song.models import Song  # Thay bằng model thực tế của bạn

app = FastAPI()

# Cấu hình Ollama với LangChain
analysis_template = """
Bạn là một chatbot hỗ trợ bằng tiếng việt cho trang web phát nhạc trực tuyến Spotify Clone. 
Những điều bạn cần làm khi nhận được tin nhắn của người dùng là:
1. Phân tích yêu cầu: Xác định ý định (hỏi thông tin, tìm kiếm, đếm) và từ khóa.
2. Xác định thông tin cần truy vấn: Loại dữ liệu (ca sĩ, bài hát, album) và điều kiện (tên, thể loại).
3. Hãy chỉ trả về một JSON hợp lệ với các trường: intent, entity_type, action, params. Không thêm bất kỳ văn bản nào ngoài JSON.

Ví dụ:
- Yêu cầu: "Thông tin bài hát Shape of You"
  Kết quả: {{"intent": "info", "entity_type": "song", "action": "detail", "params": {{"song_name": "Shape of You"}}}}
- Yêu cầu: "Danh sách bài hát của Wren Evans"
  Kết quả: {{"intent": "search", "entity_type": "song", "action": "list", "params": {{"artist_name": "Wren Evans"}}}}
>>>>>>> gibao

Yêu cầu: {question}

Kết quả: {format_instructions}
"""
analysis_model = OllamaLLM(model="llama3")
analysis_parser = JsonOutputParser()
analysis_prompt = PromptTemplate(
    template=analysis_template,
    input_variables=["question"],
    partial_variables={"format_instructions": analysis_parser.get_format_instructions()}
)
analysis_chain = analysis_prompt | analysis_model | analysis_parser

# Cấu hình trả lời
response_template = """
Bạn là một chatbot hỗ trợ bằng tiếng việt cho trang web phát nhạc trực tuyến Spotify Clone.
Dựa trên dữ liệu từ database (db_data), hãy trả lời câu hỏi một cách tự nhiên và thân thiện. 
CHỈ SỬ DỤNG THÔNG TIN TỪ db_data ĐỂ TRẢ LỜI, KHÔNG TỰ TẠO NỘI DUNG TỪ KIẾN THỨC CỦA BẠN.

Lịch sử cuộc trò chuyện: {context}
Dữ liệu từ database: {db_data}
Câu hỏi: {question}

Câu trả lời:
"""
response_model = OllamaLLM(model="vina")
response_prompt = ChatPromptTemplate.from_template(response_template)
response_chain = response_prompt | response_model

# Lưu trữ ngữ cảnh
conversation_context = {}
<<<<<<< HEAD
MAX_CONTEXT_SIZE = 1000  # Giới hạn kích thước ngữ cảnh (KB)
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Kiểm tra kết nối Redis cho caching
try:
    cache.set('test_key', 'test_value', timeout=10)
    test_value = cache.get('test_key')
    if test_value == 'test_value':
        logger.debug("Redis caching hoạt động bình thường")
    else:
        logger.error("Redis caching không hoạt động đúng")
except Exception as e:
    logger.error(f"Lỗi khi kiểm tra Redis caching: {e}")

=======

>>>>>>> gibao
def sanitize_cache_key(key):
    """Sanitize cache key to make it Memcached-compatible."""
    return hashlib.md5(key.encode()).hexdigest()

@sync_to_async
<<<<<<< HEAD
def get_spotify_user(user_id):
    """Lấy SpotifyUser dựa trên user_id"""
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
        except Exception as e:
            logger.error(f"Lỗi khi lấy SpotifyUser: {e}")
            return None

async def analyze_query(session, user_query, user_id):
    """Phân tích câu hỏi người dùng bằng Ollama"""
    user_query = user_query.lower().strip()
    if not user_query:
        logger.warning("Câu hỏi trống")
        return None, None, None

    prompt = (
        f"Bạn là một AI phân tích câu hỏi người dùng cho một trang web nghe nhạc trực tuyến. "
        f"Nhiệm vụ của bạn là xác định ý định (intent) và các thực thể (entities) từ câu hỏi: '{user_query}'. "
        f"Các ý định (action): info, list, count, find_singer, find_album, find_genre. "
        f"Các thực thể (entity_type): song, singer, album, genre, playlist, website. "
        f"Trả về JSON với các key: entity_type, action, params. "
        f"Ví dụ: "
        f'- "Thông tin bài hát Shape of You" -> {{"entity_type": "song", "action": "info", "params": {{"song_name": "Shape of You"}}}} '
        f'- "Danh sách bài của Wren Evans" -> {{"entity_type": "singer", "action": "list", "params": {{"artist_name": "wren evans"}}}} '
        f'- "Có bao nhiêu bài hát của Wren Evans?" -> {{"entity_type": "singer", "action": "count", "params": {{"artist_name": "wren evans"}}}} '
        f'- "Thông tin ca sĩ Wren Evans" -> {{"entity_type": "singer", "action": "info", "params": {{"artist_name": "wren evans"}}}} '
        f'- "Có bao nhiêu bài hát trong hệ thống?" -> {{"entity_type": "website", "action": "stats", "params": {{}}}} '
        f'Nếu không xác định được: {{"entity_type": null, "action": null, "params": {{}}}}'
    )

    api_payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "num_ctx": 512,  # Reduced context size for faster response
            "temperature": 0.5,
            "top_p": 0.9
        }
    }
    headers = {'Content-Type': 'application/json'}
    max_retries = 5
    retry_delay = 10

    for attempt in range(max_retries):
        try:
            async with session.post(OLLAMA_API_URL, headers=headers, json=api_payload, timeout=60) as response:
                if response.status == 200:
                    result = await response.json()
                    result = result.get('response', '')
                    try:
                        parsed = json.loads(result)
                        entity_type = parsed.get('entity_type')
                        action = parsed.get('action')
                        params = parsed.get('params', {})
                        logger.debug(f"Analyzed query - entity_type: {entity_type}, action: {action}, params: {params}")
                        return entity_type, action, params
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse Ollama response: {result}, Error: {e}")
                        logger.error(f"Stack trace: {traceback.format_exc()}")
                        return None, None, None
                else:
                    logger.error(f"Ollama API error: Status {response.status}, Response: {await response.text()}")
                    return None, None, None
        except aiohttp.ClientError as e:
            logger.error(f"Error connecting to Ollama: {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            return None, None, None
        except asyncio.TimeoutError:
            logger.error(f"Timeout khi kết nối tới Ollama sau 60s (attempt {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            return None, None, None
        except Exception as e:
            logger.error(f"Unexpected error in analyze_query: {str(e)}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            return None, None, None

    # Fallback cho phân tích thất bại
    logger.warning("Failed to analyze query after all retries, using fallback")
    if "danh sách bài" in user_query and "wren evans" in user_query:
        return "singer", "list", {"artist_name": "wren evans"}
    elif "thông tin ca sĩ" in user_query and "wren evans" in user_query:
        return "singer", "info", {"artist_name": "wren evans"}
    elif "có mấy bài" in user_query and "wren evans" in user_query:
        return "singer", "count", {"artist_name": "wren evans"}
    return None, None, None

# Hàm hỗ trợ truy vấn cơ sở dữ liệu
@sync_to_async
def fetch_song_info(song_name):
    """Lấy thông tin bài hát đồng bộ."""
    query = Song.objects.filter(name__icontains=song_name).select_related('id_genre').first()
    if query:
        singers = list(Singer.objects.filter(singer_song__id_song=query).values_list('name', flat=True))
        return {
            "name": query.name,
            "genre": query.id_genre.name if query.id_genre else "Không xác định",
            "singers": singers,
            "release_date": query.release_date.strftime('%Y-%m-%d') if query.release_date else None
        }
    return {"error": f"Không tìm thấy bài hát '{song_name}'"}

@sync_to_async
def fetch_singer_songs(artist_name):
    """Lấy danh sách bài hát của ca sĩ đồng bộ."""
    songs = Song.objects.filter(
        song_singer__id_singer__name__icontains=artist_name
    ).select_related('id_genre').values('name', 'id_genre__name', 'release_date')
    return [
        {
            "name": s['name'],
            "genre": s['id_genre__name'],
            "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None
        }
        for s in songs
    ]

@sync_to_async
def fetch_song_singers(song_name):
    """Lấy danh sách ca sĩ của bài hát đồng bộ."""
    song = Song.objects.filter(name__icontains=song_name).select_related('id_genre').first()
    if song:
        singers = list(Singer.objects.filter(singer_song__id_song=song).values_list('name', flat=True))
        return {"song_name": song.name, "singers": singers}
    return {"error": f"Không tìm thấy bài hát '{song_name}'"}

@sync_to_async
def fetch_singer_info(artist_name):
    """Lấy thông tin ca sĩ đồng bộ."""
    singer = Singer.objects.filter(name__icontains=artist_name).first()
    if singer:
        return {
            "name": singer.name,
            "description": singer.description or "Không có mô tả",
            "followers": singer.followers,
            "birthday": singer.birthday.strftime('%Y-%m-%d') if singer.birthday else None
        }
    return {"error": f"Không tìm thấy ca sĩ '{artist_name}'"}

@sync_to_async
def count_singer_songs(artist_name):
    """Đếm số bài hát của ca sĩ đồng bộ."""
    return Song.objects.filter(song_singer__id_singer__name__icontains=artist_name).count()

@sync_to_async
def fetch_album_info(album_name):
    """Lấy thông tin album đồng bộ."""
    album = Album.objects.filter(name__icontains=album_name).select_related('id_singer').first()
    if album:
        artist_name = album.id_singer.name if album.id_singer else "Không xác định"
        return {
            "name": album.name,
            "release_date": album.release_date.strftime('%Y-%m-%d') if album.release_date else None,
            "artist": artist_name,
            "popularity": album.popularity
        }
    return {"error": f"Không tìm thấy album '{album_name}'"}

@sync_to_async
def fetch_album_songs(album_name):
    """Lấy danh sách bài hát trong album đồng bộ."""
    songs = Song.objects.filter(album__name__icontains=album_name).select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:10]
    return [
        {
            "name": s['name'],
            "genre": s['id_genre__name'],
            "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None
        }
        for s in songs
    ]

@sync_to_async
def fetch_genre_info(genre_name):
    """Lấy thông tin thể loại đồng bộ."""
    genre = Genre.objects.filter(name__icontains=genre_name).first()
    if genre:
        songs = list(Song.objects.filter(id_genre=genre).values('name')[:5])
        return {"name": genre.name, "songs": songs}
    return {"error": f"Không tìm thấy thể loại '{genre_name}'"}

@sync_to_async
def fetch_genre_songs(genre_name):
    """Lấy danh sách bài hát theo thể loại đồng bộ."""
    songs = Song.objects.filter(id_genre__name__icontains=genre_name).select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:10]
    return [
        {
            "name": s['name'],
            "genre": s['id_genre__name'],
            "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None
        }
        for s in songs
    ]

@sync_to_async
def fetch_website_stats():
    """Lấy thống kê website đồng bộ."""
    return {
        "total_songs": Song.objects.count(),
        "total_singers": Singer.objects.count(),
        "total_albums": Album.objects.count(),
        "total_genres": Genre.objects.count()
    }

@sync_to_async
def fetch_website_lists():
    """Lấy danh sách cho website đồng bộ."""
    songs = Song.objects.select_related('id_genre').values('name', 'id_genre__name', 'release_date')[:5]
    singers = Singer.objects.values('name')[:5]
    albums = Album.objects.values('name')[:5]
    genres = Genre.objects.values('name')[:5]
    return {
        "songs": [
            {
                "name": s['name'],
                "genre": s['id_genre__name'] if s['id_genre__name'] else "Không xác định",
                "release_date": s['release_date'].strftime('%Y-%m-%d') if s['release_date'] else None
            }
            for s in songs
        ],
        "singers": list(singers),
        "albums": list(albums),
        "genres": list(genres)
    }

async def query_database(entity_type, action, params, context=None):
    """Truy vấn cơ sở dữ liệu dựa trên entity_type, action và params"""
    cache_key = sanitize_cache_key(f"db_query_{entity_type}_{action}_{json.dumps(params)}")
    cached_result = await sync_to_async(cache.get)(cache_key)
    if cached_result:
        logger.debug(f"Cache hit for {cache_key}")
        return cached_result

    query_start_time = time.time()
    try:
        logger.debug(f"Executing database query - entity_type: {entity_type}, action: {action}, params: {params}")

        if entity_type == "song":
            if action == "info":
                song_name = params.get("song_name", "").lower()
                if song_name:
                    result = await fetch_song_info(song_name)
                else:
                    result = {"error": "Vui lòng cung cấp tên bài hát"}
            elif action == "list":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    songs = await fetch_singer_songs(artist_name)
                    result = {"songs": songs}
                else:
                    result = {"error": "Vui lòng cung cấp tên ca sĩ"}
            elif action == "find_singer":
                song_name = params.get("song_name", "").lower()
                if song_name:
                    result = await fetch_song_singers(song_name)
                else:
                    result = {"error": "Vui lòng cung cấp tên bài hát"}
            else:
                result = {"error": "Hành động không hợp lệ cho bài hát"}

        elif entity_type == "singer":
            if action == "info":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    result = await fetch_singer_info(artist_name)
                else:
                    result = {"error": "Vui lòng cung cấp tên ca sĩ"}
            elif action == "list":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    songs = await fetch_singer_songs(artist_name)
                    result = {"artist_name": artist_name, "songs": songs}
                else:
                    result = {"error": "Vui lòng cung cấp tên ca sĩ"}
            elif action == "count":
                artist_name = params.get("artist_name", "").lower()
                if artist_name:
                    song_count = await count_singer_songs(artist_name)
                    result = {"artist_name": artist_name, "song_count": song_count}
                else:
                    result = {"error": "Vui lòng cung cấp tên ca sĩ"}
            else:
                result = {"error": "Hành động không hợp lệ cho ca sĩ"}

        elif entity_type == "album":
            if action == "info" or action == "find_singer":
                album_name = params.get("album_name", "").lower()
                if album_name:
                    result = await fetch_album_info(album_name)
                else:
                    result = {"error": "Vui lòng cung cấp tên album"}
            elif action == "list":
                album_name = params.get("album_name", "").lower()
                if album_name:
                    songs = await fetch_album_songs(album_name)
                    result = {"album_name": album_name, "songs": songs}
                else:
                    result = {"error": "Vui lòng cung cấp tên album"}
            else:
                result = {"error": "Hành động không hợp lệ cho album"}

        elif entity_type == "genre":
            if action == "info":
                genre_name = params.get("genre_name", "").lower()
                if genre_name:
                    result = await fetch_genre_info(genre_name)
                else:
                    result = {"error": "Vui lòng cung cấp tên thể loại"}
            elif action == "list":
                genre_name = params.get("genre_name", "").lower()
                if genre_name:
                    songs = await fetch_genre_songs(genre_name)
                    result = {"genre_name": genre_name, "songs": songs}
                else:
                    result = {"error": "Vui lòng cung cấp tên thể loại"}
            else:
                result = {"error": "Hành động không hợp lệ cho thể loại"}

        elif entity_type == "website":
            if action == "name":
                result = {"website_name": "Spotify Clone"}
            elif action == "stats":
                result = await fetch_website_stats()
            elif action == "list":
                result = await fetch_website_lists()
            else:
                result = {"error": "Hành động không hợp lệ cho website"}

        else:
            logger.error(f"Invalid entity_type or action: {entity_type}, {action}")
            result = {"error": "Yêu cầu không hợp lệ"}

        await sync_to_async(cache.set)(cache_key, result, timeout=300)
        query_time = time.time() - query_start_time
        logger.debug(f"Database query time: {query_time:.2f} seconds, Result: {result}")
        return result
    except Exception as e:
        logger.error(f"Database query error: {str(e)} with traceback: {traceback.format_exc()}")
        return {"error": f"Lỗi truy vấn database: {str(e)}"}

async def check_ollama_chat_client():
    """Kiểm tra xem ollama_chat_client có đang chạy không"""
    temp_socket = context.socket(zmq.REQ)
    temp_socket.setsockopt(zmq.RCVTIMEO, 5000)
    temp_socket.setsockopt(zmq.SNDTIMEO, 5000)
    temp_socket.setsockopt(zmq.LINGER, 0)
    try:
        logger.debug("Attempting to connect to ollama_chat_client at tcp://localhost:5558")
        temp_socket.connect("tcp://localhost:5558")
        logger.debug("Sending ping message to ollama_chat_client")
        temp_socket.send_json({"ping": "test"})
        response = temp_socket.recv_json()
        logger.debug(f"ollama_chat_client response: {response}")
        return True
    except zmq.error.Again:
        logger.warning("ollama_chat_client không phản hồi trong 5 giây.")
        return False
    except zmq.error.ZMQError as e:
        logger.error(f"Không thể kết nối tới ollama_chat_client: {e}")
        return False
    finally:
        temp_socket.close()

async def main():
    async with aiohttp.ClientSession() as session:
        while True:
            start_time = time.time()
            try:
                logger.debug("Waiting for message from views_chatbot")
                message = socket.recv_json()
                logger.debug(f"Received message: {message}")
                action = message.get('action')

                if action == 'chat_query':
                    user_id = message.get('user_id')
                    user_query = message.get('query', '').lower()
                    logger.debug(f"Processing chat query for user_id: {user_id}, query: {user_query}")
                    spotify_user = await get_spotify_user(user_id)
                    if not spotify_user:
                        logger.error(f"User with id {user_id} not found")
                        socket.send_json({'error': f'User with id {user_id} not found'})
                        continue

                    if sys.getsizeof(conversation_context) / 1024 > MAX_CONTEXT_SIZE:
                        logger.warning(f"Ngữ cảnh vượt quá {MAX_CONTEXT_SIZE} KB, xóa ngữ cảnh cũ")
                        conversation_context.clear()

                    if user_id not in conversation_context:
                        conversation_context[user_id] = {}

                    entity_type, action, params = await analyze_query(session, user_query, user_id)
                    logger.debug(f"Analyzed - entity_type: {entity_type}, action: {action}, params: {params}")

                    if entity_type == "playlist":
                        params["spotify_user"] = spotify_user

                    if entity_type:
                        db_data = await query_database(entity_type, action, params, conversation_context.get(user_id, {}))
                        logger.debug(f"Sending to ollama_chat_client - db_data: {db_data}")
                    else:
                        db_data = {"general_query": True, "error": "Không thể phân tích câu hỏi, xử lý như câu hỏi chung"}

                    if entity_type == "song" and action == "list" and "songs" in db_data:
                        conversation_context[user_id]["last_songs"] = [song["name"] for song in db_data["songs"]]

                    logger.debug("Checking ollama_chat_client availability")
                    max_attempts = 5
                    for attempt in range(max_attempts):
                        if await check_ollama_chat_client():
                            break
                        if attempt < max_attempts - 1:
                            logger.info(f"Chờ 10 giây để ollama_chat_client khởi động (lần {attempt + 1}/{max_attempts})...")
                            await asyncio.sleep(10)
                    else:
                        logger.error("Không thể kết nối tới ollama_chat_client sau 5 lần thử.")
                        socket.send_json({'error': 'ollama_chat_client không khả dụng, vui lòng kiểm tra và khởi động lại.'})
                        continue

                    logger.debug("Connecting to ollama_chat_client on port 5558")
                    ollama_socket = context.socket(zmq.REQ)
                    ollama_socket.setsockopt(zmq.RCVTIMEO, 60000)  # Tăng timeout lên 60s
                    ollama_socket.setsockopt(zmq.SNDTIMEO, 60000)
                    ollama_socket.setsockopt(zmq.LINGER, 0)
                    max_retries = 5
                    retry_delay = 10

                    for attempt in range(max_retries):
                        try:
                            logger.debug(f"Attempt {attempt + 1}/{max_retries} to connect to tcp://localhost:5558")
                            ollama_socket.connect("tcp://localhost:5558")
                            logger.debug("Connection to ollama_chat_client established")
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

                            response = ollama_socket.recv_json()
                            logger.debug(f"Received response from ollama_chat_client: {response}")
                            socket.send_json(response)
                            break
                        except zmq.error.ZMQError as e:
                            logger.error(f"ZeroMQ connection error (attempt {attempt + 1}/{max_retries}): {e}")
                            ollama_socket.close()  # Đóng và tạo lại socket
                            ollama_socket = context.socket(zmq.REQ)
                            ollama_socket.setsockopt(zmq.RCVTIMEO, 60000)
                            ollama_socket.setsockopt(zmq.SNDTIMEO, 60000)
                            ollama_socket.setsockopt(zmq.LINGER, 0)
                            if attempt < max_retries - 1:
                                await asyncio.sleep(retry_delay)
                                continue
                            socket.send_json({'error': f'Failed to connect to ollama_chat_client after {max_retries} attempts: {e}'})
                        finally:
                            ollama_socket.close()

                else:
                    logger.error(f"Invalid action: {action}")
                    socket.send_json({'error': 'Invalid action'})
            except Exception as e:
                logger.error(f"Error in main loop: {str(e)}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                socket.send_json({'error': str(e)})
            finally:
                response_time = time.time() - start_time
                logger.debug(f"Response time: {response_time:.2f} seconds")
                logger.debug(f"Current memory usage: {sys.getsizeof(conversation_context) / 1024:.2f} KB")

if __name__ == "__main__":
    asyncio.run(main())
=======
def get_singers(artist_name=None):
    """Truy vấn danh sách ca sĩ từ database."""
    query = Singer.objects.all()
    if artist_name:
        query = query.filter(name__icontains=artist_name)
    return list(query.values("id", "name", "followers"))

@sync_to_async
def get_songs(artist_id=None, song_name=None):
    """Truy vấn danh sách bài hát từ database."""
    query = Song.objects.all()
    if artist_id:
        query = query.filter(singer__id=artist_id)
    if song_name:
        query = query.filter(name__icontains=song_name)
    return list(query.values("id", "name", "release_date"))

async def query_database(entity_type: str, action: str, params: Dict, context: str = ""):
    """Truy vấn database dựa trên entity_type, action và params."""
    cache_key = sanitize_cache_key(f"db_query_{entity_type}_{action}_{json.dumps(params)}")
    cached_result = await sync_to_async(cache.get)(cache_key)
    if cached_result:
        logger.debug(f"Cache hit for {cache_key}")
        return cached_result

    try:
        if entity_type == "singer":
            if action == "list":
                artist_name = params.get("artist_name")
                result = await get_singers(artist_name)
            elif action == "detail":
                singer_id = params.get("singer_id")
                result = await get_singers(singer_id=singer_id) if singer_id else []
        elif entity_type == "song":
            if action == "list":
                artist_name = params.get("artist_name")
                singers = await get_singers(artist_name) if artist_name else []
                songs = []
                for singer in singers:
                    songs.extend(await get_songs(artist_id=singer["id"]))
                result = {"songs": songs}
            elif action == "detail":
                song_name = params.get("song_name")
                result = await get_songs(song_name=song_name) if song_name else []
            elif action == "count":
                result = {"count": await get_songs().count()}
        else:
            result = {}

        await sync_to_async(cache.set)(cache_key, result, timeout=300)
        return result
    except Exception as e:
        logger.error(f"Database query error: {str(e)} with traceback: {traceback.format_exc()}")
        return {}

@app.post("/mcp/query")
async def mcp_query(data: Dict[str, Any]):
    user_id = data.get("user_id", None)
    user_query = data.get("query", "").lower()
    session = aiohttp.ClientSession()

    try:
        # Phân tích yêu cầu
        analysis_result = await analysis_chain.ainvoke({"question": user_query})
        entity_type = analysis_result.get("entity_type", "")
        action = analysis_result.get("action", "")
        params = analysis_result.get("params", {})
        logger.debug(f"Analyzed - entity_type: {entity_type}, action: {action}, params: {params}")

        # Truy vấn database
        db_data = await query_database(entity_type, action, params, conversation_context.get(user_id, ""))
        logger.debug(f"Database result: {db_data}")

        # Tạo phản hồi
        result = await response_chain.ainvoke({
            "context": conversation_context.get(user_id, ""),
            "db_data": str(db_data),
            "question": user_query
        })

        # Cập nhật ngữ cảnh
        conversation_context[user_id] = conversation_context.get(user_id, "") + f"\nNgười dùng: {user_query}\nAI: {result}"

        return {"response": result}
    except Exception as e:
        logger.error(f"Error in mcp_query: {str(e)} with traceback: {traceback.format_exc()}")
        return {"error": f"Lỗi xử lý: {str(e)}"}
    finally:
        await session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
>>>>>>> gibao
