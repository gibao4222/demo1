import React, { useState, useEffect } from 'react';
import NavItem from './Item/NavItem';
import { useNavigate, useLocation } from 'react-router-dom';


const NavBar = ({ user, onLogout, onSearch }) => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('null');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const handleItemClick = (item) => {
        setActiveItem((prev) => (prev === item ? null : item));
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('query') || '';
        setSearchQuery(query);
    }, [location.search]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (typeof onSearch === 'function') {
            onSearch(query);
        }
    };
    return (
        <div className="sticky top-0 z-50 w-full flex items-center gap-96 bg-black px-4 py-2.5">
            <div className="flex items-center space-x-3.5">
                <img
                    src="/icon/Spotify_BackGround_White.png"
                    alt="Spotify Logo"
                    className="w-10 h-10 mr-4"
                />
                <NavItem
                    icon="/icon/Home_Fill_S.png"
                    active={activeItem === 'Home'}
                    activeStyle="none"
                    onClick={() => handleItemClick('Home')}
                />

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Bạn muốn phát nội dung gì?"

                        className="bg-gray-800 text-white placeholder-gray-400 rounded-full py-2.5 pl-10 pr-12 w-[500px] focus:outline-none focus:ring-2 focus:ring-white"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <img
                        src="/icon/Search_S.png"
                        alt="Tìm kiếm"
                        className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
                    />
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2 h-5 w-px bg-white opacity-50" />
                    {/* Nút Duyệt tìm */}
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2  p-1">
                        <img
                            src="/icon/browser.webp"
                            alt="Duyệt tìm"
                            className="w-12 h-10 brightness-0 invert opacity-50"
                        />
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-6 ml-6">
                {/* Premium Button */}
                <button className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-500"
                    onClick={() => navigate("/payment")}>

                    Khám phá Premium

                </button>
                <div className="relative flex items-center space-x-4">
                    {/* Notification Bell Icon */}
                    <button className="text-neutral-400 hover:text-white">
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                        </svg>
                    </button>
                    <div className='flex bg-neutral-700 rounded-full h-9 w-9 items-center justify-center' onClick={toggleDropdown}>
                        <img
                            src="/images/blog/blog-10.jpg"
                            alt="User Avatar"
                            className="w-7 h-7 rounded-full items-center"
                        />
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute top-12 right-0 w-48 bg-neutral-800 rounded-lg shadow-lg z-10">
                            <ul className="py-2">
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer">
                                    Tài khoản
                                </li>
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer">
                                    Hồ sơ
                                </li>
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer">
                                    Nâng cấp lên Premium
                                </li>
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer">
                                    Hỗ trợ
                                </li>
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer">
                                    Tải xuống
                                </li>
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer">
                                    Cài đặt
                                </li>
                                <li className="border-t border-neutral-600 px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer"
                                    onClick={() => {
                                        onLogout();
                                        setIsDropdownOpen(false); // Đóng menu sau khi đăng xuất
                                    }}
                                >
                                    Đăng xuất
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* <span className="text-sm">Cài đặt Ứng dụng</span> */}

                </div >
            </div >
        </div >
    );
};

export default NavBar;
