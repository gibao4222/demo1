import zmq
import requests
import json
import logging
import time

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Định nghĩa endpoint của Ollama API
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Thiết lập ZeroMQ
context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:5558")

while True:
    try:
        message = socket.recv_json()
        logger.debug(f"Received message from Chat Server: {message}")

        user_id = message['context']['user_id']
        user_query = message['context']['user_query']
        db_data = message['context']['db_data']
        conversation_context = message['context']['conversation_context']

        # Tạo prompt cho Ollama
        prompt = (
            f"Bạn là một chatbot hỗ trợ người dùng trên một trang web nghe nhạc trực tuyến. "
            f"Người dùng (ID: {user_id}) đã hỏi: '{user_query}'.\n"
            f"Ngữ cảnh cuộc trò chuyện: {conversation_context}\n"
            f"Hãy trả lời một cách tự nhiên, thân thiện và 'giang hồ' bằng tiếng Việt. "
            f"Trả về câu trả lời dưới dạng JSON với key 'answer' chứa câu trả lời dạng văn bản."
        )

        if 'website_name' in db_data:
            prompt += (
                f"Tên trang web: {db_data['website_name']}\n"
                f"Hãy trả lời câu hỏi về tên trang web một cách tự nhiên và hóm hỉnh."
            )
        elif 'general_query' in db_data:
            prompt += (
                f"Đây là một câu hỏi thông tin cơ bản. Hãy trả lời một cách tự nhiên và hấp dẫn. "
                f"Nếu không hiểu câu hỏi, gợi ý người dùng thử lại."
            )
        elif 'error' in db_data:
            prompt += (
                f"Lỗi: {db_data['error']}\n"
                f"Hãy trả lời rằng bạn không thể xử lý câu hỏi do lỗi dữ liệu và gợi ý người dùng thử lại."
            )
        elif 'song_count' in db_data:
            prompt += (
                f"Ca sĩ: {db_data['artist_name']}\n"
                f"Số bài hát: {db_data['song_count']}\n"
                f"Hãy trả lời câu hỏi một cách tự nhiên và hổ báo."
            )
        elif 'songs' in db_data:
            # Kiểm tra xem câu hỏi có hỏi về số lượng bài hát không
            if "bao nhiêu bài hát" in user_query.lower() or "số lượng bài hát" in user_query.lower():
                song_count = len(db_data['songs'])
                prompt += (
                    f"Số lượng bài hát: {song_count}\n"
                    f"Danh sách bài hát:\n"
                )
                for song in db_data['songs']:
                    genre = song.get('genre', 'Không xác định')
                    release_date = song.get('release_date', 'Không có thông tin')
                    prompt += f"  + {song['name']} (Thể loại: {genre}, Ngày phát hành: {release_date})\n"
                prompt += f"Hãy trả lời câu hỏi về số lượng bài hát và liệt kê danh sách bài hát một cách tự nhiên."
            else:
                entity_name = db_data.get('artist_name') or db_data.get('album_name') or db_data.get('genre_name') or db_data.get('playlist_name')
                entity_type = "ca sĩ" if db_data.get('artist_name') else "album" if db_data.get('album_name') else "thể loại" if db_data.get('genre_name') else "playlist"
                songs = db_data['songs']
                prompt += (
                    f"{entity_type.capitalize()}: {entity_name}\n"
                    f"Danh sách bài hát:\n"
                )
                for song in songs:
                    genre = song.get('genre', 'Không xác định')
                    release_date = song.get('release_date', 'Không có thông tin')
                    prompt += f"  + {song['name']} (Thể loại: {genre}, Ngày phát hành: {release_date})\n"
                prompt += f"Hãy liệt kê danh sách bài hát một cách tự nhiên."
        elif 'name' in db_data and 'genre' in db_data:
            prompt += (
                f"Tên bài hát: {db_data['name']}\n"
                f"Thể loại: {db_data['genre']}\n"
                f"Ca sĩ: {', '.join(db_data['singers'])}\n"
                f"Ngày phát hành: {db_data['release_date']}\n"
                f"Hãy giới thiệu bài hát này một cách hài hước và hấp dẫn."
            )
        elif 'description' in db_data and 'followers' in db_data:
            prompt += (
                f"Tên ca sĩ: {db_data['name']}\n"
                f"Mô tả: {db_data['description']}\n"
                f"Số người theo dõi: {db_data['followers']}\n"
                f"Ngày sinh: {db_data['birthday']}\n"
                f"Hãy trả lời câu hỏi một cách tự nhiên."
            )
        elif 'release_date' in db_data and 'artist' in db_data:
            prompt += (
                f"Tên album: {db_data['name']}\n"
                f"Ngày phát hành: {db_data['release_date']}\n"
                f"Ca sĩ: {db_data['artist']}\n"
                f"Độ phổ biến: {db_data['popularity']}\n"
                f"Hãy trả lời câu hỏi một cách tự nhiên."
            )
        elif 'song_examples' in db_data:
            prompt += (
                f"Tên thể loại: {db_data['name']}\n"
                f"Ví dụ bài hát: {', '.join(db_data['song_examples'])}\n"
                f"Hãy trả lời câu hỏi một cách tự nhiên."
            )
        elif 'create_date' in db_data:
            prompt += (
                f"Tên playlist: {db_data['name']}\n"
                f"Mô tả: {db_data['description']}\n"
                f"Ngày tạo: {db_data['create_date']}\n"
                f"Hãy trả lời câu hỏi một cách tự nhiên."
            )
        elif 'albums' in db_data:
            prompt += (
                f"Ca sĩ: {db_data['artist_name']}\n"
                f"Danh sách album:\n" + "\n".join(f"  + {album['name']} (Ngày phát hành: {album['release_date']})" for album in db_data['albums']) + "\n"
                f"Hãy liệt kê danh sách album một cách tự nhiên."
            )
        elif 'song_name' in db_data and 'singers' in db_data:
            prompt += (
                f"Tên bài hát: {db_data['song_name']}\n"
                f"Ca sĩ: {', '.join(db_data['singers'])}\n"
                f"Hãy trả lời câu hỏi một cách tự nhiên."
            )
        elif 'total_songs' in db_data:
            prompt += (
                f"Tổng số bài hát: {db_data.get('total_songs', 0)}\n"
                f"Tổng số nghệ sĩ: {db_data.get('total_singers', 0)}\n"
                f"Tổng số album: {db_data.get('total_albums', 0)}\n"
                f"Tổng số thể loại: {db_data.get('total_genres', 0)}\n"
                f"Hãy liệt kê tất cả thông tin thống kê một cách tự nhiên."
            )
        else:
            prompt += (
                f"Dữ liệu: {db_data}\n"
                f"Nếu không hiểu câu hỏi, hãy trả lời rằng bạn không hiểu và gợi ý người dùng thử lại."
            )

        # Gửi yêu cầu đến Ollama API với cơ chế thử lại
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
                response = requests.post(OLLAMA_API_URL, headers=headers, json=api_payload, timeout=120)
                if response.status_code == 200:
                    response_data = response.json()
                    content = response_data.get('response', '')
                    try:
                        result = json.loads(content)
                        # Chuẩn hóa phản hồi để luôn có khóa 'answer'
                        answer = result.get('answer', result.get('chúc mừng', 'Không có câu trả lời từ Ollama'))
                        if isinstance(answer, list):
                            answer = "Danh sách bài hát: " + ", ".join(answer)
                        answer = {'answer': answer}
                    except json.JSONDecodeError:
                        answer = {'answer': content or 'Không thể trích xuất câu trả lời từ Ollama'}
                    break
                elif response.status_code == 500 and "llm server loading model" in response.text:
                    logger.warning(f"Ollama model is still loading, retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries})")
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        continue
                    answer = {'answer': 'Lỗi: Mô hình AI đang tải, vui lòng thử lại sau vài giây.'}
                else:
                    answer = {'answer': f'Lỗi từ Ollama: {response.text}'}
                    break
            except requests.exceptions.RequestException as e:
                logger.error(f"Error connecting to Ollama: {str(e)}")
                if attempt < max_retries - 1:
                    logger.warning(f"Retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    continue
                answer = {'answer': f'Không thể kết nối tới Ollama: {str(e)}'}

        logger.debug(f"Sending answer to Chat Server: {answer}")
        socket.send_json(answer)
    except Exception as e:
        logger.error(f"Error in ollama_chat_client: {str(e)}")
        socket.send_json({'answer': f'Lỗi hệ thống: {str(e)}'})