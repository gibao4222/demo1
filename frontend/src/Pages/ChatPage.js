import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../Components/Chat';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ChatPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [targetId, setTargetId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Kiểm tra nếu chưa đăng nhập, chuyển hướng về trang login
    useEffect(() => {
        console.log('Token trong ChatPage:', token);
        if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate]);

    // Lấy danh sách người dùng để chọn targetId
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                const response = await axios.get('http://localhost:8000/api/users/users');
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setError('Dữ liệu người dùng không hợp lệ');
                    setUsers([]);
                }
            } catch (err) {
                console.error('Lỗi khi lấy danh sách người dùng:', err);
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
        if (token) {
            fetchUsers();
        }
    }, [token, logout, navigate]);

    if (!token || !user) {
        return null; // Hoặc hiển thị loading
    }

    return (
        <div>
            <h1>Ứng dụng Chat</h1>
            <div>
                <h2>Chọn người dùng để chat:</h2>
                <select onChange={(e) => setTargetId(e.target.value)} value={targetId || ''}>
                    <option value="">Chọn người dùng</option>
                    {users.map((user) => (
                        <option key={user.username} value={user.username}>
                            {user.username}
                        </option>
                    ))}
                </select>
            </div>
            {targetId && (
                <Chat
                    userId={user.user_id} // Lấy user_id từ user
                    targetId={targetId}
                    token={token} // Lấy token từ useAuth
                />
            )}
        </div>
    );
};

export default ChatPage;