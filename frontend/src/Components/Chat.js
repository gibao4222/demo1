import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Chat = ({ userId, targetId, token }) => {
    const [messages, setMessages] = useState([]);
    const [pendingMessages, setPendingMessages] = useState([]);
    const [input, setInput] = useState('');
    const socket = io('http://localhost:8000');
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const roomName = `${Math.min(userId, targetId)}_${Math.max(userId, targetId)}`;
        socket.on('connect', () => {
            socket.emit('join', roomName);
        });

        socket.on('chat_message', (data) => {
            if (data.message.is_pending) {
                setPendingMessages((prev) => [...prev, data.message]);
            } else {
                setMessages((prev) => [...prev, data.message]);
            }
        });

        socket.on('delete_message', (data) => {
            if (data.user_id === userId) {
                setMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_deleted: true } : msg));
                setPendingMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_deleted: true } : msg));
            }
        });

        socket.on('recall_message', (data) => {
            setMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_recalled: true } : msg));
            setPendingMessages((prev) => prev.map(msg => msg.id === data.message_id ? { ...msg, is_recalled: true } : msg));
        });

        fetchMessages();

        return () => socket.disconnect();
    }, [userId, targetId]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/chat/messages/?target_id=${targetId}`);
            const allMessages = response.data.messages || [];
            setMessages(allMessages.filter(msg => !msg.is_pending));
            setPendingMessages(allMessages.filter(msg => msg.is_pending));
        } catch (err) {
            console.error('Lỗi khi lấy tin nhắn:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const sendMessage = async () => {
        try {
            const response = await axios.post('http://localhost:8000/chat/message/', {
                receiver_id: targetId,
                content: input,
            });
            if (response.data.is_pending) {
                alert('Tin nhắn đã được gửi nhưng đang chờ xác nhận.');
            }
            setInput('');
        } catch (err) {
            console.error('Lỗi khi gửi tin nhắn:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const requestChat = async () => {
        try {
            await axios.post('http://localhost:8000/chat/permission/', {
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
            await axios.delete(`http://localhost:8000/chat/message/?message_id=${messageId}`);
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
            await axios.put('http://localhost:8000/chat/message/', {
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
        <div>
            <h2>Chat với người dùng {targetId}</h2>
            <div>
                <h3>Tin nhắn chờ xác nhận</h3>
                {pendingMessages.map((msg) => (
                    <div key={msg.id}>
                        {msg.is_recalled ? (
                            <span>Tin nhắn đã bị thu hồi</span>
                        ) : msg.is_deleted ? (
                            <span>Tin nhắn đã bị xóa</span>
                        ) : (
                            <>
                                {msg.sender}: {msg.content}
                                {msg.sender === userId && (
                                    <>
                                        <button onClick={() => deleteMessage(msg.id)}>Xóa</button>
                                        <button onClick={() => recallMessage(msg.id)}>Thu hồi</button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div>
                <h3>Hộp thoại</h3>
                {messages.map((msg) => (
                    <div key={msg.id}>
                        {msg.is_recalled ? (
                            <span>Tin nhắn đã bị thu hồi</span>
                        ) : msg.is_deleted ? (
                            <span>Tin nhắn đã bị xóa</span>
                        ) : (
                            <>
                                {msg.sender}: {msg.content}
                                {msg.sender === userId && (
                                    <>
                                        <button onClick={() => deleteMessage(msg.id)}>Xóa</button>
                                        <button onClick={() => recallMessage(msg.id)}>Thu hồi</button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={sendMessage}>Gửi</button>
            <button onClick={requestChat}>Gửi yêu cầu trò chuyện</button>
        </div>
    );
};

export default Chat;