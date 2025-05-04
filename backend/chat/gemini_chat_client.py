# backend/chat/gemini_chat_client.py
import zmq
import requests
import json
from dotenv import load_dotenv
import os
import re

# Load biến môi trường
load_dotenv("/var/www/demo1/backend/.env")
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY không được tìm thấy trong file .env")

context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:5558")

while True:
    message = socket.recv_json()
    print(f"Received message from Chat Server: {message}")

    user_id = message['context']['user_id']
    user_query = message['context']['user_query']
    db_data = message['context']['db_data']
    conversation_context = message['context']['conversation_context']

    # Tạo prompt cho Gemini
    prompt = (
        f"Bạn là một chatbot hỗ trợ người dùng trên một trang web nghe nhạc trực tuyến. "
        f"Người dùng (ID: {user_id}) đã hỏi: '{user_query}'.\n"
        f"Ngữ cảnh cuộc trò chuyện: {conversation_context}\n"
    )

    if 'general_query' in db_data:
        prompt += (
            f"Đây là một câu hỏi thông tin cơ bản. Hãy trả lời một cách tự nhiên, thân thiện và thật giang hồ bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'error' in db_data:
        prompt += (
            f"- Lỗi: {db_data['error']}\n"
            f"Hãy trả lời rằng bạn không thể xử lý câu hỏi do lỗi dữ liệu và gợi ý người dùng thử lại. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer', ví dụ:\n"
            f'```json\n{{"answer": "Xin lỗi, tôi không thể xử lý câu hỏi do lỗi dữ liệu. Hãy thử lại nhé!"}}\n```'
        )
    elif 'song_count' in db_data:
        artist_name = db_data['artist_name']
        song_count = db_data['song_count']
        prompt += (
            f"- Ca sĩ: {artist_name}\n"
            f"- Số bài hát: {song_count}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và thật hổ báo bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'songs' in db_data:
        if 'artist_name' in db_data:
            entity_name = db_data['artist_name']
            entity_type = "ca sĩ"
        elif 'album_name' in db_data:
            entity_name = db_data['album_name']
            entity_type = "album"
        elif 'genre_name' in db_data:
            entity_name = db_data['genre_name']
            entity_type = "thể loại"
        elif 'playlist_name' in db_data:
            entity_name = db_data['playlist_name']
            entity_type = "playlist"
        songs = db_data['songs']
        prompt += (
            f"- {entity_type.capitalize()}: {entity_name}\n"
            f"- Danh sách bài hát:\n"
        )
        for song in songs:
            prompt += f"  + {song['name']} (Thể loại: {song['genre']}, Ngày phát hành: {song['release_date']})\n"
        prompt += (
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và thật giang hồ bằng tiếng Việt, liệt kê danh sách bài hát. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'name' in db_data and 'genre' in db_data:  # Thông tin bài hát
        prompt += (
            f"- Tên bài hát: {db_data['name']}\n"
            f"- Thể loại: {db_data['genre']}\n"
            f"- Ca sĩ: {', '.join(db_data['singers'])}\n"
            f"- Ngày phát hành: {db_data['release_date']}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Nếu người dùng hỏi về giới thiệu bài hát, hãy giới thiệu bài hát này một cách hài hước và hấp dẫn. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'description' in db_data and 'followers' in db_data:  # Thông tin ca sĩ
        prompt += (
            f"- Tên ca sĩ: {db_data['name']}\n"
            f"- Mô tả: {db_data['description']}\n"
            f"- Số người theo dõi: {db_data['followers']}\n"
            f"- Ngày sinh: {db_data['birthday']}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'release_date' in db_data and 'artist' in db_data:  # Thông tin album
        prompt += (
            f"- Tên album: {db_data['name']}\n"
            f"- Ngày phát hành: {db_data['release_date']}\n"
            f"- Ca sĩ: {db_data['artist']}\n"
            f"- Độ phổ biến: {db_data['popularity']}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'song_examples' in db_data:  # Thông tin thể loại
        prompt += (
            f"- Tên thể loại: {db_data['name']}\n"
            f"- Ví dụ bài hát: {', '.join(db_data['song_examples'])}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'create_date' in db_data:  # Thông tin playlist
        prompt += (
            f"- Tên playlist: {db_data['name']}\n"
            f"- Mô tả: {db_data['description']}\n"
            f"- Ngày tạo: {db_data['create_date']}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'albums' in db_data:
        artist_name = db_data['artist_name']
        albums = db_data['albums']
        prompt += (
            f"- Ca sĩ: {artist_name}\n"
            f"- Danh sách album:\n"
        )
        for album in albums:
            prompt += f"  + {album['name']} (Ngày phát hành: {album['release_date']})\n"
        prompt += (
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt, liệt kê danh sách album. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'song_name' in db_data and 'singers' in db_data:  # Tìm ca sĩ của bài hát
        prompt += (
            f"- Tên bài hát: {db_data['song_name']}\n"
            f"- Ca sĩ: {', '.join(db_data['singers'])}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    elif 'total_songs' in db_data:  # Thống kê trang web (cải tiến để bao gồm tất cả trường)
        total_songs = db_data.get('total_songs', 0)
        total_singers = db_data.get('total_singers', 0)
        total_albums = db_data.get('total_albums', 0)
        total_genres = db_data.get('total_genres', 0)
        prompt += (
            f"- Tổng số bài hát: {total_songs}\n"
            f"- Tổng số nghệ sĩ: {total_singers}\n"
            f"- Tổng số album: {total_albums}\n"
            f"- Tổng số thể loại: {total_genres}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt, liệt kê tất cả thông tin thống kê có sẵn. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )
    else:
        prompt += (
            f"- Dữ liệu: {db_data}\n"
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt. "
            f"Nếu không hiểu câu hỏi, hãy trả lời rằng bạn không hiểu và gợi ý người dùng thử lại. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer'."
        )

    # Gửi yêu cầu đến API Gemini
    api_payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}',
            headers=headers,
            json=api_payload,
            timeout=30
        )
        print(f"Response status code: {response.status_code}")

        if response.status_code == 200:
            response_data = response.json()
            content = response_data['candidates'][0]['content']['parts'][0]['text']
            json_match = re.search(r'```json\n([\s\S]*?)\n```', content)
            if json_match:
                json_str = json_match.group(1)
                answer = json.loads(json_str)
            else:
                answer = {'answer': 'Không thể trích xuất câu trả lời từ Gemini'}
        else:
            answer = {'answer': f'Lỗi từ Gemini: {response.text}'}
    except requests.exceptions.RequestException as e:
        answer = {'answer': f'Không thể kết nối tới Gemini: {str(e)}'}

    print(f"Sending answer to Chat Server: {answer}")
    socket.send_json(answer)