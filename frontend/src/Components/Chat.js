import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import imageCompression from 'browser-image-compression';

const Chat = ({ userId, targetId, token, targetUsername }) => {
    const [messages, setMessages] = useState([]);
    const [pendingMessages, setPendingMessages] = useState([]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);  // State để lưu file ảnh
    const [socket, setSocket] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const chatBoxRef = useRef(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        if (!userId || !targetId) {
            console.error('userId hoặc targetId không hợp lệ:', { userId, targetId });
            return;
        }

        const roomName = `${Math.min(Number(userId), Number(targetId))}_${Math.max(Number(userId), Number(targetId))}`;
        console.log('roomName:', roomName);
        const ws = new WebSocket(`wss://localhost/ws/chat/${roomName}/?token=${token}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat_message') {
                console.log('WebSocket message:', data.message);
                console.log('msg.sender_id:', data.message.sender_id, 'userId:', userId, 'Kiểu dữ liệu:', typeof data.message.sender_id, typeof userId);
                if (data.message.is_pending) {
                    setPendingMessages((prev) => [...prev, data.message]);
                } else {
                    setMessages((prev) => [...prev, data.message]);
                    if (chatBoxRef.current) {
                        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                    }
                }
            } else if (data.type === 'delete_message') {
                if (data.user_id === userId) {
                    setMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_deleted: true } : msg));
                    setPendingMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_deleted: true } : msg));
                }
            } else if (data.type === 'recall_message') {
                setMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_recalled: true } : msg));
                setPendingMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_recalled: true } : msg));
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        setSocket(ws);

        fetchMessages();

        return () => {
            ws.close();
        };
    }, [userId, targetId, token]);

    const fetchMessages = async (url = `/api/chat/messages/?target_id=${targetId}`) => {
        try {
            setLoading(true);
            const response = await axios.get(url);
            console.log('API response:', response.data);
            const newMessages = response.data.results || [];
            newMessages.forEach(msg => {
                console.log('msg.sender_id:', msg.sender_id, 'userId:', userId, 'Kiểu dữ liệu:', typeof msg.sender_id, typeof userId);
            });
            setNextPage(response.data.next);
            setMessages((prev) => {
                const allMessages = [...newMessages, ...prev];
                return allMessages.filter(msg => !msg.is_pending);
            });
            setPendingMessages(newMessages.filter(msg => msg.is_pending));
        } catch (err) {
            console.error('Lỗi khi lấy tin nhắn:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMoreMessages = () => {
        if (nextPage && !loading) {
            fetchMessages(nextPage);
        }
    };

    const sendMessage = useCallback(async () => {
        if (!input.trim() && !image) {
            console.log('Không gửi tin nhắn: không có nội dung hoặc ảnh');
            return;
        }

        if (!targetId || isNaN(parseInt(targetId))) {
            console.error('receiver_id không hợp lệ:', targetId);
            alert('Không thể gửi tin nhắn: ID người nhận không hợp lệ');
            return;
        }

        if (input.trim() && !image) {
            // Gửi tin nhắn văn bản qua WebSocket
            if (!socket) {
                console.error('WebSocket chưa kết nối');
                alert('Không thể gửi tin nhắn: WebSocket chưa kết nối');
                return;
            }
            socket.send(JSON.stringify({
                content: input,
                receiver_id: targetId,
            }));
            setInput('');
        } else if (image) {
            // Gửi tin nhắn với ảnh qua HTTP
            const formData = new FormData();
            formData.append('receiver_id', targetId);
            if (input.trim()) {
                formData.append('content', input);
            }
            formData.append('image', image);

            console.log('FormData gửi đi:', {
                receiver_id: targetId,
                content: input,
                image: image.name,
            });

            try {
                const response = await axios.post('/api/chat/message/', formData);
                console.log('Gửi tin nhắn thành công:', response.data);
                setInput('');
                setImage(null);
            } catch (err) {
                console.error('Lỗi khi gửi tin nhắn:', err);
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                } else {
                    console.error('Chi tiết lỗi:', err.response?.data);
                }
            }
        }
    }, [input, image, targetId, socket, logout, navigate]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {  // 5MB
                alert('File ảnh quá lớn, tối đa 5MB');
                return;
            }

            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };
            try {
                const compressedFile = await imageCompression(file, options);
                console.log('Ảnh đã nén:', compressedFile.name, compressedFile.size);
                setImage(compressedFile);
            } catch (error) {
                console.error('Lỗi khi nén ảnh:', error);
                console.log('Sử dụng file gốc:', file.name, file.size);
                setImage(file);
            }
        }
    };

    const requestChat = async () => {
        try {
            await axios.post('/api/chat/permission/', {
                target_id: targetId,
            });
            alert('Yêu cầu trò chuyện đã được gửi.');
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu trò chuyện:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(`/api/chat/message/?message_id=${messageId}`);
        } catch (err) {
            console.error('Lỗi khi xóa tin nhắn:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const recallMessage = async (messageId) => {
        try {
            await axios.put('/api/chat/message/', {
                message_id: messageId,
            });
        } catch (err) {
            console.error('Lỗi khi thu hồi tin nhắn:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    return (
        <div className="chat-container flex flex-col w-full h-full bg-neutral-800 text-white rounded-t-lg">
            <div className="chat-header p-1 bg-blue-700 rounded-t-lg border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">{targetUsername}</h2>
            </div>

            <div className="pending-messages p-4 border-b border-gray-700">
                <h3 className="text-base font-semibold mb-2">Tin nhắn chờ xác nhận</h3>
                {pendingMessages.length === 0 ? (
                    <p className="text-gray-400 text-sm">Không có tin nhắn chờ xác nhận.</p>
                ) : (
                    pendingMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex mb-3 ${
                                String(msg.sender_id) === String(userId)
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`message p-2 rounded-lg ${
                                    String(msg.sender_id) === String(userId)
                                        ? "bg-blue-600"
                                        : "bg-gray-700"
                                } max-w-[50%] break-words text-sm`}
                            >
                                {msg.is_recalled ? (
                                    <span className="text-gray-400 italic">
                                        Tin nhắn đã bị thu hồi
                                    </span>
                                ) : msg.is_deleted ? (
                                    <span className="text-gray-400 italic">
                                        Tin nhắn đã bị xóa
                                    </span>
                                ) : (
                                    <>
                                        <strong className="block text-xs mb-1">
                                            {msg.sender || "Người dùng không xác định"}:
                                        </strong>
                                        {msg.content && <p className="text-sm">{msg.content}</p>}
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Message Image"
                                                className="max-w-[150px] mt-2 rounded"
                                            />
                                        )}
                                        {String(msg.sender_id) === String(userId) && (
                                            <div className="mt-2 flex gap-3">
                                                <button
                                                    onClick={() => deleteMessage(msg.id)}
                                                    className="text-red-400 text-xs hover:text-red-300"
                                                >
                                                    Xóa
                                                </button>
                                                <button
                                                    onClick={() => recallMessage(msg.id)}
                                                    className="text-blue-400 text-xs hover:text-blue-300"
                                                >
                                                    Thu hồi
                                                </button>
                                            </div>
                                        )}
                                        {String(msg.sender_id) !== String(userId) &&
                                            msg.is_seen && (
                                                <span className="text-green-400 text-xs block mt-1">
                                                    Đã xem
                                                </span>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="chat-box flex-1 p-4 overflow-y-auto" ref={chatBoxRef}>
                {nextPage && (
                    <button
                        onClick={loadMoreMessages}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-1 rounded mb-3 text-sm hover:bg-blue-700 w-full"
                    >
                        {loading ? "Đang tải..." : "Tải thêm tin nhắn"}
                    </button>
                )}
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm">Chưa có tin nhắn nào.</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex mb-3 ${
                                String(msg.sender_id) === String(userId)
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`message p-2 rounded-lg ${
                                    String(msg.sender_id) === String(userId)
                                        ? "bg-blue-600"
                                        : "bg-gray-700"
                                } max-w-[75%] break-words text-sm`}
                            >
                                {msg.is_recalled ? (
                                    <span className="text-gray-400 italic">
                                        Tin nhắn đã bị thu hồi
                                    </span>
                                ) : msg.is_deleted ? (
                                    <span className="text-gray-400 italic">
                                        Tin nhắn đã bị xóa
                                    </span>
                                ) : (
                                    <>
                                        <strong className="block text-xs mb-1">
                                            {msg.sender || "Người dùng không xác định"}:
                                        </strong>
                                        {msg.content && <p className="text-sm">{msg.content}</p>}
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Message Image"
                                                className="max-w-[150px] mt-2 rounded"
                                            />
                                        )}
                                        <span className="text-gray-400 text-xs mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {String(msg.sender_id) === String(userId) && (
                                            <div className="mt-2 flex gap-3">
                                                <button
                                                    onClick={() => deleteMessage(msg.id)}
                                                    className="text-red-400 text-xs hover:text-red-300"
                                                >
                                                    Xóa
                                                </button>
                                                <button
                                                    onClick={() => recallMessage(msg.id)}
                                                    className="text-blue-400 text-xs hover:text-blue-300"
                                                >
                                                    Thu hồi
                                                </button>
                                            </div>
                                        )}
                                        {String(msg.sender_id) !== String(userId) &&
                                            msg.is_seen && (
                                                <span className="text-green-400 text-xs block mt-1">
                                                    Đã xem
                                                </span>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="input-box p-4 border-t border-gray-700 flex flex-col gap-2">
                {image && (
                    <div className="relative bg-gray-700 p-2 rounded">
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Selected Image"
                            className="max-w-[150px] rounded"
                        />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0"
                        placeholder="Nhập tin nhắn..."
                    />
                    <label className="cursor-pointer flex-shrink-0">
                        <img
                            src="/icon/sendImage.png"
                            alt="Send Image"
                            className="w-6 h-6"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={sendMessage}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex-shrink-0"
                    >
                        Gửi
                    </button>
                    <button
                        onClick={requestChat}
                        className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 flex-shrink-0"
                    >
                        Yêu cầu
                    </button>
                </div>
            </div>
        </div>

    );
};

export default Chat;