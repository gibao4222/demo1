import React, {useState, useEffect} from "react";
import axios from "../axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Chat from "../Components/Chat";
import { motion } from "framer-motion";

function FriendActivity(){
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     if (!token || !user){
    //         navigate("/login");
    //     }
    // }, [token, user, navigate]);

    useEffect(() =>{
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/api/users/users");
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setError("Dữ liệu người dùng không hợp lệ");
                    setUsers([]);
                }
            } catch (err) {
                setError("Không thể lấy danh sách người dùng");
                setUsers([]);
                if (err.response?.status === 401){
                    logout();
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await axios.get("/api/chat/permission/");
                setRequests(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy yêu cầu trò chuyện:", err);
                if (err.response?.status === 401) {
                    logout();
                    navigate("/login");
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
            await axios.put("/api/chat/permission/",{
                requester_id: requestId,
                action,
            })
            setRequests(requests.filter((req) => req.id !== requestId));
        } catch (err) {
            console.error(`Lỗi khi ${action} yêu cầu trò chuyện:`, err);
            if(err.response?.status === 401) {
                logout();
                navigate("/login");
            }
        }
    };

    const toggleChat = (userId) => {
        if (selectedUserId === userId) {
            setSelectedUserId(null); // Đóng khung chat nếu đang mở
        } else {
            setSelectedUserId(userId); // Mở khung chat với người dùng được chọn
        }
    };

    const selectedUser = users.find((u) => u.user.id === selectedUserId);
    const selectedUserName = selectedUser ? selectedUser.username : "Người dùng không xác định";

    return (
        <div className=" bg-neutral-900 p-3 sideBar rounded-lg flex flex-col min-h-[calc(100vh-136px)]">
        <ul className="mt-3">
            <li className="mb-4 li-inline-friend">
                <span>Friend Activity</span>
                <div className="icons">
                    
                    <img src="/icon/Close_S.png" alt="Cancel"/>
                </div>
            </li>
            {/* Phần 1: Danh sách yêu cầu trò chuyện */}
                <li className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Yêu cầu tin nhắn</h3>
                    {requests.length === 0 ? (
                        <p className="text-gray-400">Không có yêu cầu nào.</p>
                    ) : (
                        requests.map((req) => (
                            <div
                                key={req.id}
                                className="flex items-center justify-between p-2 border-b border-gray-700"
                            >
                                <span>{req.requester} muốn trò chuyện với bạn</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRequest(req.requester_id, "accept")}
                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                    >
                                        Chấp nhận
                                    </button>
                                    <button
                                        onClick={() => handleRequest(req.requester_id, "reject")}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </li>

                {/* Phần 2: Danh sách người dùng */}
                <li className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Danh sách người dùng</h3>
                    {loading ? (
                        <p className="text-gray-400">Đang tải...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ul>
                            {users.map((u) => (
                                <li
                                    key={u.id}
                                    className="flex items-center justify-between p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
                                    onClick={() => toggleChat(u.user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="/icon/UserBlue.png"
                                            alt="User"
                                            className="w-6 h-6"
                                        />
                                        <span>{u.username}</span>
                                    </div>
                                    <img src="/icon/Union.png" alt="Chat" className="w-5 h-5" />
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            
        </ul>
        {/* Khung chat bật/tắt */}
        {selectedUserId && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-[72px] right-64 w-[350px] h-[500px] bg-neutral-800 rounded-t-lg shadow-lg z-20"
                >
                    <Chat
                        userId={user.user_id}
                        targetId={selectedUserId}
                        token={token}
                        targetUsername={selectedUserName} // Truyền tên người dùng vào Chat
                    />
                    <button
                        onClick={() => setSelectedUserId(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
   </div>
    );
}

export default FriendActivity;