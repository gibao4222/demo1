# backend/chat/views_chatbot.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import zmq
import json

@csrf_exempt
def chatbot(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('query', '')
            user_id = data.get('user_id', None)

            if not query:
                return JsonResponse({'error': 'Câu hỏi không được để trống'}, status=400)

            # Gửi câu hỏi qua ZMQ tới chat_server
            context = zmq.Context()
            socket = context.socket(zmq.REQ)
            socket.connect("tcp://localhost:5557")  # Cổng mới cho chatbot
            socket.send_json({'action': 'chat_query', 'user_id': user_id, 'query': query})  # Thêm action

            # Nhận phản hồi
            response = socket.recv_json()
            socket.close()

            return JsonResponse(response)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)