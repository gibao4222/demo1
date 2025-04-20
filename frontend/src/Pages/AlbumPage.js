import React, { useEffect } from "react";
import SideBar from "../Components/SideBar";
import BottomPlayer from "../Components/BottomPlayer";
import { useAuth } from '../context/AuthContext';
import AlbumDetail from '../Components/AlbumDetail';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from "../Components/NavBar";

const AlbumPage = () => {
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
        <div className="min-h-screen overflow-hidden bg-gray-900 text-white flex flex-col">
            {/* NavBar - Full width and sticky */}
            <NavBar user={user} onLogout={handleLogout} />

            {/* Main Content Area - Flex container for Sidebar and CreatePlaylist */}
            <div className="flex flex-1 ">
                <SideBar />
                <AlbumDetail playlist={location.state?.playlist} /> {/* Truyền playlist từ state */}
            </div>

            {/* Bottom Player - Fixed at the bottom */}
            <BottomPlayer />
        </div>
    );
};

export default AlbumPage;