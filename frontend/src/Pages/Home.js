import React, {  useEffect } from "react";
// import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
// import MainContent from '/var/www/demo1/frontend/src/Components/MainCotent';
// import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
// import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
import SideBar from "../Components/SideBar";
import MainContent from "../Components/MainCotent";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]); // Chạy lại khi user hoặc navigate thay đổi

    if (!user) {
        return null; // Trả về null trong khi chờ điều hướng
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };



    return (
        <>
            <div className="flex">
                <SideBar />
                {/* <h2 className="text-2xl font-bold mb-6 text-center">Chào mừng, {user.username}!</h2>
                <p className="mb-4">Vai trò: {user.role}</p>
                <p className="mb-6">VIP: {user.vip ? 'Có' : 'Không'}</p>
                <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                Đăng xuất
                </button> */}
                <MainContent />
                <FriendActivity />
            </div>
            <BottomPlayer />
        </>
    );
}
export default Home;