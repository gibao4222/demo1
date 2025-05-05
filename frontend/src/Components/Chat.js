import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import imageCompression from 'browser-image-compression';

const Chat = ({ userId, targetId, token, targetUsername }) => {
    const [messages, setMessages] = useState([]);
    const [pendingMessages, setPendingMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]); // Gộp pendingMessages và messages
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasPendingMessage, setHasPendingMessage] = useState(false); // Trạng thái đã gửi tin nhắn pending
    const [pendingRequestFromTarget, setPendingRequestFromTarget] = useState(null); // Yêu cầu pending từ target
    const [errorMessage, setErrorMessage] = useState('');
    const chatBoxRef = useRef(null);
    const isUserScrolling = useRef(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Hàm gộp và sắp xếp tin nhắn
    const combineAndSortMessages = (msgs, pendingMsgs) => {
        const combined = [...msgs, ...pendingMsgs].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
        return combined;
    };

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
                if (data.message.is_pending) {
                    setPendingMessages((prev) => [...prev, data.message]);
                    // Nếu người gửi là userId, đánh dấu đã gửi tin nhắn pending
                    if (String(data.message.sender_id) === String(userId)) {
                        setHasPendingMessage(true);
                    }
                    // Nếu người gửi là targetId, lưu thông tin yêu cầu pending
                    if (String(data.message.sender_id) === String(targetId)) {
                        setPendingRequestFromTarget(data.message);
                    }
                } else {
                    setMessages((prev) => [...prev, data.message]);
                    if (!isUserScrolling.current && chatBoxRef.current) {
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
            } else if (data.type === 'messages_updated') {
                console.log('Messages updated:', data.message_ids);
                fetchMessages(); // Làm mới tin nhắn khi có cập nhật
                // Reset trạng thái pending khi yêu cầu được chấp nhận
                if (data.is_accepted) {
                    setHasPendingMessage(false);
                    setPendingRequestFromTarget(null);
                }
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
            const userSentPending = newMessages.some(
                msg => msg.is_pending && String(msg.sender_id) === String(userId)
            );
            if (userSentPending) {
                setHasPendingMessage(true);
            }
            const targetSentPending = newMessages.find(
                msg => msg.is_pending && String(msg.sender_id) === String(targetId)
            );
            if (targetSentPending) {
                try {
                    const usersResponse = await axios.get('/api/users/users');
                    const targetSpotifyUser = usersResponse.data.find(u => u.user.id === parseInt(targetId));
                    if (targetSpotifyUser) {
                        setPendingRequestFromTarget({ ...targetSentPending, spotifyUserId: targetSpotifyUser.id });
                    } else {
                        console.warn('Không tìm thấy SpotifyUser cho targetId:', targetId);
                        setPendingRequestFromTarget(targetSentPending);
                    }
                } catch (permErr) {
                    console.error('Lỗi khi lấy SpotifyUser:', permErr);
                    setPendingRequestFromTarget(targetSentPending);
                }
            } else {
                setPendingRequestFromTarget(null);
            }
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

    // Cập nhật allMessages khi messages hoặc pendingMessages thay đổi
    useEffect(() => {
        setAllMessages(combineAndSortMessages(messages, pendingMessages));
    }, [messages, pendingMessages]);

    // Cuộn xuống cuối khi allMessages thay đổi
    useEffect(() => {
        if (allMessages.length > 0 && chatBoxRef.current && !isUserScrolling.current) {
            chatBoxRef.current.scrollTo({
                top: chatBoxRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [allMessages]);

    // Theo dõi hành vi cuộn của người dùng
    useEffect(() => {
        const chatBox = chatBoxRef.current;
        if (!chatBox) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = chatBox;
            isUserScrolling.current = scrollTop + clientHeight < scrollHeight - 10;
        };

        chatBox.addEventListener('scroll', handleScroll);
        return () => chatBox.removeEventListener('scroll', handleScroll);
    }, []);

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

    const handleRequestAction = async (action) => {
        if (!pendingRequestFromTarget) {
            setErrorMessage('Không tìm thấy yêu cầu trò chuyện để xử lý');
            return;
        }
        const requesterId = pendingRequestFromTarget.spotifyUserId || pendingRequestFromTarget.sender_id;
        if (!requesterId) {
            setErrorMessage('Không thể xác định ID của người gửi yêu cầu');
            return;
        }
        console.log('Gửi yêu cầu xử lý ChatPermission:', { requester_id: requesterId, action });
        try {
            setErrorMessage('');
            const response = await axios.put('/api/chat/permission/', {
                requester_id: requesterId, // Đây là ID của SpotifyUser
                action,
            });
            console.log('Phản hồi từ server:', response.data);
            fetchMessages();
            setPendingRequestFromTarget(null);
        } catch (err) {
            console.error(`Lỗi khi ${action} yêu cầu trò chuyện:`, err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setErrorMessage(`Không thể ${action === 'accept' ? 'chấp nhận' : 'từ chối'} yêu cầu: ${err.response?.data?.lỗi || 'Lỗi không xác định'}`);
            }
        }
    };

    return (
        <div className="chat-container flex flex-col w-full h-full bg-neutral-800 text-white rounded-t-lg">
            <div className="chat-header p-1 bg-blue-700 rounded-t-lg border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">{targetUsername}</h2>
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
                {allMessages.length === 0 ? (
                    <p className="text-gray-400 text-sm">Chưa có tin nhắn nào.</p>
                ) : (
                    allMessages.map((msg) => (
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
                                } max-w-[75%] break-words text-sm relative`}
                            >
                                {msg.is_pending && (
                                    <span className="absolute -top-5 text-yellow-400 text-xs">
                                        Đang chờ xác nhận
                                    </span>
                                )}
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
                {hasPendingMessage ? (
                    <div className="text-gray-400 text-sm text-center">
                        <p>Đã gửi yêu cầu trò chuyện</p>
                        <p>Bạn có thể bắt đầu cuộc trò chuyện khi người dùng này chấp nhận yêu cầu trò chuyện của bạn</p>
                    </div>
                ) : pendingRequestFromTarget ? (
                    <div className="text-gray-400 text-sm text-center">
                        <p>{targetUsername} đã gửi cho bạn một tin nhắn đang chờ</p>
                        <p>Mọi người có thể gửi cho bạn tối đa 1 tin nhắn cho đến khi bạn chấp nhận.</p>
                        <div className="flex justify-center gap-3 mt-2">
                            <button
                                onClick={() => handleRequestAction('accept')}
                                className="bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600"
                            >
                                Chấp nhận
                            </button>
                            <button
                                onClick={() => handleRequestAction('reject')}
                                className="bg-red-500 text-white px-4 py-1 rounded text-sm hover:bg-red-600"
                            >
                                Từ chối
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;