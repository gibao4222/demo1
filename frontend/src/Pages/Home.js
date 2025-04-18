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
            <div className="min-h-screen bg-black text-white flex flex-col">
                {/* NavBar - Full width and sticky */}
                <NavBar user={user} onLogout={handleLogout}/>

                {/* Main Content Area - Flex container for Sidebar, MainContent, and FriendActivity */}
                <div className="flex flex-1 h-[calc(100vh-136px)]">

                    <div className="fixed top-[64px] h-[calc(100vh-136px)] w-1/5 z-10">
                        <SideBar />
                    </div>
                    <div className="w-1/5"></div>
                    <div className="w-px bg-black cursor-col-resize resize-x min-w-[2px] px-1"></div>
                    <MainContent user={user} onLogout={handleLogout} />
                    <div className="w-px bg-black cursor-col-resize resize-x min-w-[2px] px-1"></div>
                    <FriendActivity />
                </div>

                {/* Bottom Player - Fixed at the bottom */}
                <div className="z-10">
                <BottomPlayer />

                </div>
            </div>
        </>
    );
}
export default Home;