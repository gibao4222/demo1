// Chat.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import imageCompression from 'browser-image-compression';

const Chat = ({ userId, targetId, token }) => {
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
        <div className="chat-container p-4 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Chat với người dùng {targetId}</h2>
            <div className="pending-messages mb-4">
                <h3 className="text-lg font-semibold">Tin nhắn chờ xác nhận</h3>
                {pendingMessages.length === 0 ? (
                    <p className="text-gray-500">Không có tin nhắn chờ xác nhận.</p>
                ) : (
                    pendingMessages.map((msg) => (
                        <div key={msg.id} className={`message p-2 mb-2 rounded-lg ${String(msg.sender_id) === String(userId) ? 'bg-blue-100 ml-auto' : 'bg-gray-200 mr-auto'} max-w-xs`}>
                            {msg.is_recalled ? (
                                <span className="text-gray-500 italic">Tin nhắn đã bị thu hồi</span>
                            ) : msg.is_deleted ? (
                                <span className="text-gray-500 italic">Tin nhắn đã bị xóa</span>
                            ) : (
                                <>
                                    <strong>{msg.sender || 'Người dùng không xác định'}:</strong>
                                    {msg.content && <p>{msg.content}</p>}
                                    {msg.image && <img src={msg.image} alt="Message Image" className="max-w-full mt-2 rounded" />}
                                    {String(msg.sender_id) === String(userId) && (
                                        <div className="mt-1">
                                            <button onClick={() => deleteMessage(msg.id)} className="text-red-500 text-sm mr-2">Xóa</button>
                                            <button onClick={() => recallMessage(msg.id)} className="text-blue-500 text-sm">Thu hồi</button>
                                        </div>
                                    )}
                                    {String(msg.sender_id) !== String(userId) && msg.is_seen && (
                                        <span className="text-green-500 text-xs block mt-1">Đã xem</span>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className="chat-box mb-4 max-h-96 overflow-y-auto" ref={chatBoxRef}>
                <h3 className="text-lg font-semibold">Hộp thoại</h3>
                {nextPage && (
                    <button
                        onClick={loadMoreMessages}
                        disabled={loading}
                        className="bg-blue-500 text-white p-2 rounded mb-2"
                    >
                        {loading ? 'Đang tải...' : 'Tải thêm tin nhắn'}
                    </button>
                )}
                {messages.length === 0 ? (
                    <p className="text-gray-500">Chưa có tin nhắn nào.</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`message p-2 mb-2 rounded-lg ${String(msg.sender_id) === String(userId) ? 'bg-blue-100 ml-auto' : 'bg-gray-200 mr-auto'} max-w-xs`}>
                            {msg.is_recalled ? (
                                <span className="text-gray-500 italic">Tin nhắn đã bị thu hồi</span>
                            ) : msg.is_deleted ? (
                                <span className="text-gray-500 italic">Tin nhắn đã bị xóa</span>
                            ) : (
                                <>
                                    <strong>{msg.sender || 'Người dùng không xác định'}:</strong>
                                    {msg.content && <p>{msg.content}</p>}
                                    {msg.image && <img src={msg.image} alt="Message Image" className="max-w-full mt-2 rounded" />}
                                    {String(msg.sender_id) === String(userId) && (
                                        <div className="mt-1">
                                            <button onClick={() => deleteMessage(msg.id)} className="text-red-500 text-sm mr-2">Xóa</button>
                                            <button onClick={() => recallMessage(msg.id)} className="text-blue-500 text-sm">Thu hồi</button>
                                        </div>
                                    )}
                                    {String(msg.sender_id) !== String(userId) && msg.is_seen && (
                                        <span className="text-green-500 text-xs block mt-1">Đã xem</span>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className="input-box flex items-center">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tin nhắn..."
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="ml-2"
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded ml-2">Gửi</button>
                <button onClick={requestChat} className="bg-green-500 text-white p-2 rounded ml-2">Gửi yêu cầu trò chuyện</button>
            </div>
        </div>
    );
};

export default Chat;