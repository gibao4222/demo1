# # # import os
# # # import sys
# # # import django
# # # import asyncio
# # # import logging
# # # import json
# # # from fastapi import FastAPI
# # # from typing import Dict, Any
# # # from langchain_ollama import OllamaLLM
# # # from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
# # # from langchain_core.output_parsers import JsonOutputParser
# # # import aiohttp
# # # import traceback
# # # from asgiref.sync import sync_to_async
# # # from django.core.cache import cache
# # # import hashlib


# # # # Thiết lập logging
# # # logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
# # # logger = logging.getLogger(__name__)

# # # # Đặt đường dẫn gốc của project
# # # BASE_DIR = "/var/www/demo1/backend"
# # # os.chdir(BASE_DIR)
# # # logger.debug(f"Current working directory changed to: {os.getcwd()}")

# # # # Cấu hình Django
# # # sys.path.append(BASE_DIR)
# # # os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
# # # django.setup()

# # # # Import models từ Django
# # # from singer.models import Singer  # Thay bằng model thực tế của bạn
# # # from song.models import Song  # Thay bằng model thực tế của bạn

# # # app = FastAPI()

# # # # Cấu hình Ollama với LangChain
# # # analysis_template = """
# # # Bạn là một chatbot hỗ trợ bằng tiếng việt cho trang web phát nhạc trực tuyến Spotify Clone. 
# # # Những điều bạn cần làm khi nhận được tin nhắn của người dùng là:
# # # 1. Phân tích yêu cầu: Xác định ý định (hỏi thông tin, tìm kiếm, đếm) và từ khóa.
# # # 2. Xác định thông tin cần truy vấn: Loại dữ liệu (ca sĩ, bài hát, album) và điều kiện (tên, thể loại).
# # # 3. Hãy chỉ trả về một JSON hợp lệ với các trường: intent, entity_type, action, params. Không thêm bất kỳ văn bản nào ngoài JSON.

# # # Ví dụ:
# # # - Yêu cầu: "Thông tin bài hát Shape of You"
# # #   Kết quả: {{"intent": "info", "entity_type": "song", "action": "detail", "params": {{"song_name": "Shape of You"}}}}
# # # - Yêu cầu: "Danh sách bài hát của Wren Evans"
# # #   Kết quả: {{"intent": "search", "entity_type": "song", "action": "list", "params": {{"artist_name": "Wren Evans"}}}}
# # # >>>>>>> gibao

# # # Yêu cầu: {question}

# # # Kết quả: {format_instructions}
# # # """
# # # analysis_model = OllamaLLM(model="llama3")
# # # analysis_parser = JsonOutputParser()
# # # analysis_prompt = PromptTemplate(
# # #     template=analysis_template,
# # #     input_variables=["question"],
# # #     partial_variables={"format_instructions": analysis_parser.get_format_instructions()}
# # # )
# # # analysis_chain = analysis_prompt | analysis_model | analysis_parser

# # # # Cấu hình trả lời
# # # response_template = """
# # # Bạn là một chatbot hỗ trợ bằng tiếng việt cho trang web phát nhạc trực tuyến Spotify Clone.
# # # Dựa trên dữ liệu từ database (db_data), hãy trả lời câu hỏi một cách tự nhiên và thân thiện. 
# # # CHỈ SỬ DỤNG THÔNG TIN TỪ db_data ĐỂ TRẢ LỜI, KHÔNG TỰ TẠO NỘI DUNG TỪ KIẾN THỨC CỦA BẠN.

# # # Lịch sử cuộc trò chuyện: {context}
# # # Dữ liệu từ database: {db_data}
# # # Câu hỏi: {question}

# # # Câu trả lời:
# # # """
# # # response_model = OllamaLLM(model="vinallama:latest")
# # # response_prompt = ChatPromptTemplate.from_template(response_template)
# # # response_chain = response_prompt | response_model

# # # # Lưu trữ ngữ cảnh
# # # conversation_context = {}

# # # def sanitize_cache_key(key):
# # #     """Sanitize cache key to make it Memcached-compatible."""
# # #     return hashlib.md5(key.encode()).hexdigest()

# # # @sync_to_async
# # # def get_singers(artist_name=None):
# # #     """Truy vấn danh sách ca sĩ từ database."""
# # #     query = Singer.objects.all()
# # #     if artist_name:
# # #         query = query.filter(name__icontains=artist_name)
# # #     return list(query.values("id", "name", "followers"))

# # # @sync_to_async
# # # def get_songs(artist_id=None, song_name=None):
# # #     """Truy vấn danh sách bài hát từ database."""
# # #     query = Song.objects.all()
# # #     if artist_id:
# # #         query = query.filter(singer__id=artist_id)
# # #     if song_name:
# # #         query = query.filter(name__icontains=song_name)
# # #     return list(query.values("id", "name", "release_date"))

# # # async def query_database(entity_type: str, action: str, params: Dict, context: str = ""):
# # #     """Truy vấn database dựa trên entity_type, action và params."""
# # #     cache_key = sanitize_cache_key(f"db_query_{entity_type}_{action}_{json.dumps(params)}")
# # #     cached_result = await sync_to_async(cache.get)(cache_key)
# # #     if cached_result:
# # #         logger.debug(f"Cache hit for {cache_key}")
# # #         return cached_result

# # #     try:
# # #         if entity_type == "singer":
# # #             if action == "list":
# # #                 artist_name = params.get("artist_name")
# # #                 result = await get_singers(artist_name)
# # #             elif action == "detail":
# # #                 singer_id = params.get("singer_id")
# # #                 result = await get_singers(singer_id=singer_id) if singer_id else []
# # #         elif entity_type == "song":
# # #             if action == "list":
# # #                 artist_name = params.get("artist_name")
# # #                 singers = await get_singers(artist_name) if artist_name else []
# # #                 songs = []
# # #                 for singer in singers:
# # #                     songs.extend(await get_songs(artist_id=singer["id"]))
# # #                 result = {"songs": songs}
# # #             elif action == "detail":
# # #                 song_name = params.get("song_name")
# # #                 result = await get_songs(song_name=song_name) if song_name else []
# # #             elif action == "count":
# # #                 result = {"count": await get_songs().count()}
# # #         else:
# # #             result = {}

# # #         await sync_to_async(cache.set)(cache_key, result, timeout=300)
# # #         return result
# # #     except Exception as e:
# # #         logger.error(f"Database query error: {str(e)} with traceback: {traceback.format_exc()}")
# # #         return {}

# # # @app.post("/mcp/query")
# # # async def mcp_query(data: Dict[str, Any]):
# # #     user_id = data.get("user_id", None)
# # #     user_query = data.get("query", "").lower()
# # #     session = aiohttp.ClientSession()

# # #     try:
# # #         # Phân tích yêu cầu
# # #         analysis_result = await analysis_chain.ainvoke({"question": user_query})
# # #         entity_type = analysis_result.get("entity_type", "")
# # #         action = analysis_result.get("action", "")
# # #         params = analysis_result.get("params", {})
# # #         logger.debug(f"Analyzed - entity_type: {entity_type}, action: {action}, params: {params}")

# # #         # Truy vấn database
# # #         db_data = await query_database(entity_type, action, params, conversation_context.get(user_id, ""))
# # #         logger.debug(f"Database result: {db_data}")

# # #         # Tạo phản hồi
# # #         result = await response_chain.ainvoke({
# # #             "context": conversation_context.get(user_id, ""),
# # #             "db_data": str(db_data),
# # #             "question": user_query
# # #         })

# # #         # Cập nhật ngữ cảnh
# # #         conversation_context[user_id] = conversation_context.get(user_id, "") + f"\nNgười dùng: {user_query}\nAI: {result}"

# # #         return {"response": result}
# # #     except Exception as e:
# # #         logger.error(f"Error in mcp_query: {str(e)} with traceback: {traceback.format_exc()}")
# # #         return {"error": f"Lỗi xử lý: {str(e)}"}
# # #     finally:
# # #         await session.close()

# # # if __name__ == "__main__":
# # #     import uvicorn
# # #     uvicorn.run(app, host="0.0.0.0", port=8001)

# # import os
# # import sys
# # import django
# # import asyncio
# # import logging
# # import json
# # from fastapi import FastAPI
# # from typing import Dict, Any
# # from langchain_ollama import OllamaLLM
# # from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
# # from langchain_core.output_parsers import JsonOutputParser
# # import aiohttp
# # import traceback
# # from asgiref.sync import sync_to_async
# # from django.core.cache import cache
# # import hashlib

# # # Thiết lập logging
# # logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
# # logger = logging.getLogger(__name__)

# # # Đặt đường dẫn gốc của project
# # BASE_DIR = "/var/www/demo1/backend"
# # os.chdir(BASE_DIR)
# # logger.debug(f"Current working directory changed to: {os.getcwd()}")

# # # Cấu hình Django
# # sys.path.append(BASE_DIR)
# # os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
# # django.setup()

# # # Import models từ Django
# # from singer.models import Singer, SingerSong
# # from song.models import Song
# # from album.models import Album, AlbumSong
# # from genre.models import Genre
# # from playlist.models import Playlist, PlaylistSong
# # from spotify_user.models import SpotifyUser
# # from history.models import History

# # app = FastAPI()

# # # Cấu hình phân tích câu hỏi với LangChain
# # analysis_template = """
# # Bạn là một chatbot hỗ trợ bằng tiếng Việt cho trang web phát nhạc trực tuyến Spotify Clone. Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và trả về một JSON hợp lệ với các trường: intent, entity_type, action, params, sort (nếu có). Không thêm bất kỳ văn bản nào ngoài JSON.

# # ### Hướng dẫn:
# # 1. **Phân tích ý định (intent)**:
# #    - "info": Hỏi thông tin chi tiết (ví dụ: thông tin ca sĩ, bài hát, album, playlist).
# #    - "search": Tìm kiếm danh sách (ví dụ: danh sách bài hát, album, playlist).
# #    - "count": Đếm số lượng (ví dụ: số playlist, số bài hát).
# #    - "analyze": Phân tích dữ liệu (ví dụ: bài hát phổ biến nhất).
# #    - "check": Kiểm tra trạng thái hoặc thông tin (ví dụ: biết bài hát không).

# # 2. **Xác định thực thể (entity_type)**:
# #    - "singer": Ca sĩ.
# #    - "song": Bài hát.
# #    - "album": Album.
# #    - "genre": Thể loại.
# #    - "playlist": Playlist.
# #    - "history": Lịch sử nghe.
# #    - "user": Người dùng.

# # 3. **Xác định hành động (action)**:
# #    - "list": Lấy danh sách.
# #    - "detail": Lấy thông tin chi tiết (bao gồm thông tin liên quan từ các bảng ràng buộc).
# #    - "count": Đếm số lượng.
# #    - "top": Tìm giá trị cao nhất (ví dụ: bài hát phổ biến nhất).
# #    - "recent": Tìm giá trị gần đây nhất.
# #    - "status": Kiểm tra trạng thái hoặc tồn tại.

# # 4. **Xác định tham số (params)**:
# #    - Các tham số phổ biến: artist_name, album_name, song_name, playlist_name, username.
# #    - Nếu không có tham số cụ thể, để params rỗng: {{}}.
# #    - Nếu có "của tôi" trong câu hỏi, thêm username từ ngữ cảnh (nếu có).

# # 5. **Xác định sắp xếp (sort)** (nếu có):
# #    - "popularity": Sắp xếp theo độ phổ biến.
# #    - "release_date": Sắp xếp theo ngày phát hành.

# # ### Ví dụ:
# # - Yêu cầu: "Có tổng bao nhiêu playlist trong hệ thống"
# #   Kết quả: {{"intent": "count", "entity_type": "playlist", "action": "count", "params": {{}}}}
# # - Yêu cầu: "Bài hát Song_Wren_1 của Wren Evans thuộc album nào"
# #   Kết quả: {{"intent": "info", "entity_type": "song", "action": "detail", "params": {{"song_name": "Song_Wren_1", "artist_name": "Wren Evans"}}}}
# # - Yêu cầu: "Liệt kê danh sách tên các bài hát có trong hệ thống"
# #   Kết quả: {{"intent": "search", "entity_type": "song", "action": "list", "params": {{}}}}
# # - Yêu cầu: "Thông tin nghệ sĩ Ed Sheeran"
# #   Kết quả: {{"intent": "info", "entity_type": "singer", "action": "detail", "params": {{"artist_name": "Ed Sheeran"}}}}
# # - Yêu cầu: "Liệt kê các bài hát trong playlist Favorites"
# #   Kết quả: {{"intent": "search", "entity_type": "playlist", "action": "list", "params": {{"playlist_name": "Favorites"}}}}
# # - Yêu cầu: "Bạn có biết bài Song_Wren_1 không"
# #   Kết quả: {{"intent": "check", "entity_type": "song", "action": "status", "params": {{"song_name": "Song_Wren_1"}}}}
# # - Yêu cầu: "Lịch sử nghe nhạc của tôi"
# #   Kết quả: {{"intent": "search", "entity_type": "history", "action": "list", "params": {{"username": "user1"}}}}
# # - Yêu cầu: "Tôi đang buồn thì nghe nhạc gì"
# #   Kết quả: {{"intent": "analyze", "entity_type": "song", "action": "top", "params": {{}}, "sort": "popularity"}}

# # Yêu cầu: {question}

# # Kết quả: {format_instructions}
# # """
# # analysis_model = OllamaLLM(model="llama3:latest")
# # analysis_parser = JsonOutputParser()
# # analysis_prompt = PromptTemplate(
# #     template=analysis_template,
# #     input_variables=["question"],
# #     partial_variables={"format_instructions": analysis_parser.get_format_instructions()}
# # )
# # analysis_chain = analysis_prompt | analysis_model | analysis_parser

# # # Cấu hình trả lời với LangChain
# # response_template = """
# # Bạn là một chatbot hỗ trợ bằng tiếng Việt cho trang web phát nhạc trực tuyến Spotify Clone.
# # Dựa trên dữ liệu từ database (db_data), hãy trả lời câu hỏi một cách tự nhiên, thông minh và chỉ sử dụng các trường dữ liệu có trong db_data (như id, name, release_date, popularity, v.v.) cùng với mối quan hệ giữa các bảng (ca sĩ - bài hát, album - bài hát, playlist - bài hát).
# # Không tự bổ sung thông tin không có trong db_data.
# # Nếu không tìm thấy dữ liệu, hãy trả lời: "Mình không tìm thấy thông tin phù hợp, bạn thử hỏi khác nhé!"

# # Dữ liệu từ database: {db_data}
# # Câu hỏi: {question}

# # Câu trả lời:
# # """
# # response_model = OllamaLLM(model="llama3:latest")
# # response_prompt = ChatPromptTemplate.from_template(response_template)
# # response_chain = response_prompt | response_model

# # def sanitize_cache_key(key):
# #     """Sanitize cache key to make it Memcached-compatible."""
# #     return hashlib.md5(key.encode()).hexdigest()

# # @sync_to_async
# # def get_singers(artist_name=None, singer_id=None):
# #     """Truy vấn danh sách ca sĩ từ database."""
# #     query = Singer.objects.all()
# #     if artist_name:
# #         query = query.filter(name__icontains=artist_name)
# #     if singer_id:
# #         query = query.filter(id=singer_id)
# #     return list(query.values("id", "name", "followers", "birthday", "description", "image"))

# # @sync_to_async
# # def get_singer_songs(singer_id):
# #     """Truy vấn danh sách bài hát của ca sĩ."""
# #     songs = Song.objects.filter(song_singer__id_singer=singer_id).select_related('id_genre')
# #     return list(songs.values("id", "name", "release_date", "popularity", "id_genre__name"))

# # @sync_to_async
# # def get_albums(artist_name=None, album_name=None, singer_id=None):
# #     """Truy vấn danh sách album từ database."""
# #     query = Album.objects.select_related('id_singer').all()
# #     if artist_name:
# #         query = query.filter(id_singer__name__icontains=artist_name)
# #     if album_name:
# #         query = query.filter(name__icontains=album_name)
# #     if singer_id:
# #         query = query.filter(id_singer_id=singer_id)
# #     return list(query.values("id", "name", "release_date", "popularity", "id_singer__name"))

# # @sync_to_async
# # def get_album_songs(album_id):
# #     """Truy vấn danh sách bài hát trong album."""
# #     query = AlbumSong.objects.filter(id_album_id=album_id).select_related('id_song')
# #     return list(query.values("id_song__id", "id_song__name", "id_song__release_date"))

# # @sync_to_async
# # def get_songs(song_name=None, artist_id=None, genre_id=None, is_vip=None):
# #     """Truy vấn danh sách bài hát từ database."""
# #     query = Song.objects.select_related('id_genre').all()
# #     if song_name:
# #         query = query.filter(name__icontains=song_name)
# #     if artist_id:
# #         query = query.filter(song_singer__id_singer=artist_id)
# #     if genre_id:
# #         query = query.filter(id_genre_id=genre_id)
# #     if is_vip is not None:
# #         query = query.filter(is_vip=is_vip)
# #     return list(query.values("id", "name", "release_date", "popularity", "is_active", "url_song", "id_genre__name", "is_vip"))

# # @sync_to_async
# # def get_playlists(username=None, playlist_name=None):
# #     """Truy vấn danh sách playlist từ database."""
# #     query = Playlist.objects.select_related('id_user').all()
# #     if username:
# #         query = query.filter(id_user__username=username)
# #     if playlist_name:
# #         query = query.filter(name__icontains=playlist_name)
# #     return list(query.values("id", "name", "create_date", "id_user__username", "description"))

# # @sync_to_async
# # def get_playlist_songs(playlist_id):
# #     """Truy vấn danh sách bài hát trong playlist."""
# #     query = PlaylistSong.objects.filter(id_playlist_id=playlist_id).select_related('id_song')
# #     return list(query.values("id_song__id", "id_song__name", "id_song__release_date"))

# # @sync_to_async
# # def get_history(username=None):
# #     """Truy vấn lịch sử nghe từ database."""
# #     query = History.objects.select_related('id_song', 'id_user').all()
# #     if username:
# #         query = query.filter(id_user__username=username)
# #     return list(query.values("id", "id_song__name", "id_user__username", "listen_date", "play_duration", "listen_count"))

# # async def query_database(entity_type: str, action: str, params: Dict, sort: str = None):
# #     """Truy vấn database dựa trên entity_type, action, params và sort, sử dụng các mối quan hệ bảng."""
# #     cache_key = sanitize_cache_key(f"db_query_{entity_type}_{action}_{json.dumps(params)}_{sort}")
# #     cached_result = await sync_to_async(cache.get)(cache_key)
# #     if cached_result:
# #         logger.debug(f"Cache hit for {cache_key}")
# #         return cached_result

# #     try:
# #         artist_name = params.get("artist_name")
# #         album_name = params.get("album_name")
# #         song_name = params.get("song_name")
# #         playlist_name = params.get("playlist_name")
# #         username = params.get("username")

# #         if entity_type == "singer":
# #             if action == "detail":
# #                 singers = await get_singers(artist_name=artist_name)
# #                 if singers:
# #                     singer = singers[0]
# #                     singer_id = singer["id"]
# #                     songs = await get_singer_songs(singer_id)
# #                     albums = await get_albums(singer_id=singer_id)
# #                     result = {"singer": singer, "songs": songs, "albums": albums}
# #                 else:
# #                     result = {}
# #             else:
# #                 result = await get_singers(artist_name=artist_name)
# #         elif entity_type == "album":
# #             if action == "detail":
# #                 albums = await get_albums(artist_name=artist_name, album_name=album_name)
# #                 if albums:
# #                     album = albums[0]
# #                     album_id = album["id"]
# #                     songs = await get_album_songs(album_id)
# #                     result = {"album": album, "songs": songs}
# #                 else:
# #                     result = {}
# #             else:
# #                 result = await get_albums(artist_name=artist_name)
# #         elif entity_type == "song":
# #             if action == "list":
# #                 if artist_name:
# #                     singers = await get_singers(artist_name=artist_name)
# #                     songs = []
# #                     for singer in singers:
# #                         songs.extend(await get_songs(artist_id=singer["id"]))
# #                     result = {"songs": songs}
# #                 else:
# #                     result = await get_songs()
# #             elif action == "detail":
# #                 songs = await get_songs(song_name=song_name)
# #                 if songs:
# #                     song = songs[0]
# #                     artist_id = Song.objects.filter(name=song_name).values("song_singer__id_singer").first()
# #                     if artist_id:
# #                         singer = await get_singers(singer_id=artist_id["song_singer__id_singer"])
# #                         albums = await get_albums(singer_id=artist_id["song_singer__id_singer"])
# #                         result = {"song": song, "singer": singer[0] if singer else {}, "albums": albums}
# #                     else:
# #                         result = {"song": song}
# #                 else:
# #                     result = {}
# #         elif entity_type == "playlist":
# #             if action == "count":
# #                 playlists = await get_playlists()
# #                 result = {"count": len(playlists)}
# #             elif action == "list":
# #                 playlists = await get_playlists(playlist_name=playlist_name)
# #                 if playlists:
# #                     playlist = playlists[0]
# #                     playlist_id = playlist["id"]
# #                     songs = await get_playlist_songs(playlist_id)
# #                     result = {"playlist": playlist, "songs": songs}
# #                 else:
# #                     result = {}
# #         elif entity_type == "history":
# #             if action == "list":
# #                 history = await get_history(username=username)
# #                 result = {"history": history}
# #         elif entity_type == "user":
# #             pass  # Chưa xử lý chi tiết cho user
# #         else:
# #             result = {}

# #         await sync_to_async(cache.set)(cache_key, result, timeout=300)
# #         return result
# #     except Exception as e:
# #         logger.error(f"Database query error: {str(e)} with traceback: {traceback.format_exc()}")
# #         return {}

# # @app.post("/mcp/query")
# # async def mcp_query(data: Dict[str, Any]):
# #     user_id = data.get("user_id", "default")
# #     user_query = data.get("query", "").lower()
# #     session = aiohttp.ClientSession()

# #     try:
# #         # Phân tích yêu cầu
# #         analysis_result = await analysis_chain.ainvoke({"question": user_query})
# #         logger.debug(f"Analysis result: {analysis_result}")
# #         entity_type = analysis_result.get("entity_type", "")
# #         action = analysis_result.get("action", "")
# #         params = analysis_result.get("params", {})
# #         sort = analysis_result.get("sort", None)
# #         logger.debug(f"Analyzed - entity_type: {entity_type}, action: {action}, params: {params}, sort: {sort}")

# #         # Truy vấn database
# #         db_data = await query_database(entity_type, action, params, sort)
# #         logger.debug(f"Database result: {db_data}")

# #         # Tạo phản hồi
# #         result = await response_chain.ainvoke({
# #             "db_data": str(db_data),
# #             "question": user_query
# #         })

# #         return {"response": result}
# #     except Exception as e:
# #         logger.error(f"Error in mcp_query: {str(e)} with traceback: {traceback.format_exc()}")
# #         return {"error": f"Lỗi xử lý: {str(e)}"}
# #     finally:
# #         await session.close()

# # if __name__ == "__main__":
# #     import uvicorn
# #     uvicorn.run(app, host="0.0.0.0", port=8001)




# import os
# import sys
# import django
# import asyncio
# import logging
# import json
# from fastapi import FastAPI
# from typing import Dict, Any, List
# from langchain_ollama import OllamaLLM
# from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
# from langchain_core.output_parsers import JsonOutputParser
# import aiohttp
# import traceback
# from asgiref.sync import sync_to_async
# from django.core.cache import cache
# import hashlib
# from django.db.models import Sum, Q
# from datetime import datetime

# # Thiết lập logging
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Đặt đường dẫn gốc của project
# BASE_DIR = "/var/www/demo1/backend"
# os.chdir(BASE_DIR)
# logger.debug(f"Current working directory changed to: {os.getcwd()}")

# # Cấu hình Django
# sys.path.append(BASE_DIR)
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
# django.setup()

# # Import models từ Django
# from singer.models import Singer, SingerSong
# from song.models import Song
# from album.models import Album, AlbumSong
# from genre.models import Genre
# from playlist.models import Playlist
# from history.models import History
# from django.contrib.auth.models import User

# app = FastAPI()

# # Cấu hình phân tích câu hỏi với LangChain
# analysis_template = """
# Bạn là một chatbot hỗ trợ bằng tiếng Việt cho trang web phát nhạc trực tuyến Spotify Clone. Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và trả về một JSON hợp lệ với các trường: intent, entity_type, action, params, sort (nếu có). Không thêm bất kỳ văn bản nào ngoài JSON.

# ### Hướng dẫn:
# 1. **Phân tích ý định (intent)**:
#    - "info": Hỏi thông tin chi tiết (ví dụ: thông tin ca sĩ, bài hát, album).
#    - "search": Tìm kiếm danh sách (ví dụ: danh sách bài hát, playlist).
#    - "count": Đếm số lượng (ví dụ: số bài hát, số playlist).
#    - "analyze": Phân tích dữ liệu (ví dụ: gợi ý bài hát khi buồn).
#    - "check": Kiểm tra trạng thái hoặc thông tin (ví dụ: biết bài hát không).

# 2. **Xác định thực thể (entity_type)**:
#    - "singer": Ca sĩ.
#    - "song": Bài hát.
#    - "album": Album.
#    - "genre": Thể loại.
#    - "playlist": Playlist.
#    - "history": Lịch sử nghe.
#    - "user": Người dùng.

# 3. **Xác định hành động (action)**:
#    - "list": Lấy danh sách.
#    - "detail": Lấy thông tin chi tiết.
#    - "count": Đếm số lượng.
#    - "top": Tìm giá trị cao nhất (ví dụ: bài hát phổ biến nhất).

# 4. **Xác định tham số (params)**:
#    - Các tham số phổ biến: artist_name, song_name, album_name, playlist_name, username, genre_name, date, year.
#    - Nếu không có tham số cụ thể, để params rỗng: {{}}.
#    - Nếu có "của tôi" trong câu hỏi, thêm username từ ngữ cảnh (nếu có).
#    - Nếu có khoảng thời gian (ví dụ: "từ ngày ... đến ngày ..."), thêm date dưới dạng "start_date to end_date".
#    - Nếu có năm (ví dụ: "trong năm 2024"), thêm year.

# 5. **Xác định sắp xếp (sort)** (nếu có):
#    - "popularity": Sắp xếp theo độ phổ biến.
#    - "listen_count": Sắp xếp theo số lần phát.
#    - "play_duration": Sắp xếp theo thời gian phát.

# ### Ví dụ:
# - Yêu cầu: "Các bài hát của Ed Sheeran có trong hệ thống"
#   Kết quả: {{"intent": "search", "entity_type": "song", "action": "list", "params": {{"artist_name": "Ed Sheeran"}}}}
# - Yêu cầu: "Vậy có tổng cộng bao nhiêu bài trong hệ thống"
#   Kết quả: {{"intent": "count", "entity_type": "song", "action": "count", "params": {{}}}}
# - Yêu cầu: "Tôi đang buồn thì nghe nhạc gì"
#   Kết quả: {{"intent": "analyze", "entity_type": "song", "action": "top", "params": {{"genre_name": "Ballad"}}, "sort": "popularity"}}
# - Yêu cầu: "Hãy cho tôi danh sách 3 bài hát phổ biến nhất thuộc thể loại Ballad được phát nhiều nhất bởi người dùng 'user1' trong tháng 4 năm 2025"
#   Kết quả: {{"intent": "analyze", "entity_type": "song", "action": "top", "params": {{"username": "user1", "genre_name": "Ballad", "date": "2025-04-01 to 2025-04-30"}}, "sort": "listen_count"}}
# - Yêu cầu: "Có bao nhiêu bài hát được phát hành trong năm 2024"
#   Kết quả: {{"intent": "count", "entity_type": "song", "action": "count", "params": {{"year": "2024"}}}}
# - Yêu cầu: "Người dùng nào nghe nhạc nhiều nhất trong khoảng thời gian từ 01/04/2025 đến 30/04/2025"
#   Kết quả: {{"intent": "analyze", "entity_type": "user", "action": "top", "params": {{"date": "2025-04-01 to 2025-04-30"}}, "sort": "listen_count"}}

# Yêu cầu: {question}

# Kết quả: {format_instructions}
# """
# analysis_model = OllamaLLM(model="llama3:latest")
# analysis_parser = JsonOutputParser()
# analysis_prompt = PromptTemplate(
#     template=analysis_template,
#     input_variables=["question"],
#     partial_variables={"format_instructions": analysis_parser.get_format_instructions()}
# )
# analysis_chain = analysis_prompt | analysis_model | analysis_parser

# # Cấu hình trả lời với LangChain - CẬP NHẬT
# response_template = """
# Bạn là một chatbot hỗ trợ bằng tiếng Việt cho trang web phát nhạc trực tuyến Spotify Clone.
# Dựa trên dữ liệu từ database (db_data), hãy trả lời câu hỏi một cách tự nhiên, thông minh và chỉ sử dụng các trường dữ liệu có trong db_data (như id, name, release_date, popularity, v.v.).
# Không tự bổ sung thông tin không có trong db_data.
# Nếu db_data chứa lỗi hoặc không có dữ liệu, hãy trả lời: "Mình không tìm thấy thông tin phù hợp, có thể dữ liệu chưa đầy đủ. Bạn thử kiểm tra lại hoặc hỏi khác nhé!"
# Nếu có dữ liệu, hãy trình bày chi tiết (ví dụ: liệt kê tên bài hát, ca sĩ, thể loại) để câu trả lời dễ hiểu.
# Nếu câu hỏi liên quan đến số lượng (count), hãy nêu rõ số lượng và thêm thông tin bổ sung nếu có (ví dụ: danh sách bài hát).

# Dữ liệu từ database: {db_data}
# Câu hỏi: {question}

# Câu trả lời:
# """
# response_model = OllamaLLM(model="llama3:latest")
# response_prompt = ChatPromptTemplate.from_template(response_template)
# response_chain = response_prompt | response_model

# def sanitize_cache_key(key):
#     """Sanitize cache key to make it Memcached-compatible."""
#     return hashlib.md5(key.encode()).hexdigest()

# @sync_to_async
# def get_singers(artist_name=None):
#     """Truy vấn danh sách ca sĩ từ database."""
#     query = Singer.objects.all()
#     if artist_name:
#         query = query.filter(name__icontains=artist_name)
#     return list(query.values("id", "name", "followers", "birthday", "description", "image"))

# @sync_to_async
# def get_songs(song_name=None, artist_name=None, genre_name=None, album_id=None, year=None):
#     """Truy vấn danh sách bài hát từ database - BỔ SUNG KIỂM TRA."""
#     query = Song.objects.select_related('id_genre').prefetch_related('song_singer__id_singer')
#     if song_name:
#         query = query.filter(name__icontains=song_name)
#     if artist_name:
#         query = query.filter(song_singer__id_singer__name__icontains=artist_name).distinct()
#     if genre_name:
#         # Kiểm tra sự tồn tại của thể loại
#         if not Genre.objects.filter(name__iexact=genre_name).exists():
#             logger.debug(f"Genre {genre_name} not found in database")
#             return []
#         query = query.filter(id_genre__name__iexact=genre_name)
#     if album_id:
#         query = query.filter(song_albums__id_album_id=album_id).distinct()
#     if year:
#         try:
#             year_int = int(year)
#             current_year = datetime.now().year
#             if year_int < 1900 or year_int > current_year + 1:
#                 logger.warning(f"Invalid year: {year}")
#                 return []
#             query = query.filter(release_date__year=year_int)
#         except ValueError:
#             logger.error(f"Invalid year format: {year}")
#             return []
    
#     songs = list(query.values(
#         "id", "name", "release_date", "popularity", "id_genre__name",
#         "url_song", "url_video", "url_lyric", "is_vip"
#     ))
#     logger.debug(f"Songs retrieved: {len(songs)} for artist={artist_name}, genre={genre_name}, year={year}")
#     return songs

# @sync_to_async
# def get_albums(artist_name=None, album_name=None):
#     """Truy vấn danh sách album từ database."""
#     query = Album.objects.select_related('id_singer').all()
#     if artist_name:
#         query = query.filter(id_singer__name__icontains=artist_name)
#     if album_name:
#         query = query.filter(name__iexact=album_name)
#     return list(query.values("id", "name", "release_date", "popularity", "id_singer__name", "image"))

# @sync_to_async
# def get_playlists(date=None):
#     """Truy vấn danh sách playlist từ database."""
#     query = Playlist.objects.all()
#     if date:
#         query = query.filter(create_date=date)
#     return list(query.values("id", "name", "create_date", "id_user__username"))

# @sync_to_async
# def get_history(username=None, date_range=None, artist_name=None):
#     """Truy vấn lịch sử nghe từ database."""
#     query = History.objects.select_related('id_song', 'id_user', 'id_singer').all()
#     if username:
#         query = query.filter(id_user__username=username)
#     if date_range:
#         start_date, end_date = date_range.split(' to ')
#         query = query.filter(listen_date__range=[start_date, end_date])
#     if artist_name:
#         query = query.filter(id_singer__name__icontains=artist_name).distinct()
#     return list(query.values(
#         "id", "id_song__name", "id_singer__name", "listen_date",
#         "play_duration", "listen_count", "id_genre__name"
#     ))

# @sync_to_async
# def get_top_artist_by_listen_count(username):
#     """Truy vấn ca sĩ có bài hát được nghe nhiều nhất bởi user."""
#     history = History.objects.filter(id_user__username=username)\
#         .values('id_singer__name')\
#         .annotate(total_listens=Sum('listen_count'))\
#         .order_by('-total_listens')\
#         .first()
#     if history and history['id_singer__name']:
#         return {"id": None, "name": history['id_singer__name'], "total_listens": history['total_listens']}
#     return None

# @sync_to_async
# def get_genre_count(genre_name):
#     """Đếm số bài hát thuộc một thể loại cụ thể - CẬP NHẬT."""
#     if not genre_name:
#         logger.warning("No genre_name provided for get_genre_count")
#         return 0
#     if not Genre.objects.filter(name__iexact=genre_name).exists():
#         logger.debug(f"Genre {genre_name} not found in database")
#         return 0
#     count = Song.objects.filter(id_genre__name__iexact=genre_name).count()
#     logger.debug(f"Genre count for {genre_name}: {count}")
#     return count

# @sync_to_async
# def get_top_song_by_play_duration(username, date_range):
#     """Truy vấn bài hát được nghe lâu nhất bởi user trong khoảng thời gian."""
#     query = History.objects.select_related('id_song').filter(id_user__username=username)
#     if date_range:
#         start_date, end_date = date_range.split(' to ')
#         query = query.filter(listen_date__range=[start_date, end_date])
#     history = query.values('id_song__name', 'id_singer__name')\
#         .annotate(total_duration=Sum('play_duration'))\
#         .order_by('-total_duration')\
#         .first()
#     if history:
#         return {
#             "song_name": history['id_song__name'],
#             "singer_name": history['id_singer__name'],
#             "total_duration": history['total_duration']
#         }
#     return None

# @sync_to_async
# def get_top_songs_by_listen_count():
#     """Truy vấn danh sách bài hát được nghe nhiều nhất trong hệ thống."""
#     history = History.objects.values('id_song__name', 'id_singer__name')\
#         .annotate(total_listens=Sum('listen_count'))\
#         .order_by('-total_listens')[:10]
#     return list(history)

# @sync_to_async
# def get_top_user_by_listen_count(date_range):
#     """Truy vấn người dùng nghe nhạc nhiều nhất trong khoảng thời gian."""
#     query = History.objects.all()
#     if date_range:
#         start_date, end_date = date_range.split(' to ')
#         query = query.filter(listen_date__range=[start_date, end_date])
#     user = query.values('id_user__username')\
#         .annotate(total_listens=Sum('listen_count'))\
#         .order_by('-total_listens')\
#         .first()
#     if user:
#         return {"username": user['id_user__username'], "total_listens": user['total_listens']}
#     return None

# async def query_database(entity_type: str, action: str, params: Dict, sort: str = None) -> Dict:
#     """Truy vấn database dựa trên entity_type, action, params và sort - BỔ SUNG LOGIC."""
#     cache_key = sanitize_cache_key(f"db_query_{entity_type}_{action}_{json.dumps(params)}_{sort}")
#     cached_result = await sync_to_async(cache.get)(cache_key)
#     if cached_result:
#         logger.debug(f"Cache hit for {cache_key}")
#         return cached_result

#     result = {}
#     try:
#         artist_name = params.get("artist_name")
#         song_name = params.get("song_name")
#         album_name = params.get("album_name")
#         username = params.get("username")
#         genre_name = params.get("genre_name")
#         date = params.get("date")
#         year = params.get("year")

#         if entity_type == "singer":
#             if action == "list" or action == "detail":
#                 result = await get_singers(artist_name=artist_name)
#         elif entity_type == "song":
#             if action == "list":
#                 album_id = None
#                 if album_name:
#                     albums = await get_albums(album_name=album_name)
#                     album_id = albums[0]["id"] if albums else None
#                 songs = await get_songs(song_name=song_name, artist_name=artist_name, genre_name=genre_name, album_id=album_id, year=year)
#                 # Bổ sung: Trả về thông báo nếu không tìm thấy bài hát
#                 if not songs:
#                     result = {"error": f"Không tìm thấy bài hát nào cho {artist_name or ''} {genre_name or ''} {year or ''}"}
#                 else:
#                     result = {"songs": songs}
#             elif action == "detail":
#                 songs = await get_songs(song_name=song_name, artist_name=artist_name)
#                 if songs:
#                     song = songs[0]
#                     singers = await get_singers(artist_name=artist_name) if artist_name else []
#                     result = {"song": song, "singer": singers[0] if singers else {}}
#                 else:
#                     result = {"error": f"Không tìm thấy bài hát {song_name or ''} của {artist_name or ''}"}
#             elif action == "top":
#                 if username and genre_name and date:
#                     history = await get_history(username=username, date_range=date, artist_name=artist_name)
#                     songs = [h for h in history if genre_name.lower() in (h["id_genre__name"] or "").lower()]
#                     if sort == "listen_count":
#                         songs = sorted(songs, key=lambda x: x["listen_count"] or 0, reverse=True)[:3]
#                     elif sort == "popularity":
#                         songs = sorted(songs, key=lambda x: x["id_song__popularity"] or 0, reverse=True)[:3]
#                     for song in songs:
#                         song["singer_name"] = song["id_singer__name"]
#                     result = {"songs": songs}
#                 elif genre_name:
#                     songs = await get_songs(genre_name=genre_name)
#                     if sort == "popularity":
#                         songs = sorted(songs, key=lambda x: x["popularity"] or 0, reverse=True)[:2]
#                     result = {"songs": songs}
#                 else:
#                     songs = await get_top_songs_by_listen_count()
#                     result = {"songs": songs}
#             elif action == "count":
#                 songs = await get_songs(year=year, genre_name=genre_name)
#                 # Bổ sung: Trả về danh sách bài hát nếu có
#                 if year:
#                     result = {
#                         "count": len(songs),
#                         "songs": songs if songs else [],
#                         "message": f"Tìm thấy {len(songs)} bài hát phát hành năm {year}" if songs else f"Không tìm thấy bài hát nào phát hành năm {year}"
#                     }
#                 elif genre_name:
#                     result = {
#                         "count": len(songs),
#                         "songs": songs if songs else [],
#                         "message": f"Tìm thấy {len(songs)} bài hát thuộc thể loại {genre_name}" if songs else f"Không tìm thấy bài hát nào thuộc thể loại {genre_name}"
#                     }
#                 else:
#                     result = {"count": len(songs)}
#         elif entity_type == "album":
#             if action == "detail":
#                 albums = await get_albums(artist_name=artist_name, album_name=album_name)
#                 if albums:
#                     album = max(albums, key=lambda x: x["popularity"]) if artist_name else albums[0]
#                     songs = await get_songs(album_id=album["id"])
#                     result = {"album": album, "songs": songs}
#                 else:
#                     result = {"error": f"Không tìm thấy album {album_name or ''} của {artist_name or ''}"}
#             else:
#                 albums = await get_albums(artist_name=artist_name, album_name=album_name)
#                 result = {"albums": albums}
#         elif entity_type == "playlist":
#             if action == "count":
#                 playlists = await get_playlists(date=date)
#                 result = {"count": len(playlists)}
#             elif action == "list":
#                 playlists = await get_playlists(date=date)
#                 result = {"playlists": playlists}
#         elif entity_type == "history":
#             if action == "list":
#                 history = await get_history(username=username, date_range=date, artist_name=artist_name)
#                 result = {"history": history}
#         elif entity_type == "genre":
#             if action == "count":
#                 count = await get_genre_count(genre_name)
#                 result = {
#                     "count": count,
#                     "message": f"Tìm thấy {count} bài hát thuộc thể loại {genre_name}" if count > 0 else f"Không tìm thấy bài hát nào thuộc thể loại {genre_name}"
#                 }
#         elif entity_type == "user":
#             if action == "top" and date:
#                 user = await get_top_user_by_listen_count(date)
#                 result = {"user": user} if user else {"error": "Không tìm thấy người dùng nào"}
#         elif entity_type == "analyze":
#             if username and date:
#                 song = await get_top_song_by_play_duration(username, date)
#                 result = {"song": song} if song else {"error": "Không tìm thấy bài hát nào"}
#             elif username:
#                 singer = await get_top_artist_by_listen_count(username)
#                 result = {"singer": singer} if singer else {"error": "Không tìm thấy ca sĩ nào"}
#             elif genre_name:
#                 songs = await get_songs(genre_name=genre_name)
#                 if sort == "popularity":
#                     songs = sorted(songs, key=lambda x: x["popularity"], reverse=True)[:2]
#                 result = {"songs": songs}

#         await sync_to_async(cache.set)(cache_key, result, timeout=300)
#         return result
#     except Exception as e:
#         logger.error(f"Database query error: {str(e)} with traceback: {traceback.format_exc()}")
#         return {"error": f"Lỗi truy vấn database: {str(e)}"}

# @app.post("/mcp/query")
# async def mcp_query(data: Dict[str, Any]):
#     user_id = data.get("user_id", "default")
#     user_query = data.get("query", "").lower()
#     session = aiohttp.ClientSession()

#     try:
#         # Phân tích yêu cầu
#         analysis_result = await analysis_chain.ainvoke({"question": user_query})
#         logger.debug(f"Analysis result: {analysis_result}")
#         entity_type = analysis_result.get("entity_type", "")
#         action = analysis_result.get("action", "")
#         params = analysis_result.get("params", {})
#         sort = analysis_result.get("sort", None)
#         logger.debug(f"Analyzed - entity_type: {entity_type}, action: {action}, params: {params}, sort: {sort}")

#         # Truy vấn database
#         db_data = await query_database(entity_type, action, params, sort)
#         logger.debug(f"Database result: {db_data}")

#         # Tạo phản hồi
#         result = await response_chain.ainvoke({
#             "db_data": str(db_data),
#             "question": user_query
#         })

#         return {"response": result}
#     except Exception as e:
#         logger.error(f"Error in mcp_query: {str(e)} with traceback: {traceback.format_exc()}")
#         return {"error": f"Lỗi xử lý: {str(e)}"}
#     finally:
#         await session.close()

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8001)
import os
import sys
import django
import asyncio
import logging
import json
from fastapi import FastAPI
from typing import Dict, Any, List
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import aiohttp
import traceback
from asgiref.sync import sync_to_async
from django.core.cache import cache
import hashlib
from django.db.models import Sum, Q
from datetime import datetime

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Đặt đường dẫn gốc của project
BASE_DIR = "/var/www/demo1/backend"
os.chdir(BASE_DIR)
logger.debug(f"Current working directory changed to: {os.getcwd()}")

# Cấu hình Django
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()

# Import models từ Django
from singer.models import Singer, SingerSong
from song.models import Song
from album.models import Album, AlbumSong
from genre.models import Genre
from playlist.models import Playlist
from history.models import History
from django.contrib.auth.models import User
from spotify_user.models import SpotifyUser, UserFollowing, UserSinger

app = FastAPI()

# Cấu hình phân tích câu hỏi với LangChain
analysis_template = """
Bạn là một chatbot hỗ trợ bằng tiếng Việt cho trang web phát nhạc trực tuyến Spotify Clone. Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và trả về **chỉ một JSON hợp lệ** với các trường: intent, entity_type, action, params, sort (nếu có). **Tuyệt đối không thêm bất kỳ văn bản nào ngoài JSON, kể cả lời giải thích hay tiêu đề.**

### Hướng dẫn:
1. **Phân tích ý định (intent)**:
   - "info": Hỏi thông tin chi tiết (ví dụ: thông tin ca sĩ, bài hát, album).
   - "search": Tìm kiếm danh sách (ví dụ: danh sách bài hát, playlist).
   - "count": Đếm số lượng (ví dụ: số bài hát, số playlist).
   - "analyze": Phân tích dữ liệu (ví dụ: gợi ý bài hát khi vui).
   - "check": Kiểm tra trạng thái hoặc thông tin (ví dụ: bài hát thuộc album nào).

2. **Xác định thực thể (entity_type)**:
   - "singer": Ca sĩ.
   - "song": Bài hát.
   - "album": Album.
   - "genre": Thể loại.
   - "playlist": Playlist.
   - "history": Lịch sử nghe.
   - "user": Người dùng.

3. **Xác định hành động (action)**:
   - "list": Lấy danh sách.
   - "detail": Lấy thông tin chi tiết.
   - "count": Đếm số lượng.
   - "top": Tìm giá trị cao nhất (ví dụ: bài hát phổ biến nhất).
   - "follow_list": Lấy danh sách theo dõi (người dùng hoặc nghệ sĩ).

4. **Xác định tham số (params)**:
   - Các tham số phổ biến: artist_name, song_name, album_name, playlist_name, username, genre_name, date, year.
   - Nếu không có tham số cụ thể, để params rỗng: {{}}.
   - Nếu có "của tôi" trong câu hỏi, thêm username từ ngữ cảnh (nếu có).
   - Nếu có khoảng thời gian (ví dụ: "từ ngày ... đến ngày ..."), thêm date dưới dạng "start_date to end_date".
   - Nếu có ngày cụ thể (ví dụ: "ngày 05/05/2025"), thêm date dưới dạng "YYYY-MM-DD".

5. **Xác định sắp xếp (sort)** (nếu có):
   - "popularity": Sắp xếp theo độ phổ biến.
   - "listen_count": Sắp xếp theo số lần phát.
   - "play_duration": Sắp xếp theo thời gian phát.

### Ví dụ:
- Yêu cầu: "Các bài hát của Ed Sheeran có trong hệ thống"
  Kết quả: {{"intent": "search", "entity_type": "song", "action": "list", "params": {{"artist_name": "Ed Sheeran"}}}}
- Yêu cầu: "Vậy có tổng cộng bao nhiêu bài trong hệ thống"
  Kết quả: {{"intent": "count", "entity_type": "song", "action": "count", "params": {{}}}}
- Yêu cầu: "Tôi đang vui thì nghe nhạc gì"
  Kết quả: {{"intent": "analyze", "entity_type": "song", "action": "top", "params": {{"genre_name": "Pop"}}, "sort": "popularity"}}
- Yêu cầu: "Hãy cho tôi danh sách 3 bài hát phổ biến nhất thuộc thể loại Ballad được phát nhiều nhất bởi người dùng 'user1' trong tháng 4 năm 2025"
  Kết quả: {{"intent": "analyze", "entity_type": "song", "action": "top", "params": {{"username": "user1", "genre_name": "Ballad", "date": "2025-04-01 to 2025-04-30"}}, "sort": "listen_count"}}
- Yêu cầu: "Có bao nhiêu bài hát được phát hành trong năm 2024"
  Kết quả: {{"intent": "count", "entity_type": "song", "action": "count", "params": {{"year": "2024"}}}}
- Yêu cầu: "Người dùng nào nghe nhạc nhiều nhất trong khoảng thời gian từ 01/04/2025 đến 30/04/2025"
  Kết quả: {{"intent": "analyze", "entity_type": "user", "action": "top", "params": {{"date": "2025-04-01 to 2025-04-30"}}, "sort": "listen_count"}}
- Yêu cầu: "user 5 đã theo dõi những ai"
  Kết quả: {{"intent": "info", "entity_type": "user", "action": "follow_list", "params": {{"username": "user5", "follow_type": "users"}}}}
- Yêu cầu: "user 5 đã theo dõi những nghệ sĩ nào"
  Kết quả: {{"intent": "info", "entity_type": "user", "action": "follow_list", "params": {{"username": "user5", "follow_type": "artists"}}}}
- Yêu cầu: "bài hát mất kết nối của MCK thuộc album nào"
  Kết quả: {{"intent": "info", "entity_type": "song", "action": "detail", "params": {{"song_name": "mất kết nối", "artist_name": "MCK"}}}}
- Yêu cầu: "Thông tin chi tiết về bài hát Shape of You"
  Kết quả: {{"intent": "info", "entity_type": "song", "action": "detail", "params": {{"song_name": "Shape of You"}}}}
- Yêu cầu: "Danh sách bài hát trong album Divide của Ed Sheeran"
  Kết quả: {{"intent": "search", "entity_type": "song", "action": "list", "params": {{"album_name": "Divide", "artist_name": "Ed Sheeran"}}}}
- Yêu cầu: "Ca sĩ nào được user1 nghe nhiều nhất"
  Kết quả: {{"intent": "analyze", "entity_type": "singer", "action": "top", "params": {{"username": "user1"}}}}
- Yêu cầu: "Bài hát nào phổ biến nhất trong hệ thống"
  Kết quả: {{"intent": "analyze", "entity_type": "song", "action": "top", "params": {{}}, "sort": "popularity"}}
- Yêu cầu: "Có bao nhiêu playlist được tạo trong ngày 05/05/2025"
  Kết quả: {{"intent": "count", "entity_type": "playlist", "action": "count", "params": {{"date": "2025-05-05"}}}}
- Yêu cầu: "thông tin chi tiết 19 bài hát trong db"
  Kết quả: {{"intent": "info", "entity_type": "song", "action": "list", "params": {{}}, "limit": 19}}
- Yêu cầu: "Lịch sử nghe nhạc của user2"
  Kết quả: {{"intent": "info", "entity_type": "history", "action": "list", "params": {{"username": "user2"}}}}

Yêu cầu: {question}

Kết quả: {format_instructions}
"""
analysis_model = OllamaLLM(model="llama3:latest")
analysis_parser = JsonOutputParser()
analysis_prompt = PromptTemplate(
    template=analysis_template,
    input_variables=["question"],
    partial_variables={"format_instructions": analysis_parser.get_format_instructions()}
)
analysis_chain = analysis_prompt | analysis_model | analysis_parser

# Cấu hình trả lời với LangChain
response_template = """
Bạn là một chatbot hỗ trợ bằng tiếng Việt cho trang web phát nhạc trực tuyến Spotify Clone.
Dựa trên dữ liệu từ database (db_data), hãy trả lời câu hỏi một cách tự nhiên, thông minh và chỉ sử dụng các trường dữ liệu có trong db_data (như id, name, release_date, popularity, v.v.).
Không tự bổ sung thông tin không có trong db_data.

### Hướng dẫn:
- Nếu db_data chứa dữ liệu hợp lệ:
  - Nếu entity_type là "song" và action là "list", liệt kê các bài hát với thông tin: tên bài hát, ca sĩ (từ trường 'singers'), thể loại (id_genre__name), ngày phát hành (release_date), độ phổ biến (popularity nếu có).
  - Nếu câu hỏi liên quan đến số lượng (count), hãy nêu rõ số lượng và thêm thông tin bổ sung nếu có (ví dụ: danh sách bài hát).
  - Nếu entity_type là "history", liệt kê lịch sử nghe với thông tin: bài hát (id_song__name), ca sĩ (id_singer__name), ngày nghe (listen_date).
  - Nếu entity_type khác, trình bày thông tin phù hợp với dữ liệu.
- Nếu db_data chứa lỗi hoặc không có dữ liệu, hãy trả lời dựa trên entity_type:
  - Nếu entity_type là "song": "Mình không tìm thấy bài hát phù hợp. Bạn có muốn nghe thể loại Pop hoặc thử một ca sĩ nổi tiếng như Taylor Swift không?"
  - Nếu entity_type là "user" và action là "follow_list": "Mình không tìm thấy người dùng nào mà {username} theo dõi."
  - Nếu entity_type là "user" và action là "top": "Mình không tìm thấy thông tin người dùng phù hợp."
  - Nếu entity_type là "singer": "Mình không tìm thấy thông tin ca sĩ phù hợp."
  - Nếu entity_type là "album": "Mình không tìm thấy thông tin album phù hợp."
  - Nếu entity_type là "playlist": "Mình không tìm thấy thông tin playlist phù hợp."
  - Nếu entity_type là "history": "Mình không tìm thấy lịch sử nghe nhạc phù hợp."
  - Nếu entity_type là "genre": "Mình không tìm thấy thông tin thể loại phù hợp."
  - Mặc định: "Mình không tìm thấy thông tin phù hợp. Bạn thử kiểm tra lại hoặc hỏi khác nhé!"

### Thông tin bổ sung:
- entity_type: {entity_type}
- action: {action}
- params: {params}

Dữ liệu từ database: {db_data}
Câu hỏi: {question}

Câu trả lời:
"""
response_model = OllamaLLM(model="llama3:latest")
response_prompt = ChatPromptTemplate.from_template(response_template)
response_chain = response_prompt | response_model

def sanitize_cache_key(key):
    """Sanitize cache key to make it Memcached-compatible."""
    return hashlib.md5(key.encode()).hexdigest()

@sync_to_async
def get_singers(artist_name=None):
    """Truy vấn danh sách ca sĩ từ database."""
    query = Singer.objects.all()
    if artist_name:
        query = query.filter(name__icontains=artist_name)
    return list(query.values("id", "name", "followers", "birthday", "description", "image"))

@sync_to_async
def get_songs(song_name=None, artist_name=None, genre_name=None, album_id=None, year=None, limit=None):
    """Truy vấn danh sách bài hát từ database - BỔ SUNG LẤY THÔNG TIN CA SĨ."""
    query = Song.objects.select_related('id_genre').prefetch_related('song_singer__id_singer')
    if song_name:
        query = query.filter(name__icontains=song_name)
    if artist_name:
        query = query.filter(song_singer__id_singer__name__icontains=artist_name).distinct()
    if genre_name:
        if not Genre.objects.filter(name__iexact=genre_name).exists():
            logger.debug(f"Genre {genre_name} not found in database")
            return []
        query = query.filter(id_genre__name__iexact=genre_name)
    if album_id:
        query = query.filter(song_albums__id_album_id=album_id).distinct()
    if year:
        try:
            year_int = int(year)
            current_year = datetime.now().year
            if year_int < 1900 or year_int > current_year + 1:
                logger.warning(f"Invalid year: {year}")
                return []
            query = query.filter(release_date__year=year_int)
        except ValueError:
            logger.error(f"Invalid year format: {year}")
            return []
    if limit:
        query = query[:limit]
    
    # Lấy danh sách bài hát
    songs = list(query.values(
        "id", "name", "release_date", "popularity", "id_genre__name",
        "url_song", "url_video", "url_lyric", "is_vip"
    ))
    
    # Lấy thông tin ca sĩ cho từng bài hát
    for song in songs:
        song_id = song["id"]
        singers = SingerSong.objects.filter(id_song_id=song_id).select_related('id_singer').values('id_singer__name')
        song["singers"] = [singer["id_singer__name"] for singer in singers] if singers else ["Không rõ"]
    
    logger.debug(f"Songs retrieved: {len(songs)} for artist={artist_name}, genre={genre_name}, year={year}, limit={limit}")
    return songs

@sync_to_async
def get_albums(artist_name=None, album_name=None):
    """Truy vấn danh sách album từ database."""
    query = Album.objects.select_related('id_singer').all()
    if artist_name:
        query = query.filter(id_singer__name__icontains=artist_name)
    if album_name:
        query = query.filter(name__iexact=album_name)
    return list(query.values("id", "name", "release_date", "popularity", "id_singer__name", "image"))

@sync_to_async
def get_playlists(date=None, date_range=None):
    """Truy vấn danh sách playlist từ database."""
    query = Playlist.objects.all()
    if date:
        try:
            datetime.strptime(date, '%Y-%m-%d')
            query = query.filter(create_date=date)
        except ValueError:
            logger.error(f"Invalid date format for get_playlists: {date}")
            return []
    elif date_range:
        try:
            start_date, end_date = date_range.split(' to ')
            datetime.strptime(start_date, '%Y-%m-%d')
            datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(create_date__range=[start_date, end_date])
        except ValueError:
            logger.error(f"Invalid date range format for get_playlists: {date_range}")
            return []
    return list(query.values("id", "name", "create_date", "id_user__username"))

@sync_to_async
def get_history(username=None, date_range=None, artist_name=None):
    """Truy vấn lịch sử nghe từ database."""
    query = History.objects.select_related('id_song', 'id_user', 'id_singer').all()
    if username:
        query = query.filter(id_user__username=username)
    if date_range:
        start_date, end_date = date_range.split(' to ')
        query = query.filter(listen_date__range=[start_date, end_date])
    if artist_name:
        query = query.filter(id_singer__name__icontains=artist_name).distinct()
    return list(query.values(
        "id", "id_song__name", "id_singer__name", "listen_date",
        "play_duration", "listen_count", "id_genre__name"
    ))

@sync_to_async
def get_top_artist_by_listen_count(username):
    """Truy vấn ca sĩ có bài hát được nghe nhiều nhất bởi user."""
    history = History.objects.filter(id_user__username=username)\
        .values('id_singer__name')\
        .annotate(total_listens=Sum('listen_count'))\
        .order_by('-total_listens')\
        .first()
    if history and history['id_singer__name']:
        return {"id": None, "name": history['id_singer__name'], "total_listens": history['total_listens']}
    return None

@sync_to_async
def get_genre_count(genre_name):
    """Đếm số bài hát thuộc một thể loại cụ thể."""
    if not genre_name:
        logger.warning("No genre_name provided for get_genre_count")
        return 0
    if not Genre.objects.filter(name__iexact=genre_name).exists():
        logger.debug(f"Genre {genre_name} not found in database")
        return 0
    count = Song.objects.filter(id_genre__name__iexact=genre_name).count()
    logger.debug(f"Genre count for {genre_name}: {count}")
    return count

@sync_to_async
def get_top_song_by_play_duration(username, date_range):
    """Truy vấn bài hát được nghe lâu nhất bởi user trong khoảng thời gian."""
    query = History.objects.select_related('id_song').filter(id_user__username=username)
    if date_range:
        start_date, end_date = date_range.split(' to ')
        query = query.filter(listen_date__range=[start_date, end_date])
    history = query.values('id_song__name', 'id_singer__name')\
        .annotate(total_duration=Sum('play_duration'))\
        .order_by('-total_duration')\
        .first()
    if history:
        return {
            "song_name": history['id_song__name'],
            "singer_name": history['id_singer__name'],
            "total_duration": history['total_duration']
        }
    return None

@sync_to_async
def get_top_songs_by_listen_count():
    """Truy vấn danh sách bài hát được nghe nhiều nhất trong hệ thống."""
    history = History.objects.values('id_song__name', 'id_singer__name')\
        .annotate(total_listens=Sum('listen_count'))\
        .order_by('-total_listens')[:10]
    return list(history)

@sync_to_async
def get_top_user_by_listen_count(date_range):
    """Truy vấn người dùng nghe nhạc nhiều nhất trong khoảng thời gian."""
    query = History.objects.all()
    if date_range:
        start_date, end_date = date_range.split(' to ')
        query = query.filter(listen_date__range=[start_date, end_date])
    user = query.values('id_user__username')\
        .annotate(total_listens=Sum('listen_count'))\
        .order_by('-total_listens')\
        .first()
    if user:
        return {"username": user['id_user__username'], "total_listens": user['total_listens']}
    return None

@sync_to_async
def get_followed_users(username):
    """Truy vấn danh sách người dùng mà user đã theo dõi."""
    try:
        followed_users = UserFollowing.objects.filter(follower__username=username)\
            .select_related('following')\
            .values('following__username')
        return [{"username": user['following__username']} for user in followed_users]
    except Exception as e:
        logger.error(f"Error in get_followed_users: {str(e)}")
        return []

@sync_to_async
def get_followed_artists(username):
    """Truy vấn danh sách nghệ sĩ mà user đã theo dõi."""
    try:
        user = SpotifyUser.objects.filter(username=username).first()
        if not user:
            logger.error(f"User {username} not found")
            return []
        user_id = user.user.id
        followed_artists = UserSinger.objects.filter(id_user=user_id)\
            .select_related('id_singer')\
            .values('id_singer__name')
        return [{"name": artist['id_singer__name']} for artist in followed_artists]
    except Exception as e:
        logger.error(f"Error in get_followed_artists: {str(e)}")
        return []

async def query_database(entity_type: str, action: str, params: Dict, sort: str = None) -> Dict:
    """Truy vấn database dựa trên entity_type, action, params và sort."""
    cache_key = sanitize_cache_key(f"db_query_{entity_type}_{action}_{json.dumps(params)}_{sort}")
    cached_result = await sync_to_async(cache.get)(cache_key)
    if cached_result:
        logger.debug(f"Cache hit for {cache_key}")
        return cached_result

    result = {}
    try:
        artist_name = params.get("artist_name")
        song_name = params.get("song_name")
        album_name = params.get("album_name")
        username = params.get("username")
        if not username and "usernames" in params and params["usernames"]:
            username = params["usernames"][0]
        genre_name = params.get("genre_name")
        date = params.get("date")
        year = params.get("year")
        follow_type = params.get("follow_type")
        limit = params.get("limit")

        if entity_type == "singer":
            if action == "list" or action == "detail":
                result = await get_singers(artist_name=artist_name)
            elif action == "top":
                singer = await get_top_artist_by_listen_count(username)
                result = {"singer": singer} if singer else {"error": "Không tìm thấy ca sĩ nào"}
        elif entity_type == "song":
            if action == "list":
                album_id = None
                if album_name:
                    albums = await get_albums(album_name=album_name, artist_name=artist_name)
                    album_id = albums[0]["id"] if albums else None
                songs = await get_songs(song_name=song_name, artist_name=artist_name, genre_name=genre_name, album_id=album_id, year=year, limit=limit)
                if not songs:
                    result = {"error": f"Không tìm thấy bài hát nào cho {song_name or ''}, {artist_name or ''}, {genre_name or ''}, {year or ''}"}
                else:
                    result = {"songs": songs}
            elif action == "detail":
                songs = await get_songs(song_name=song_name, artist_name=artist_name)
                if songs:
                    song = songs[0]
                    result = {"song": song}
                else:
                    if song_name:
                        albums = await get_albums(artist_name=artist_name)
                        for album in albums:
                            album_songs = await get_songs(album_id=album["id"])
                            if any(s["name"].lower() == song_name.lower() for s in album_songs):
                                result = {"album": album, "song": next(s for s in album_songs if s["name"].lower() == song_name.lower())}
                                break
                        if not result:
                            result = {"error": f"Không tìm thấy album cho bài hát {song_name}"}
                    else:
                        result = {"error": "Vui lòng cung cấp tên bài hát để kiểm tra"}
            elif action == "top":
                if username and genre_name and date:
                    history = await get_history(username=username, date_range=date, artist_name=artist_name)
                    songs = [h for h in history if genre_name.lower() in (h["id_genre__name"] or "").lower()]
                    if sort == "listen_count":
                        songs = sorted(songs, key=lambda x: x["listen_count"] or 0, reverse=True)[:3]
                    elif sort == "popularity":
                        songs = sorted(songs, key=lambda x: x.get("id_song__popularity", 0) or 0, reverse=True)[:3]
                    for song in songs:
                        song["singer_name"] = song["id_singer__name"]
                    result = {"songs": songs}
                elif genre_name:
                    songs = await get_songs(genre_name=genre_name)
                    if sort == "popularity":
                        songs = sorted(songs, key=lambda x: x["popularity"] or 0, reverse=True)[:2]
                    result = {"songs": songs}
                elif sort == "popularity":
                    songs = await get_songs()
                    songs = sorted(songs, key=lambda x: x["popularity"] or 0, reverse=True)[:1]
                    result = {"songs": songs}
                else:
                    songs = await get_top_songs_by_listen_count()
                    result = {"songs": songs}
            elif action == "count":
                songs = await get_songs(year=year, genre_name=genre_name)
                if year:
                    result = {
                        "count": len(songs),
                        "songs": songs if songs else [],
                        "message": f"Tìm thấy {len(songs)} bài hát phát hành năm {year}" if songs else f"Không tìm thấy bài hát nào phát hành năm {year}"
                    }
                elif genre_name:
                    result = {
                        "count": len(songs),
                        "songs": songs if songs else [],
                        "message": f"Tìm thấy {len(songs)} bài hát thuộc thể loại {genre_name}" if songs else f"Không tìm thấy bài hát nào thuộc thể loại {genre_name}"
                    }
                else:
                    result = {"count": len(songs)}
        elif entity_type == "album":
            if action == "detail":
                albums = await get_albums(artist_name=artist_name, album_name=album_name)
                if albums:
                    album = max(albums, key=lambda x: x["popularity"]) if artist_name else albums[0]
                    songs = await get_songs(album_id=album["id"])
                    result = {"album": album, "songs": songs}
                else:
                    result = {"error": f"Không tìm thấy album {album_name or ''} của {artist_name or ''}"}
            else:
                albums = await get_albums(artist_name=artist_name, album_name=album_name)
                result = {"albums": albums}
        elif entity_type == "playlist":
            if action == "count":
                date_range = params.get("date") if " to " in params.get("date", "") else None
                single_date = params.get("date") if not date_range else None
                playlists = await get_playlists(date=single_date, date_range=date_range)
                result = {"count": len(playlists)}
            elif action == "list":
                date_range = params.get("date") if " to " in params.get("date", "") else None
                single_date = params.get("date") if not date_range else None
                playlists = await get_playlists(date=single_date, date_range=date_range)
                result = {"playlists": playlists}
        elif entity_type == "history":
            if action == "list":
                history = await get_history(username=username, date_range=date, artist_name=artist_name)
                result = {"history": history}
        elif entity_type == "genre":
            if action == "count":
                count = await get_genre_count(genre_name)
                result = {
                    "count": count,
                    "message": f"Tìm thấy {count} bài hát thuộc thể loại {genre_name}" if count > 0 else f"Không tìm thấy bài hát nào thuộc thể loại {genre_name}"
                }
        elif entity_type == "user":
            if action == "top" and date:
                user = await get_top_user_by_listen_count(date)
                result = {"user": user} if user else {"error": "Không tìm thấy người dùng nào"}
            elif action == "follow_list":
                if follow_type == "users":
                    followed_users = await get_followed_users(username)
                    result = {"followed_users": followed_users} if followed_users else {"error": f"Không tìm thấy người dùng nào mà {username} theo dõi"}
                elif follow_type == "artists":
                    followed_artists = await get_followed_artists(username)
                    result = {"followed_artists": followed_artists} if followed_artists else {"error": f"Không tìm thấy nghệ sĩ nào mà {username} theo dõi"}
                else:
                    result = {"error": "Loại theo dõi không hợp lệ"}
        elif entity_type == "analyze":
            if username and date:
                song = await get_top_song_by_play_duration(username, date)
                result = {"song": song} if song else {"error": "Không tìm thấy bài hát nào"}
            elif username:
                singer = await get_top_artist_by_listen_count(username)
                result = {"singer": singer} if singer else {"error": "Không tìm thấy ca sĩ nào"}
            elif genre_name:
                songs = await get_songs(genre_name=genre_name)
                if sort == "popularity":
                    songs = sorted(songs, key=lambda x: x["popularity"], reverse=True)[:2]
                result = {"songs": songs}

        await sync_to_async(cache.set)(cache_key, result, timeout=300)
        return result
    except Exception as e:
        logger.error(f"Database query error: {str(e)} with traceback: {traceback.format_exc()}")
        return {"error": f"Lỗi truy vấn database: {str(e)}"}

@app.post("/mcp/query")
async def mcp_query(data: Dict[str, Any]):
    user_id = data.get("user_id", "default")
    user_query = data.get("query", "").lower()
    session = aiohttp.ClientSession()

    try:
        # Phân tích yêu cầu
        try:
            analysis_result = await analysis_chain.ainvoke({"question": user_query})
            logger.debug(f"Analysis result: {analysis_result}")
            entity_type = analysis_result.get("entity_type", "")
            action = analysis_result.get("action", "")
            params = analysis_result.get("params", {})
            sort = analysis_result.get("sort", None)
            logger.debug(f"Analyzed - entity_type: {entity_type}, action: {action}, params: {params}, sort: {sort}")
        except Exception as e:
            logger.error(f"Error in analysis: {str(e)} with traceback: {traceback.format_exc()}")
            return {"response": "Mình không thể hiểu câu hỏi của bạn do lỗi phân tích. Bạn thử hỏi lại theo cách khác nhé!"}

        # Truy vấn database
        db_data = await query_database(entity_type, action, params, sort)
        logger.debug(f"Database result: {db_data}")

        # Tạo phản hồi
        username = params.get("username", "không xác định")
        result = await response_chain.ainvoke({
            "db_data": str(db_data),
            "question": user_query,
            "entity_type": entity_type,
            "action": action,
            "params": params,
            "username": username
        })

        return {"response": result}
    except Exception as e:
        logger.error(f"Error in mcp_query: {str(e)} with traceback: {traceback.format_exc()}")
        return {"error": f"Lỗi xử lý: {str(e)}"}
    finally:
        await session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)