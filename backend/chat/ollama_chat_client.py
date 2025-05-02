import os
import sys
import zmq
import requests
import json
import django
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# Đọc biến môi trường từ .env
load_dotenv()

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Thêm đường dẫn dự án
BASE_DIR = '/var/www/demo1/backend'
sys.path.append(BASE_DIR)

# Thiết lập DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Khởi tạo Django
try:
    django.setup()
    logger.debug("Khởi tạo Django thành công")
except Exception as e:
    logger.error(f"Lỗi khi khởi tạo Django: {e}")
    sys.exit(1)

# Import các module sau khi django.setup()
from django.contrib.auth.models import User
from song.models import Song

context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:5558")

# Khởi tạo Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def call_ollama(prompt):
    """Gọi Ollama để xử lý dữ liệu từ cơ sở dữ liệu (đáp ứng yêu cầu dự án)."""
    try:
        logger.debug(f"Sending request to Ollama: {prompt[:100]}...")
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5:0.5b",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40
                }
            },
            timeout=60
        )
        response.raise_for_status()
        full_response = response.json().get("response", "No information found.")
        logger.debug(f"Ollama response: {full_response}")
        return full_response
    except requests.exceptions.RequestException as e:
        logger.error(f"Request to Ollama failed: {str(e)}")
        return f"Error: {str(e)}"

def call_gemini(user_query, ollama_response):
    """Gọi Gemini để tinh chỉnh phản hồi từ Ollama."""
    try:
        logger.debug(f"Sending request to Gemini to refine Ollama response: {ollama_response[:100]}...")
        prompt = (
            f"You are a helpful music assistant for an online music app. The user asked: '{user_query}'\n"
            f"Initial response from another model: {ollama_response}\n\n"
            f"Instructions:\n"
            f"1. Refine the response to be more natural, concise, and accurate.\n"
            f"2. Use the initial response if it contains useful data, otherwise provide a better answer based on general knowledge.\n"
            f"3. Format song lists as bullet points (e.g., - Song Name by Singer (Genre)).\n"
            f"4. Keep the response under 150 words.\n"
            f"5. Return only the response text."
        )
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 150
            }
        )
        full_response = response.text.strip()
        logger.debug(f"Gemini refined response: {full_response}")
        return full_response
    except Exception as e:
        logger.error(f"Request to Gemini failed: {str(e)}")
        return f"Error: {str(e)}"

while True:
    try:
        logger.debug("Waiting for message from mcp_chat_server")
        message = socket.recv_json()
        logger.debug(f"Received message from MCP Server: {message}")

        request_type = message.get("request")
        context_data = message.get("context", {})

        if request_type == "chat_response":
            user_id = context_data.get("user_id")
            user_query = context_data.get("user_query", "")
            db_data = context_data.get("db_data", {})

            # Xử lý nếu db_data chứa lỗi
            if isinstance(db_data, dict) and "error" in db_data:
                logger.error(f"Error in db_data: {db_data['error']}")
                socket.send_json({"response": f"Sorry, I encountered an error: {db_data['error']}"})
                continue

            # Bước 1: Gọi Ollama để xử lý dữ liệu từ cơ sở dữ liệu (đáp ứng yêu cầu)
            prompt = (
                f"The user (ID: {user_id}) asked: '{user_query}'\n"
                f"Database data:\n{json.dumps(db_data, indent=2, ensure_ascii=False)}\n\n"
                f"Instructions:\n"
                f"1. Use the database data to provide information.\n"
                f"2. If no relevant data is available, respond with 'No information found.'\n"
                f"3. For song search: List songs with their names, singers, and genres.\n"
                f"4. Return only the response text."
            )
            ollama_response = call_ollama(prompt)

            # Bước 2: Gọi Gemini để tinh chỉnh phản hồi từ Ollama
            refined_response = call_gemini(user_query, ollama_response)

            # Gửi phản hồi cuối cùng
            socket.send_json({"response": refined_response})

        else:
            logger.error(f"Invalid request type: {request_type}")
            socket.send_json({"error": "Invalid request type"})
    except Exception as e:
        logger.error(f"Error in main loop: {str(e)}")
        socket.send_json({"error": str(e)})