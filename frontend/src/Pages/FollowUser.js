import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Import components
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import MainFollowUser from "../Components/MainFollowUser";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";

function FollowUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra xác thực: Nếu không có user, chuyển hướng về trang đăng nhập
  if (!user) {
    navigate("/login");
    return null;
  }

  // Xử lý đăng xuất
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Xử lý tìm kiếm
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/Search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* NavBar - Full width and sticky */}
      <NavBar user={user} onLogout={handleLogout} onSearch={handleSearch} />

      {/* Main Content Area - Flex container for Sidebar, MainFollowUser, and FriendActivity */}
      <div className="flex flex-1">
        {/* Sidebar - Fixed on the left */}
        <div className="fixed top-[64px] h-[calc(100vh-136px)] w-1/5 z-10">
          <SideBar />
        </div>

        {/* Spacer for Sidebar */}
        <div className="w-1/5"></div>

        {/* Resizable divider */}
        <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

        {/* Main Content Area - Contains MainFollowUser */}
        <div className="fixed top-[64px] left-[calc(20%+6px)] h-[calc(100vh-136px)] w-[calc(60%-12px)] z-0">
          <MainFollowUser />
        </div>

        {/* Spacer for Main Content */}
        <div className="flex-1"></div>

        {/* Resizable divider */}
        <div className="w-px bg-black cursor-col-resize resize-x min-w-[4px] px-1"></div>

        {/* Friend Activity - Fixed on the right */}
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
}

export default FollowUser;