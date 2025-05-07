import React, { useState, useEffect, useRef } from 'react';
import NavItem from './Item/NavItem';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "../axios";
import { FaMicrophoneLines } from "react-icons/fa6";
import { FaMicrophoneLinesSlash } from "react-icons/fa6";
import AudioSearch from './AudioSearch';

const NavBar = ({ user, onLogout, onSearch }) => {
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

    // const startRecording = async () => {
    //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //     mediaRecorderRef.current = new MediaRecorder(stream);
    //     audioChunksRef.current = [];

    //     mediaRecorderRef.current.ondataavailable = (event) => {
    //         if (event.data.size > 0) {
    //             audioChunksRef.current.push(event.data);
    //         }
    //     };

    //     mediaRecorderRef.current.onstop = async () => {
    //         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    //         const audioFile = new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" });

    //         // Debug: Kiểm tra file trước khi gửi
    //         console.log("Audio file details:", {
    //             name: audioFile.name,
    //             size: audioFile.size,
    //             type: audioFile.type
    //         });

    //         const formData = new FormData();
    //         formData.append('audio', audioFile);

    //         // Debug: Kiểm tra FormData
    //         for (let [key, value] of formData.entries()) {
    //             console.log(key, value);
    //         }

    //         try {
    //             const res = await axios.post('/api/songs/search-by-audio/', formData, {
    //                 headers: {
    //                     'Content-Type': 'multipart/form-data',

    //                 }
    //             });
    //             console.log(res)
    //             if (res.data.results && res.data.results.length > 0) {
    //                 const bestMatch = res.data.results[0];
    //                 alert(`Kết quả: ${bestMatch.name} (${Math.round(bestMatch.similarity * 100)}%)`);
    //             } else {
    //                 alert('Không tìm thấy bài hát phù hợp');
    //             }
    //         } catch (err) {
    //             console.error("Error details:", {
    //                 message: err.message,
    //                 response: err.response?.data,
    //                 status: err.response?.status
    //             });
    //             alert('Không tìm thấy bài hát hoặc có lỗi xảy ra! Chi tiết: ' +
    //                 (err.response?.data?.message || err.message));
    //         }
    //     };

    //     mediaRecorderRef.current.start();
    //     setRecording(true);
    // };


    // const stopRecording = async () => {
    //     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
    //         mediaRecorderRef.current.stop();

    //         // Dừng tất cả các track của stream để giải phóng microphone
    //         mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

    //         setRecording(false);
    //     }
    // };


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


                </div>
                <AudioSearch onSearch={onSearch}></AudioSearch>
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
