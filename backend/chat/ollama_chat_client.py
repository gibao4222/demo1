
# backend/chat/ollama_chat_client.py
import zmq
import requests
import json
import os

# Định nghĩa endpoint của Ollama API (đã cấu hình để lắng nghe trên 0.0.0.0:11434)
OLLAMA_API_URL = "http://localhost:11434/api/generate"

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

    # Tạo prompt cho Ollama (tương tự như với Gemini)
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
            f"Hãy trả lời câu hỏi một cách tự nhiên, thân thiện và giang hồ bằng tiếng Việt, liệt kê danh sách bài hát. "
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
    elif 'total_songs' in db_data:  # Thống kê trang web
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

    # Gửi yêu cầu đến Ollama API
    api_payload = {
        "model": "vina:latest",  # Sử dụng mô hình bạn đã tải (hoặc đổi thành mô hình khác như llama3.2)
        "prompt": prompt,
        "stream": False,
        "format": "json"  # Yêu cầu Ollama trả về kết quả dưới dạng JSON
    }

    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(
            OLLAMA_API_URL,
            headers=headers,
            json=api_payload,
            timeout=30
        )
        print(f"Response status code: {response.status_code}")

        if response.status_code == 200:
            response_data = response.json()
            # Ollama trả về JSON với key 'response' chứa nội dung
            content = response_data.get('response', '')
            # Kiểm tra nếu content đã là JSON, nếu không thì thử parse
            try:
                answer = json.loads(content)
            except json.JSONDecodeError:
                # Nếu không parse được JSON, trả về dưới dạng answer mặc định
                answer = {'answer': content if content else 'Không thể trích xuất câu trả lời từ Ollama'}
        else:
            answer = {'answer': f'Lỗi từ Ollama: {response.text}'}
    except requests.exceptions.RequestException as e:
        answer = {'answer': f'Không thể kết nối tới Ollama: {str(e)}'}

    print(f"Sending answer to Chat Server: {answer}")
    socket.send_json(answer)

