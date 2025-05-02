import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SideBar from "../Components/SideBar";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import NavBar from "../Components/NavBar";
import { useAuth } from "../context/AuthContext";
import BottomPlayer_ex from "../Components/BottomPlayer_ex";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const initialQuery = searchParams.get('query') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    // Kiểm tra nếu không có user thì chuyển hướng về login
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const query = searchParams.get('query') || '';
        setSearchQuery(query);
    }, [location.search]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/search?query=${encodeURIComponent(query)}`);
        } else {
            navigate('/search'); // Xử lý khi query rỗng: điều hướng đến /search
        }
    };

    if (!user) {
        return null; // Không render gì nếu không có user
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* NavBar - Full width and sticky */}
            <NavBar user={user} onLogout={handleLogout} onSearch={handleSearch} />

            {/* Main Content Area - Flex container for Sidebar, MainContent, and FriendActivity */}
            <div className="flex flex-1">
                {/* SideBar - Fixed on the left */}
                <div className="fixed top-[64px] h-[calc(100vh-136px)] w-1/5 z-10">
                    <SideBar />
                </div>

                {/* Placeholder for SideBar width */}
                <div className="w-1/5"></div>

                {/* Resizable divider */}
                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                {/* Main Content - Dynamic content based on route */}
                <div className="fixed top-[64px] left-[calc(20%+6px)] h-[calc(100vh-136px)] w-[calc(60%-12px)] z-0 overflow-y-auto">
                    <Outlet context={{ searchQuery }} /> {/* Nội dung của Main sẽ render ở đây */}
                </div>

                {/* Placeholder for Main content width */}
                <div className="flex-1"></div>

                {/* Resizable divider */}
                <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

                {/* FriendActivity - Fixed on the right */}
                <div className="fixed top-[64px] right-0 h-[calc(100vh-136px)] w-1/5 z-10">
                    <FriendActivity />
                </div>
            </div>

            {/* Bottom Player - Fixed at the bottom */}
            <div className="z-10">
                <BottomPlayer_ex />
            </div>
        </div>
    );

};

export default MainLayout;