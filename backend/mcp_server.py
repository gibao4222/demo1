# mcp_server.py
import os
import sys
import django
import zmq
import json

# Debug đường dẫn
print("Thư mục hiện tại:", os.getcwd())
print("Tệp settings.py có tồn tại không?", os.path.exists('/var/www/demo1/backend/myproject/settings.py'))

# Thêm đường dẫn dự án vào sys.path
sys.path.append('/var/www/demo1/backend')

# Thiết lập DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Khởi tạo Django
try:
    django.setup()
    print("Khởi tạo Django thành công")
except Exception as e:
    print(f"Lỗi khi khởi tạo Django: {e}")
    sys.exit(1)

# Import model
try:
    from history.utils import summarize_listening_history
    from song.models import Song
    print("Import model thành công")
except Exception as e:
    print(f"Lỗi khi import model: {e}")
    sys.exit(1)

context = zmq.Context()
socket = context.socket(zmq.REP)

# Bind socket
try:
    socket.bind("tcp://*:5555")
    print("Bind socket thành công trên cổng 5555")
except zmq.error.ZMQError as e:
    print(f"Lỗi khi bind socket: {e}")
    sys.exit(1)

while True:
    try:
        message = socket.recv_json()
        user_id = message.get('user_id')
        action = message.get('action')
        print(f"Received message: user_id={user_id}, action={action}")

        if action == 'get_recommendations':
            # Lấy lịch sử nghe
            summary = summarize_listening_history(user_id, days=7)

            # Kiểm tra nếu không có lịch sử nghe
            if not summary['song_stats']:  # Sửa từ 'song_names_with_frequency' thành 'song_stats'
                socket.send_json({'error': 'No listening history found for this user'})
                continue

            # Lấy danh sách tất cả tên bài hát
            all_songs = Song.objects.all().values_list('name', flat=True)
            available_song_names = list(all_songs)

            # Chuẩn bị dữ liệu theo định dạng MCP
            mcp_data = {
                'context': {
                    'user_id': user_id,
                    'listening_summary': {
                        'song_stats': summary['song_stats'],  # Đã sửa từ 'song_names_with_frequency' thành 'song_stats'
                        'favorite_genre': summary['favorite_genre'],
                        'favorite_singer': summary['favorite_singer'],
                    },
                    'available_song_names': available_song_names,
                },
                'request': 'music_recommendation_by_name',
            }

            # Gửi dữ liệu cho Gemini qua gemini_client
            gemini_socket = context.socket(zmq.REQ)
            gemini_socket.setsockopt(zmq.RCVTIMEO, 15000)  # Timeout 15 giây
            gemini_socket.connect("tcp://localhost:5556")
            gemini_socket.send_json(mcp_data)

            try:
                recommendations = gemini_socket.recv_json()
            except zmq.error.Again:
                print("Timeout chờ phản hồi từ gemini_client")
                socket.send_json({'error': 'Timeout chờ phản hồi từ gemini_client'})
                continue
            finally:
                gemini_socket.close()

            # Gửi phản hồi về cho Django
            socket.send_json(recommendations)
        else:
            socket.send_json({'error': 'Hành động không hợp lệ'})
    except Exception as e:
        print(f"Lỗi trong vòng lặp chính: {e}")
        socket.send_json({'error': str(e)})