import React, { useEffect } from "react";
import SideBar from "../Components/SideBar";
import MainContent from "../Components/MainContent";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBar from "../Components/NavBar";

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
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                {/* NavBar - Full width and sticky */}
                <NavBar user={user} onLogout={handleLogout}/>

                {/* Main Content Area - Flex container for Sidebar, MainContent, and FriendActivity */}
                <div className="flex flex-1">
                    <SideBar />
                    <MainContent user={user} onLogout={handleLogout} />
                    <FriendActivity />
                </div>

                {/* Bottom Player - Fixed at the bottom */}
                <BottomPlayer />
            </div>
        </>
    );
}
export default Home;