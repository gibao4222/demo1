import React, { useEffect, useState } from "react";
import SideBar from "../Components/SideBar";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import PlaylistDetail from '../Components/Playlist/PlaylistDetail';
import { useAuth } from '../context/AuthContext';
import { getPlaylistDetail } from '../Services/PlaylistService';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import NavBar from "../Components/NavBar";

const PlaylistPage = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Lấy id từ URL
    const [playlist, setPlaylist] = useState(location.state?.playlist || null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Kiểm tra nếu playlist không có trong state và id tồn tại
        if (!playlist && id) {
            const fetchPlaylist = async () => {
                try {
                    const playlistData = await getPlaylistDetail(id, token);
                    setPlaylist(playlistData);
                } catch (error) {
                    console.error('Lỗi khi lấy playlist:', error);
                    alert('Không thể tải playlist. Vui lòng thử lại.');
                    navigate('/home');
                }
            };
            fetchPlaylist();
        }
    }, [user, id, playlist, token, navigate]);

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/Search?query=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* NavBar - Full width and sticky */}
            <NavBar user={user} onLogout={handleLogout} onSearch={handleSearch} />

            {/* Main Content Area - Flex container for Sidebar and PlaylistDetail */}
            <div className="flex flex-1">
                <div className="fixed top-[64px] h-[calc(100vh-136px)] w-1/5 z-10">
                    <SideBar />
                </div>
                <div className="w-1/5"></div>

                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                <div className="fixed top-[64px] left-[calc(20%+6px)] h-[calc(100vh-136px)] w-[calc(60%-12px)] z-0">
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