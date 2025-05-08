import streamlit as st
import requests

st.title("Chatbot Interface")

# Lưu trữ lịch sử trò chuyện
if "messages" not in st.session_state:
    st.session_state.messages = []

# Hiển thị lịch sử trò chuyện
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])

# Nhập tin nhắn từ người dùng
if prompt := st.chat_input("Nhập câu hỏi của bạn..."):
    # Thêm tin nhắn người dùng vào lịch sử
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)

    # Gọi API của bạn
    response = requests.post(
        "http://localhost:8002/api/chat/chatbot",
        json={"message": prompt, "user_id": "user1", "session_id": "session1"}
    ).json()

    # Thêm phản hồi của chatbot vào lịch sử
    with st.chat_message("assistant"):
        st.write(response.get("response", "Không có phản hồi"))

    st.session_state.messages.append({"role": "assistant", "content": response.get("response", "Lỗi")})

# # Chạy ứng dụng
# if __name__ == "__main__":
#     st.run()