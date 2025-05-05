import zmq
import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class ChatbotView(APIView):
    def post(self, request):
        try:
            # Lấy dữ liệu từ request
            data = request.data
            user_id = data.get('user_id')
            query = data.get('prompt') or data.get('query')

            # Kiểm tra dữ liệu đầu vào
            if not user_id or not query:
                logger.error("Missing user_id or query in request")
                return Response(
                    {"error": "user_id và query là bắt buộc"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Thiết lập ZeroMQ
            context = zmq.Context()
            socket = context.socket(zmq.REQ)
            socket.setsockopt(zmq.RCVTIMEO, 60000)
            socket.connect("tcp://localhost:5557")

            # Gửi yêu cầu đến mcp_chat_server
            message = {
                "action": "chat_query",
                "user_id": user_id,
                "query": query
            }
            logger.debug(f"Sending message to mcp_chat_server: {message}")
            socket.send_json(message)

            # Nhận phản hồi
            try:
                response = socket.recv_json()
                logger.debug(f"Received response from mcp_chat_server: {response}")
                if 'error' in response:
                    return Response(
                        {"error": response['error']},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                # Định dạng phản hồi cho Open WebUI và frontend
                # Xử lý các trường hợp phản hồi không có khóa 'answer'
                answer = response.get('answer', response.get('chúc mừng', 'Không có câu trả lời'))
                if isinstance(answer, list):
                    answer = "Danh sách bài hát: " + ", ".join(answer)
                return Response(
                    {"response": answer},
                    status=status.HTTP_200_OK
                )
            except zmq.error.Again:
                logger.error("Timeout waiting for response from mcp_chat_server")
                return Response(
                    {"error": "Timeout khi chờ phản hồi từ server"},
                    status=status.HTTP_504_GATEWAY_TIMEOUT
                )
            except Exception as e:
                logger.error(f"Error receiving response from mcp_chat_server: {str(e)}")
                return Response(
                    {"error": f"Lỗi giao tiếp với server: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            finally:
                socket.close()
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return Response(
                {"error": "Dữ liệu JSON không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in ChatbotView: {str(e)}")
            return Response(
                {"error": f"Lỗi hệ thống: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )