import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def chatbot(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        query = data.get('prompt', data.get('query'))  # Hỗ trợ cả prompt (từ Open WebUI) và query (từ React)

        # Logic xử lý query với mcp_chat_server và ollama_chat_client
        # Giả sử bạn đã có hàm xử lý trả về answer
        answer = "Trang web có 7 bài hát..."  # Thay bằng logic thực tế

        # Định dạng lại phản hồi để tương thích với Open WebUI
        return JsonResponse({"response": answer})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)