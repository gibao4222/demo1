import React, { useState, useEffect, useRef } from 'react';
import NavItem from './Item/NavItem';
import { useNavigate, useLocation } from 'react-router-dom';


const NavBar = ({ user, onLogout, onSearch, toggleFriendActivity, showFriendActivity, shouldShowMusicBar }) => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('null');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const searchInputRef = useRef(null);

    const handleItemClick = (item) => {
        setActiveItem((prev) => (prev === item ? null : item));
        if (item === 'Home') {
            navigate('/home'); 
        }
    };

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [location.search]);
    

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (typeof onSearch === 'function') {
            onSearch(query);
        }
    };

    
    const handleBack = () => {
        navigate(-1); 
    };

    const handleForward = () => {
        navigate(1); 
    };

    const handleSpotifyClick = () => {
        navigate('/home'); 
    };

    
    const handleProfileClick = () => {
        if (user && user.id_spotify_user) {
            navigate(`/user/${user.id_spotify_user}`);
        }
        setIsDropdownOpen(false);
    };

    const handlePayment = () => {
        navigate('/payment'); 
    }
    return (
        <div className="sticky top-0 z-50 w-full bg-black px-4 py-2.5 flex items-center relative">
            <div className="flex-shrink-0 flex items-center space-x-0.5">
                <button onClick={handleSpotifyClick}>
                    <img
                        src="/icon/Spotify_BackGround_White.png"
                        alt="Spotify Logo"
                        className="w-10 h-10 cursor-pointer"
                    />
                </button>
                <button onClick={handleBack} className="pl-3 text-neutral-400 hover:text-white">
                    <img
                        src="/icon/Back.png"
                        alt="Back"
                        className="w-8 h-8"
                    />
                </button>
                <button onClick={handleForward} className="text-neutral-400 hover:text-white">
                    <img
                        src="/icon/Forward.png"
                        alt="Forward"
                        className="w-8 h-8"
                    />
                </button>
            </div>

            <div className='absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3.5'>
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

                        className="bg-gray-800 text-white placeholder-neutral-400 rounded-full py-2.5 pl-10 pr-12 w-[500px] focus:outline-none focus:ring-2 focus:ring-white"
                        onChange={handleSearchChange}
                        ref={searchInputRef}
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

            <div className="ml-auto flex items-center space-x-6">
                {!user?.vip && (
                    <button
                        className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-500 truncate"
                        onClick={() => navigate("/payment")}
                    >
                        Khám phá Premium
                    </button>
                )}
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

                    {/* Friend Activity Icon */}
                    <button
                        onClick={shouldShowMusicBar ? toggleFriendActivity : undefined}
                        className={`${
                            shouldShowMusicBar && showFriendActivity ? 'text-white' : 'text-neutral-400'
                        } hover:text-white ${!shouldShowMusicBar ? 'cursor-default' : ''}`}
                    >
                        <img
                            src="/icon/friendActivity.png"
                            alt="Friend Activity"
                            className="w-7 h-7 items-center"
                        />
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
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer" onClick={handleProfileClick}>
                                    Hồ sơ
                                </li>
                                <li className="px-4 py-2 text-white hover:bg-neutral-700 cursor-pointer" onClick={handlePayment}>
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
