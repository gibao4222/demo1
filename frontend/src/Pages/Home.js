import React, { useEffect } from "react";
import SideBar from "../Components/SideBar";
import MainContent from "../Components/MainContent";
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
                <MainContent user={user} onLogout={handleLogout}/>
                <FriendActivity />
            </div>
            <BottomPlayer />
        </>
    );
}
export default Home;