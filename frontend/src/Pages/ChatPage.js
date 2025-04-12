import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../Components/Chat';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';

const ChatPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [targetId, setTargetId] = useState(null);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Kiểm tra nếu chưa đăng nhập, chuyển hướng về trang login
    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate]);

    // Lấy danh sách người dùng để chọn targetId
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const response = await axios.get('/api/users/users');
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setError('Dữ liệu người dùng không hợp lệ');
                    setUsers([]);
                }
            } catch (err) {
                setError('Không thể lấy danh sách người dùng');
                setUsers([]);
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                }
            }finally {
                setLoading(false);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await axios.get('/api/chat/permission/');
                setRequests(response.data);
            } catch (err) {
                console.error('Lỗi khi lấy yêu cầu trò chuyện:', err);
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                }
            }
        };

        if (token) {
            fetchUsers();
            fetchRequests();
        }
    }, [token, logout, navigate]);

    const handleRequest = async (requestId, action) => {
        try {
            await axios.put('/api/chat/permission/', {
                requester_id: requestId,
                action,
            });
            setRequests(requests.filter(req => req.id !== requestId));
        } catch (err) {
            console.error(`Lỗi khi ${action} yêu cầu trò chuyện:`, err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    if (!token || !user) {
        return null; // Hoặc hiển thị loading
    }

    
    const mystyle = {
        color: "black",
        backgroundColor: "white",
        fontFamily: "Arial"
    };

    return (
        <div className="chat-page p-6" style={mystyle}>
            <h1 className="text-2xl font-bold mb-6">Ứng dụng Chat</h1>
            <div className="message-requests mb-6">
                <h2 className="text-xl font-semibold mb-2">Yêu cầu tin nhắn</h2>
                {requests.length === 0 ? (
                    <p className="text-gray-500">Không có yêu cầu nào.</p>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="request flex items-center justify-between p-2 border-b">
                            <span>{req.requester} muốn trò chuyện với bạn</span>
                            <div>
                                <button
                                    onClick={() => handleRequest(req.requester_id, 'accept')}
                                    className="bg-green-500 text-white p-1 rounded mr-2"
                                >
                                    Chấp nhận
                                </button>
                                <button
                                    onClick={() => handleRequest(req.requester_id, 'reject')}
                                    className="bg-red-500 text-white p-1 rounded"
                                >
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="user-selection mb-6">
                <h2 className="text-xl font-semibold mb-2">Chọn người dùng để chat:</h2>
                {loading ? (
                    <p>Đang tải...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <select onChange={(e) => setTargetId(e.target.value)} value={targetId || ''} className="border p-2 rounded">
                        <option value="">Chọn người dùng</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.user.id}>
                                {u.username}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {targetId &&  (
                <Chat
                    userId={user.user_id}
                    targetId={targetId}
                    token={token}
                />
            
            
            )}
        </div>
    );
};

export default ChatPage;