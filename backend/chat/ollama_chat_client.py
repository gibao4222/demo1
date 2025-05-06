import zmq
import aiohttp
import json
import logging
import time
import asyncio
import socket
import traceback

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Định nghĩa endpoint của Ollama API
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Thiết lập ZeroMQ
context = zmq.Context()
zmq_socket = context.socket(zmq.REP)
zmq_socket.setsockopt(zmq.LINGER, 0)  # Ngăn socket treo

def is_port_in_use(port):
    """Kiểm tra xem cổng có đang được sử dụng không"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("localhost", port))
            return False
        except socket.error:
            return True

def bind_socket_with_retry(zmq_socket, address, max_retries=5, retry_delay=3):
    """Bind socket với cơ chế retry"""
    for attempt in range(max_retries):
        try:
            if is_port_in_use(5558):
                logger.error(f"Cổng 5558 đang được sử dụng bởi một tiến trình khác (lần {attempt + 1}/{max_retries}).")
                if attempt < max_retries - 1:
                    logger.info(f"Thử lại sau {retry_delay} giây...")
                    time.sleep(retry_delay)
                    continue
                else:
                    raise zmq.error.ZMQError("Không thể bind socket: Cổng 5558 đang bị chiếm dụng.")
            zmq_socket.bind(address)
            logger.debug(f"Bind socket thành công trên {address}")
            return True
        except zmq.error.ZMQError as e:
            logger.error(f"Lỗi khi bind socket (lần {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"Thử lại sau {retry_delay} giây...")
                time.sleep(retry_delay)
            else:
                logger.error("Không thể bind socket sau nhiều lần thử.")
                raise

# Thử bind socket
try:
    bind_socket_with_retry(zmq_socket, "tcp://*:5558")
except zmq.error.ZMQError as e:
    logger.error(f"Thất bại khi bind socket: {e}")
    exit(1)

async def send_ollama_request(session, payload):
    """Gửi yêu cầu async tới Ollama API"""
    headers = {'Content-Type': 'application/json'}
    max_retries = 3
    retry_delay = 10

    for attempt in range(max_retries):
        try:
            logger.debug(f"Attempt {attempt + 1}/{max_retries} to call Ollama API")
            start_time = time.time()
            async with session.post(OLLAMA_API_URL, headers=headers, json=payload, timeout=60) as response:
                logger.debug(f"Ollama API response time: {time.time() - start_time:.2f}s")
                if response.status == 200:
                    response_data = await response.json()
                    content = response_data.get('response', '')
                    try:
                        result = json.loads(content)
                        answer = result.get('answer', 'Không có câu trả lời từ Llama 3')
                        if isinstance(answer, list):
                            answer = "Danh sách bài hát: " + ", ".join(answer)
                        return {'answer': answer}
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse Ollama response: {content}")
                        return {'answer': content or 'Lỗi định dạng từ Llama 3'}
                elif response.status == 500 and "llm server loading model" in await response.text():
                    logger.warning(f"Llama 3 is loading, retrying in {retry_delay}s (attempt {attempt + 1}/{max_retries})")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_delay)
                        continue
                    return {'answer': 'Lỗi: Mô hình AI đang tải, vui lòng thử lại sau.'}
                else:
                    logger.error(f"Ollama API error: Status {response.status}, Response: {await response.text()}")
                    return {'answer': f'Lỗi từ Ollama: {await response.text()}'}
        except aiohttp.ClientError as e:
            logger.error(f"Error connecting to Ollama: {str(e)}")
            if attempt < max_retries - 1:
                logger.warning(f"Retrying in {retry_delay}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
                continue
            return {'answer': f'Không thể kết nối tới Ollama: {str(e)}'}
        except asyncio.TimeoutError:
            logger.error(f"Timeout khi kết nối tới Ollama sau 60s")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
                continue
            return {'answer': 'Lỗi: Hết thời gian kết nối tới Ollama'}
        except Exception as e:
            logger.error(f"Unexpected error in send_ollama_request: {str(e)} with traceback: {traceback.format_exc()}")
            return {'answer': f'Lỗi hệ thống: {str(e)}'}

async def main():
    global zmq_socket  # Khai báo zmq_socket là biến toàn cục
    async with aiohttp.ClientSession() as session:
        while True:
            try:
                message = zmq_socket.recv_json()
                logger.debug(f"Received message from Chat Server: {message}")

                if 'ping' in message:  # Xử lý ping
                    zmq_socket.send_json({'answer': 'pong'})
                    continue

                user_id = message['context'].get('user_id')
                user_query = message['context'].get('user_query', '')
                db_data = message['context'].get('db_data', {})
                conversation_context = message['context'].get('conversation_context', {})

                # Cải thiện prompt để ép buộc sử dụng dữ liệu DB
                if 'info' in user_query and 'ca sĩ' in user_query:
                    prompt = (
                        f"Bạn là một chatbot hỗ trợ người dùng trên trang web nghe nhạc trực tuyến 'Spotify Clone'. "
                        f"Người dùng (ID: {user_id}) đã hỏi: '{user_query}'. "
                        f"CHỈ sử dụng dữ liệu từ database dưới đây để trả lời một cách tự nhiên, thân thiện và ngắn gọn bằng tiếng Việt. "
                        f"KHÔNG tự suy luận hoặc thêm thông tin không có trong dữ liệu. "
                        f"Nếu không có dữ liệu, trả lời: 'Chưa có thông tin, bạn thử lại nhé!'.\n"
                        f"Dữ liệu từ database: {db_data}\n"
                        f"Trả về JSON với key 'answer' chứa câu trả lời dạng văn bản, ví dụ: "
                        f'"{db_data.get("name")} là một ca sĩ với phong cách {db_data.get("description", "không xác định")}. '
                        f'Sinh nhật: {db_data.get("birthday", "không có thông tin")}. Số người theo dõi: {db_data.get("followers", 0)}."'
                    )
                else:
                    prompt = (
                        f"Bạn là một chatbot hỗ trợ người dùng trên trang web nghe nhạc trực tuyến 'Spotify Clone'. "
                        f"Người dùng (ID: {user_id}) đã hỏi: '{user_query}'. "
                        f"CHỈ sử dụng dữ liệu từ database dưới đây để trả lời một cách tự nhiên, thân thiện và 'giang hồ' bằng tiếng Việt. "
                        f"KHÔNG tự suy luận hoặc thêm thông tin không có trong dữ liệu (ví dụ: số lượng, nền tảng như Spotify). "
                        f"Nếu không có dữ liệu, trả lời: 'Chưa có thông tin, bạn thử lại nhé!'.\n"
                        f"Ngữ cảnh cuộc trò chuyện: {conversation_context}\n"
                        f"Dữ liệu từ database: {db_data}\n"
                        f"Trả về JSON với key 'answer' chứa câu trả lời dạng văn bản."
                    )

                # Gửi yêu cầu tới Ollama
                api_payload = {
                    "model": "llama3",
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {
                        "num_ctx": 512,  # Giảm kích thước ngữ cảnh để tăng tốc
                        "temperature": 0.5,
                        "top_p": 0.9
                    }
                }

                answer = await send_ollama_request(session, api_payload)
                logger.debug(f"Sending answer to Chat Server: {answer}")
                zmq_socket.send_json(answer)
            except zmq.error.ZMQError as e:
                logger.error(f"ZeroMQ error in ollama_chat_client: {str(e)} with traceback: {traceback.format_exc()}")
                try:
                    zmq_socket.send_json({'answer': f'Lỗi ZeroMQ: {str(e)}'})
                except zmq.error.ZMQError as send_error:
                    logger.error(f"Failed to send error response: {send_error}")
                # Đóng và tạo lại socket
                zmq_socket.close()
                zmq_socket = context.socket(zmq.REP)
                zmq_socket.setsockopt(zmq.LINGER, 0)
                try:
                    bind_socket_with_retry(zmq_socket, "tcp://*:5558")
                except zmq.error.ZMQError as e_bind:
                    logger.error(f"Bind lại thất bại: {e_bind}")
                    exit(1)
            except Exception as e:
                logger.error(f"Error in ollama_chat_client: {str(e)} with traceback: {traceback.format_exc()}")
                try:
                    zmq_socket.send_json({'answer': f'Lỗi hệ thống: {str(e)}'})
                except zmq.error.ZMQError as send_error:
                    logger.error(f"Failed to send error response: {send_error}")
                # Không đóng socket ở đây để tránh lỗi UnboundLocalError

if __name__ == "__main__":
    asyncio.run(main())