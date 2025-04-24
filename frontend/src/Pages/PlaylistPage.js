import React, { useEffect } from "react";
import SideBar from "../Components/SideBar";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import PlaylistDetail from '../Components/Playlist/PlaylistDetail';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "../Components/NavBar";

const PlaylistPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* NavBar - Full width and sticky */}
            <NavBar user={user} onLogout={handleLogout} />

            {/* Main Content Area - Flex container for Sidebar and CreatePlaylist */}
            <div className="flex flex-1 ">
                <div className="fixed top-[64px] h-[calc(100vh-136px)] w-1/5 z-10">
                    <SideBar />
                </div>
                <div className="w-1/5"></div>

                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                <div className="fixed top-[64px] left-[calc(20%+6px)] h-[calc(100vh-136px)] w-[calc(60%-12px)] z-0 ">
                    <PlaylistDetail playlist={location.state?.playlist} /> {/* Truyền playlist từ state */}
                </div>

                <div className="flex-1"></div>

                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                <div className="fixed top-[64px] right-0 h-[calc(100vh-136px)] w-1/5 z-10">
                    <FriendActivity />
                </div>

                
            </div>

            {/* Bottom Player - Fixed at the bottom */}
            <div className="z-10">
                <BottomPlayer />
            </div>
        </div>
    );
};

export default PlaylistPage;