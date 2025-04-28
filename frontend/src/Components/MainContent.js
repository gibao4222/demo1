import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";

const MainContent = () => {
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [error, setError] = useState(null);
    const [isHeaderStuck, setIsHeaderStuck] = useState(false);

    const scrollContainerRef = useRef(null);
    const headerRef = useRef(null)

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get("/api/playlists/playlists/");
            const data = response.data;
            if (Array.isArray(data) && data.length > 0) {
                setPlaylists(data);
                // Chọn playlist ngẫu nhiên
                const randomIndex = Math.floor(Math.random() * data.length);
                setCurrentPlaylist(data[randomIndex]);
                setError(null);
            } else {
                setError("Không có playlist nào để hiển thị.");
            }
        } catch (error) {
            console.error("Lỗi khi lấy playlist:", error);
            setError("Không thể tải playlist. Vui lòng thử lại sau.");
            // Interceptor trong axios.js sẽ xử lý lỗi 401 và chuyển hướng nếu cần
        }
    };

    useEffect(() => {
        fetchPlaylists(); // Gọi ngay lần đầu

        // Cập nhật mỗi giờ (3600000ms = 1 giờ)
        const interval = setInterval(fetchPlaylists, 5000);

        // Cleanup interval khi component unmount
        return () => clearInterval(interval);
    }, []);

    // Theo dõi khi header chạm top để thêm hiệu ứng
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Khi header chạm top (isIntersecting = false), thêm hiệu ứng
                setIsHeaderStuck(!entry.isIntersecting);
            },
            {
                root: scrollContainerRef.current,
                threshold: 0,
                rootMargin: "0px 0px 0px 0px",
            }
        );

        // Tạo một sentinel element ngay trên header để theo dõi
        const sentinel = document.createElement("div");
        sentinel.style.height = "0px";
        header.parentNode.insertBefore(sentinel, header);
        observer.observe(sentinel);

        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, []);

    return (
        <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden">
            
            <div className="flex-1 overflow-y-auto overlay-scroll" ref={scrollContainerRef}>
                {/* Phần Quảng bá */}
                <div className="bg-blue-900 px-4 pb-2 pt-3 items-center">
                        {error ? (
                            <div className="p-3 flex bg-gradient-to-tr from-black to-transparent rounded-sm">
                                {error}
                            </div>
                            ) : currentPlaylist ? (
                                <div className="p-3 flex bg-gradient-to-tr from-black to-transparent rounded-sm">
                                    {/* <img
                                        src={
                                            currentPlaylist.image.startsWith("http")
                                                ? currentPlaylist.image
                                                : `https://localhost${currentPlaylist.image}`
                                        }
                                        alt="Playlist Cover"
                                        className="w-36 h-36 object-cover mr-4"
                                    /> */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-sm text-gray-400">Playlist</span>
                                                <h2 className="text-2xl font-bold text-white">{currentPlaylist.name}</h2>
                                            </div>
                                            <span className="text-xs text-white bg-neutral-800 px-2 py-1 rounded">Sponsored</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {currentPlaylist.description}
                                        </p>
                                        <div className="flex items-center mt-3 space-x-3">
                                            <button className="bg-green-500 text-black font-semibold px-6 py-2 rounded-full hover:bg-green-400">
                                                Play
                                            </button>
                                            <button className="border border-white text-white font-semibold px-6 py-2 rounded-full hover:bg-neutral-700">
                                                Follow
                                            </button>
                                            <button className="text-gray-400 hover:text-white">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="6" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="18" r="2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-gradient-to-tr from-black to-transparent rounded-lg text-gray-400">
                                    Đang tải playlist...
                                </div>
                            )}
                </div>
                {/* Phần Header maincontent */}
                <div
                    ref={headerRef}
                    className={`sticky top-0 z-10 pt-3 px-6 bg-blue-900 backdrop-blur-md transition-all duration-300 ${
                        isHeaderStuck ? "bg-opacity-25" : ""
                    }`}
                >
                    <div className="flex space-x-3 pb-2.5">
                        <button className="px-3.5 py-1 bg-white text-black rounded-full bg-opacity-75">Tất cả</button>
                        <button className="px-3.5 py-1 bg-neutral-500 text-white rounded-full bg-opacity-35 hover:bg-neutral-600 hover:bg-opacity-35">Âm nhạc</button>
                        <button className="px-3.5 py-1 bg-neutral-500 text-white rounded-full bg-opacity-35 font hover:bg-neutral-600 hover:bg-opacity-35">Podcast</button>
                    </div>
                </div>
                <div className="bg-gradient-to-b from-blue-900 to-neutral-900">
                    
                    {/* Phần Playlist đề xuất */}
                    <div className="p-4 flex-1">      
                        <div className="grid grid-cols-2 gap-2.5 mb-8">
                            <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                                <img alt="" src="./img/AlbumCover.png" className=" object-cover mr-4" />
                                Chill Mix
                            </div>
                            <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                                <img alt="" src="./img/AlbumCover1.png" className=" object-cover mr-4" />
                                Pop Mix
                            </div>
                            <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                                <img alt="" src="./img/AlbumCover2.png" className=" object-cover mr-4" />
                                Daily Mix 1
                            </div>
                            <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                                <img alt="" src="./img/AlbumCover3.png" className=" object-cover mr-4" />
                                Daily Mix 5
                            </div>
                            <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                                <img alt="" src="./img/AlbumCover4.png" className=" object-cover mr-4" />
                                Folk &amp; Acoustic Mix
                            </div>
                            <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                                <img alt="" src="./img/AlbumCover5.png" className=" object-cover mr-4" />
                                Daily Mix 4
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mb-8 pl-6 pr-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Your top mixes
                        </h2>
                        <button className="text-gray-400" >
                            SEE ALL
                        </button>
                    </div>
                    {playlists.length > 0 ? (
                        <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {playlists.map((playlist, index) => (
                                <div key={index} className="p-2.5 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group">
                                    <div className="relative">
                                        {/* <img
                                            alt={playlist.name}
                                            className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                                            src={
                                                playlist.image.startsWith("http")
                                                    ? playlist.image
                                                    : `https://localhost${playlist.image}`
                                            }
                                        /> */}

                                        < img
                                            src="/icon/Play_GreemHover.png"
                                            alt="Play"
                                            className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                                        />

                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-base font-bold">{playlist.name}</h3>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm text-gray-400">{playlist.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Đang tải playlist...</div>
                    )}
                    
                </div>
                <div className="mb-8 pl-6 pr-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Made for you
                        </h2>
                        <button className="text-gray-400">
                            SEE ALL
                        </button>
                    </div>
                    {playlists.length > 0 ? (
                        <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {playlists.map((playlist, index) => (
                                <div key={index} className="p-2.5 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer">
                                    <div className="relative">
                                        {/* <img
                                            alt={playlist.name}
                                            className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                                            src={
                                                playlist.image.startsWith("http")
                                                    ? playlist.image
                                                    : `https://localhost${playlist.image}`
                                            }
                                        /> */}

                                        < img
                                            src="/icon/Play_GreemHover.png"
                                            alt="Play"
                                            className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                                        />

                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-base font-bold">{playlist.name}</h3>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm text-gray-400">{playlist.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Đang tải playlist...</div>
                    )}
                </div>
                <div className="mb-8 pl-6 pr-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Recently played
                        </h2>
                        <button className="text-gray-400">
                            SEE ALL
                        </button>
                    </div>
                    {playlists.length > 0 ? (
                        <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {playlists.map((playlist, index) => (
                                <div key={index} className="p-2.5 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group">
                                    <div className="relative">
                                        {/* <img
                                            alt={playlist.name}
                                            className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                                            src={
                                                playlist.image.startsWith("http")
                                                    ? playlist.image
                                                    : `https://localhost${playlist.image}`
                                            }
                                        /> */}

                                        < img
                                            src="/icon/Play_GreemHover.png"
                                            alt="Play"
                                            className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                                        />

                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-base font-bold">{playlist.name}</h3>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm text-gray-400">{playlist.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Đang tải playlist...</div>
                    )}
                </div>
                <div className="mb-8 pl-6 pr-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Jump back in
                        </h2>
                        <button className="text-gray-400">
                            SEE ALL
                        </button>
                    </div>
                    {playlists.length > 0 ? (
                        <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {playlists.map((playlist, index) => (
                                <div key={index} className="p-2.5 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group">
                                    <div className="relative">
                                        {/* <img
                                            alt={playlist.name}
                                            className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                                            src={
                                                playlist.image.startsWith("http")
                                                    ? playlist.image
                                                    : `https://localhost${playlist.image}`
                                            }
                                        /> */}

                                        < img
                                            src="/icon/Play_GreemHover.png"
                                            alt="Play"
                                            className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                                        />

                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-base font-bold">{playlist.name}</h3>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm text-gray-400">{playlist.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Đang tải playlist...</div>
                    )}
                </div>
                <div className="mb-8 pl-6 pr-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Uniquely yours
                        </h2>
                        <button className="text-gray-400">
                            SEE ALL
                        </button>
                    </div>
                    {playlists.length > 0 ? (
                        <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {playlists.map((playlist, index) => (
                                <div key={index} className="p-2.5 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group">
                                    <div className="relative">
                                        {/* <img
                                            alt={playlist.name}
                                            className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                                            src={
                                                playlist.image.startsWith("http")
                                                    ? playlist.image
                                                    : `https://localhost${playlist.image}`
                                            }
                                        /> */}

                                        < img
                                            src="/icon/Play_GreemHover.png"
                                            alt="Play"
                                            className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                                        />

                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-base font-bold">{playlist.name}</h3>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm text-gray-400">{playlist.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Đang tải playlist...</div>
                    )}
                </div>
                <div className="mb-8 pl-6 pr-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            Just the hits
                        </h2>
                        <button className="text-gray-400">
                            SEE ALL
                        </button>
                    </div>
                    {playlists.length > 0 ? (
                        <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {playlists.map((playlist, index) => (
                                <div key={index} className="p-2.5 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group">
                                    <div className="relative">
                                        {/* <img
                                            alt={playlist.name}
                                            className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                                            src={
                                                playlist.image.startsWith("http")
                                                    ? playlist.image
                                                    : `https://localhost${playlist.image}`
                                            }
                                        /> */}

                                        < img
                                            src="/icon/Play_GreemHover.png"
                                            alt="Play"
                                            className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                                        />

                                    </div>
                                    <div className="truncate">
                                        <h3 className="text-base font-bold">{playlist.name}</h3>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm text-gray-400">{playlist.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Đang tải playlist...</div>
                    )}
                </div>
            </div>
            
        </div>
    );
}

export default MainContent;