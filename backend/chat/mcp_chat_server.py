import os
import sys
import django
import asyncio
import logging
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

def sanitize_cache_key(key):
    """Sanitize cache key to make it Memcached-compatible."""
    return hashlib.md5(key.encode()).hexdigest()

@sync_to_async
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