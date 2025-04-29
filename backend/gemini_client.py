# gemini_client.py
import zmq
import requests
import json
from dotenv import load_dotenv
import os
import re

# Load biến môi trường từ file .env
load_dotenv("/var/www/demo1/backend/.env")

# Lấy GEMINI_API_KEY từ biến môi trường
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
print(f"GEMINI_API_KEY: {GEMINI_API_KEY}")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY không được tìm thấy trong file .env")

context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:5556")

while True:
    # Nhận dữ liệu từ mcp_server
    message = socket.recv_json()
    print(f"Received message from MCP Server: {message}")

    # Chuẩn bị dữ liệu cho prompt
    user_id = message['context']['user_id']
    listening_summary = message['context']['listening_summary']
    available_songs = message['context']['available_song_names']
    listened_songs = list(listening_summary['song_stats'].keys())

    # Tạo prompt chi tiết
    prompt = (
        f"Tôi đang xây dựng một hệ thống gợi ý nhạc. Người dùng (ID: {user_id}) có lịch sử nghe như sau:\n"
        f"- Thông tin bài hát đã nghe (số lần nghe, thời gian nghe, thể loại, ca sĩ):\n"
    )
    for song_name, stats in listening_summary['song_stats'].items():
        prompt += (
            f"  - Bài hát: '{song_name}', Số lần nghe: {stats['listen_count']}, "
            f"Thời gian nghe: {stats['play_duration']} giây, "
            f"Thể loại: {stats['genre'] or 'Không xác định'}, "
            f"Ca sĩ: {stats['singer'] or 'Không xác định'}\n"
        )
    prompt += (
        f"- Thể loại yêu thích: {listening_summary['favorite_genre'] or 'Không xác định'}\n"
        f"- Ca sĩ yêu thích: {listening_summary['favorite_singer'] or 'Không xác định'}\n"
        f"- Danh sách bài hát có sẵn để gợi ý: {available_songs}\n\n"
        f"**Yêu cầu gợi ý:**\n"
        f"1. Gợi ý 3 bài hát từ danh sách có sẵn ({available_songs}) mà người dùng có thể thích.\n"
        f"2. Ưu tiên các bài hát có cùng thể loại ({listening_summary['favorite_genre']}) hoặc cùng ca sĩ ({listening_summary['favorite_singer']}).\n"
        f"3. Ưu tiên dựa trên số lần nghe và thời gian nghe: nếu người dùng nghe một bài nhiều lần hoặc lâu, hãy gợi ý bài hát tương tự.\n"
        f"4. KHÔNG gợi ý các bài hát mà người dùng đã nghe: {listened_songs}.\n"
        f"5. Trả về kết quả dưới dạng JSON với key 'recommended_song_names', ví dụ:\n"
        f'```json\n{{"recommended_song_names": ["Song A", "Song B", "Song C"]}}\n```'
    )

    # Định dạng dữ liệu cho API của Gemini
    api_payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    # Gửi yêu cầu đến API của Gemini
    headers = {
        'Content-Type': 'application/json',
    }
    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}',
            headers=headers,
            json=api_payload,
            timeout=30
        )
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text}")

        if response.status_code == 200:
            # Xử lý phản hồi từ API
            response_data = response.json()
            content = response_data['candidates'][0]['content']['parts'][0]['text']

            # Trích xuất JSON từ phản hồi
            json_match = re.search(r'```json\n([\s\S]*?)\n```', content)
            if json_match:
                json_str = json_match.group(1)
                recommendations = json.loads(json_str)
            else:
                recommendations = {'error': 'Không thể tìm thấy JSON trong phản hồi của Gemini', 'content': content}

            # Lọc lại gợi ý
            recommended_songs = recommendations.get('recommended_song_names', [])
            filtered_recommendations = [
                song for song in recommended_songs
                if song in available_songs and song not in listened_songs
            ]

            recommendations = {
                'recommended_song_names': filtered_recommendations[:3]
            }
        else:
            recommendations = {
                'error': f'Không thể lấy gợi ý từ Gemini: {response.status_code} - {response.text}'
            }
    except requests.exceptions.RequestException as e:
        print(f"Lỗi yêu cầu: {str(e)}")
        recommendations = {'error': f'Không thể lấy gợi ý từ Gemini: {str(e)}'}

    # Gửi kết quả về cho mcp_server
    print(f"Sending recommendations to MCP Server: {recommendations}")
    socket.send_json(recommendations)