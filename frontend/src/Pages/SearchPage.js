import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
// import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
// import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
// import MainSearch from '/var/www/demo1/frontend/src/Components/MainSearch';
import NavBar from "../Components/NavBar";
import { useAuth } from '../context/AuthContext';

import SideBar from "../Components/SideBar";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import MainSearch from "../Components/MainSearch";

function SearchPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy searchQuery từ query parameter
    const searchParams = new URLSearchParams(location.search);
    const initialQuery = searchParams.get('query') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Cập nhật searchQuery khi URL thay đổi
        const query = searchParams.get('query') || '';
        setSearchQuery(query);
    }, [location.search]);

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            // Cập nhật URL với từ khóa mới
            navigate(`/Search?query=${encodeURIComponent(query)}`);
        } else {
            // Nếu query rỗng, xóa từ khóa tìm kiếm
            navigate('/Search');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <NavBar user={user} onLogout={handleLogout} onSearch={handleSearch} />

            <div className="flex flex-1">

                <div className="fixed top-[64px] h-[calc(100vh-136px)] w-1/5 z-10">
                    <SideBar />
                </div>

                <div className="w-1/5"></div>
                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                <div className="fixed top-[64px] left-[calc(20%+6px)] h-[calc(100vh-136px)] w-[calc(60%-12px)] z-0 ">
                    <MainSearch searchQuery={searchQuery} />
                </div>

                <div className="flex-1"></div>

                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                <div className="fixed top-[64px] right-0 h-[calc(100vh-136px)] w-1/5 z-10">
                    <FriendActivity />
                </div>
            </div>
            <div className="z-10">
                <BottomPlayer />
            </div>
        </div>
    );
}

export default SearchPage;