import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlaylists, createPlaylist, addSongToPlaylist } from '../Services/PlaylistService';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from "../context/PlayerContext";
import axios from "../axios";
import { toast } from 'react-toastify';

function MusicBar() {
    const { 
        song: currentSong, 
        setCurrentSong, 
        isPlaying,
        setIsPlaying,
        setCurrentSongList
    } = usePlayer();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const toggleButtonRef = useRef(null);
    const modalRef = useRef(null);

    const { token, user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [listSongRelated, setListSongRelated] = useState([]);
    
    const navigate = useNavigate();
    const [song, setSong] = useState(null);
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [previewEnded, setPreviewEnded] = useState(false);

    const playlistRef = useRef(null);
    const modalPlaylistRef = useRef(null);
    const videoRef = useRef(null);
    const relatedSongsRef = useRef(null);
    const isLoadingSongRef = useRef(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !user?.vip || !song?.url_video) return;

        if (isPlaying) {
            video.play().catch(e => console.log("Video play error:", e));
        } else {
            video.pause();
        }
    }, [isPlaying, user?.vip, song?.url_video]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && user?.vip && song?.url_video) {
            video.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, [song?.url_video, user?.vip]);

    useEffect(() => {
        if (currentSong && (!song || (song && currentSong.id !== song.id))) {
            setSong(currentSong);
        }
    }, [currentSong, song]);

    const fetchSongDetails = async (songId) => {
        if (!songId) {
            console.warn('Không có songId để gọi API.');
            return;
        }

        try {
            const response = await axios.get(`/api/songs/songs/${songId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedSong = response.data;
            console.log('Dữ liệu bài hát đầy đủ:', updatedSong);
            setCurrentSong(updatedSong);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu bài hát:', error);
            alert('Không thể tải thông tin bài hát. Vui lòng thử lại sau.');
        }
    };

    useEffect(() => {
        if (song && song.id) {
            fetchSongDetails(song.id);
        }
    }, [song, token]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user || !user.id_spotify_user) {
                console.error('Thiếu thông tin user hoặc id_spotify_user:', user);
                setPlaylists([]);
                return;
            }

            setLoading(true);
            try {
                const data = await getPlaylists(token, user.id_spotify_user);
                if (!Array.isArray(data) || data.length === 0) {
                    setPlaylists([]);
                    console.error('Không có danh sách phát nào cho user hiện tại.');
                    return;
                }
                const filteredPlaylists = data.filter(
                    playlist => playlist.id_user === user.id_spotify_user
                );
                setPlaylists([...filteredPlaylists]);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách phát:', error);
                alert('Không thể tải danh sách phát. Vui lòng thử lại sau.');
                setPlaylists([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [token, user]);

    useEffect(() => {
        if (song && song.id) {
            getRelatedSongs();
        }
    }, [song?.id]);

    useEffect(() => {
        if (!relatedSongsRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    relatedSongsRef.current.classList.add('visible');
                    console.log("listSongRelated displayed");
                } else {
                    relatedSongsRef.current.classList.remove('visible');
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(relatedSongsRef.current);

        return () => observer.disconnect();
    }, [listSongRelated]);

    const getRelatedSongs = async () => {
        if (!song || !song.id) return;

        try {
            const res = await axios.get(`https://localhost/api/songs/related-songs/${song.id}`);
            console.log("listSongRelated data:", res.data);
            setListSongRelated(res.data || []);
            setCurrentSongList(res.data || []);
        } catch (e) {
            console.error("Error fetching listSongRelated:", e);
            setListSongRelated([]);
        }
    };

    const handleSongClick = async (clickedSong) => {
        if (isLoadingSongRef.current || clickedSong.id === song?.id) return;
        isLoadingSongRef.current = true;

        setSong(clickedSong);
        setCurrentSong(clickedSong);
        setSelectedSongId(clickedSong.id);
        setPreviewEnded(false);

        window.scrollTo(0, 0);
        setIsPlaying(true);
        isLoadingSongRef.current = false;
    };

    const handleCreatePlaylist = async () => {
        // Logic tạo playlist...
    };

    const handleAddSongToPlaylist = async (playlistId) => {
        // Logic thêm bài hát vào playlist...
    };

    const filteredPlaylists = playlists.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleMouseLeavePlaylist = (e) => {
        const relatedTarget = e.relatedTarget || e.toElement;
        if (
            relatedTarget &&
            modalRef.current &&
            modalRef.current.contains(relatedTarget) &&
            relatedTarget !== modalPlaylistRef.current &&
            !playlistRef.current.contains(relatedTarget)
        ) {
            setIsPlaylistOpen(false);
        }
    };

    const handleToggleModal = (e) => {
        if (toggleButtonRef.current) {
            const rect = toggleButtonRef.current.getBoundingClientRect();
            setModalPosition({
                top: rect.bottom + 6,
                left: rect.left - 245,
            });
        }
        setIsModalOpen(!isModalOpen);
        e.stopPropagation();
    };

    const handleClickOutside = useCallback((event) => {
        console.log("Click detected, isModalOpen:", isModalOpen);
        if (
            isModalOpen &&
            modalRef.current &&
            !modalRef.current.contains(event.target) &&
            toggleButtonRef.current &&
            !toggleButtonRef.current.contains(event.target)
        ) {
            console.log("Closing modal from outside click");
            setIsModalOpen(false);
        }
    }, [isModalOpen]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen, handleClickOutside]);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!token || !song || !song.artists || song.artists.length === 0) {
                console.log('Chưa đăng nhập hoặc không có thông tin nghệ sĩ.');
                return;
            }

            try {
                const artistId = song.artists[0].id;
                console.log('Kiểm tra trạng thái theo dõi cho artistId:', artistId);
                const response = await axios.get(
                    `/api/users/theo-doi-nghe-si/?singer_id=${artistId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log('Phản hồi từ checkFollowStatus:', response.data);
                setIsFollowing(response.data.is_following || false);
            } catch (error) {
                console.error('Lỗi khi kiểm tra trạng thái theo dõi:', error);
                toast.error('Không thể kiểm tra trạng thái theo dõi!');
            }
        };

        checkFollowStatus();
    }, [song?.artists, token]);

    const handleFollowToggle = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để theo dõi!');
            return;
        }

        if (!song || !song.artists || song.artists.length === 0) {
            toast.error('Không có thông tin nghệ sĩ để theo dõi!');
            return;
        }

        try {
            const artistId = song.artists[0].id;
            if (isFollowing) {
                console.log('Gửi yêu cầu DELETE để hủy theo dõi:', artistId);
                const response = await axios.delete(
                    `/api/users/theo-doi-nghe-si/?singer_id=${artistId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log('Phản hồi từ DELETE:', response.data);
                toast.success(response.data.thông_báo || 'Đã xóa khỏi Thư viện.');
                setIsFollowing(false);
            } else {
                console.log('Gửi yêu cầu POST để theo dõi:', artistId);
                const response = await axios.post(
                    `/api/users/theo-doi-nghe-si/`,
                    { singer_id: artistId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log('Phản hồi từ POST:', response.data);
                toast.success(response.data.thông_báo || 'Đã thêm vào Thư viện.');
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Lỗi khi thực hiện theo dõi/hủy theo dõi:', error);
            const errorMsg = error.response?.data?.lỗi || 'Có lỗi xảy ra, vui lòng thử lại!';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="bg-neutral-900 p-3 sideBar rounded-lg flex flex-col min-h-[calc(100vh-136px)]">
            <div className="flex-1 overflow-y-auto overlay-scroll">
                <div className='flex items-center mb-4'>
                    <img className='w-6 h-6' src='/icon/Music.png' />
                    <h2 className="font-normal text-base">
                    {currentSong?.artists && currentSong.artists.length > 0 
                            ? currentSong.artists.map(a => a.name).join(',') 
                            : "Không có nghệ sĩ"}
                    </h2>
                    <div className="flex space-x-2 ml-auto">
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-neutral-800">
                            <img 
                                className='w-6 h-6 cursor-pointer' 
                                src='/icon/Options_XS.png' 
                                onClick={handleToggleModal}
                                ref={toggleButtonRef}
                            />
                        </button>
                    </div>
                </div>

                {isModalOpen && (
                    <div
                        ref={modalRef}
                        className="fixed bg-neutral-800 rounded-lg shadow-lg z-50 w-[270px] text-sm p-2 text-gray-200 cursor-pointer"
                        style={{ top: `${modalPosition.top}px`, left: `${modalPosition.left}px` }}
                    >
                        <div className="flex items-center p-2 hover:bg-neutral-700 rounded py-2 -ml-1 -mr-1" ref={modalPlaylistRef} onMouseEnter={() => setIsPlaylistOpen(true)} onMouseLeave={handleMouseLeavePlaylist}>
                            <img className="w-3 h-3 mr-3" src="/icon/Create.png" />
                            <span>Thêm vào danh sách phát</span>
                            {isPlaylistOpen && (
                                <div
                                    ref={playlistRef}
                                    className="absolute right-full bottom-0 ml-1 w-[230px] bg-[#282828] rounded-md shadow-lg z-[1000]"
                                >
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Tìm danh sách phát"
                                        className="w-full p-2 bg-[#3e3e3e] text-white text-sm rounded-t outline-none placeholder-gray-400"
                                    />
                                    <ul className="min-h-[150px] max-h-48 overflow-y-auto divide-y divide-[#3e3e3e]">
                                        {loading ? (
                                            <li className="p-2 text-sm">Đang tải...</li>
                                        ) : error ? (
                                            <li className="p-2 text-sm text-red-400">{error}</li>
                                        ) : filteredPlaylists.length === 0 ? (
                                            <>
                                                <li
                                                    onClick={handleCreatePlaylist}
                                                    className="p-2 hover:bg-[#3e3e3e] cursor-pointer flex items-center text-sm"
                                                >
                                                    <img className='w-3 h-3' src='/icon/Create.png'/>
                                                    <span>Danh sách phát mới</span>
                                                </li>
                                                <li className="p-2 text-sm text-gray-400">Không tìm thấy danh sách phát</li>
                                            </>
                                        ) : (
                                            <>
                                                <li
                                                    onClick={handleCreatePlaylist}
                                                    className="p-2 hover:bg-[#3e3e3e] cursor-pointer flex items-center gap-4 text-sm"
                                                >
                                                    <img className='w-3 h-3' src='/icon/Create.png'/>
                                                    <span>Danh sách phát mới</span>
                                                </li>
                                                {filteredPlaylists.map((playlist) => (
                                                    <li
                                                        key={playlist.id}
                                                        onClick={() => handleAddSongToPlaylist(playlist.id)}
                                                        className="p-2 hover:bg-[#3e3e3e] cursor-pointer text-sm"
                                                    >
                                                        {playlist.name}
                                                    </li>
                                                ))}
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center p-2 hover:bg-neutral-700 rounded py-2 -ml-1 -mr-1">
                            <button aria-label="Collapse" className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 mr-3">
                                <img className='w-2 h-2' src='/icon/Create.png'/>
                            </button>
                            <span>Lưu vào bài hát đã thích của bạn</span>
                        </div>
                        <div className="flex items-center p-2 hover:bg-neutral-700 rounded py-2 -ml-1 -mr-1">
                            <img className="w-5 h-5 mr-3" src="/icon/Queue_XS.png" />
                            <span>Thêm vào hàng đợi</span>
                        </div>
                        <hr/>
                        <div className="flex items-center p-2 hover:bg-neutral-700 rounded py-2 -ml-1 -mr-1"
                            onClick={() => currentSong && currentSong.artists && currentSong.artists.length > 0 && navigate(`/singer/${currentSong.artists[0].id}`)}
                        >
                            <img className="w-5 h-5 mr-3" src="/icon/Artist.png" />
                            <span>Chuyển đến nghệ sĩ</span>
                        </div>
                        <div className="flex items-center p-2 hover:bg-neutral-700 rounded py-2 -ml-1 -mr-1"
                            onClick={() => currentSong && currentSong.album && navigate(`/AlbumDetail/${currentSong.album.id}`)}
                        >
                            <img className="w-5 h-5 mr-3" src="/icon/Album.png" />
                            <span>Chuyển đến album</span>
                        </div>
                    </div>
                )}
                
                <div className="rounded-lg overflow-hidden mb-4 w-full h-[300px]">
                    {song && song.url_video ? (
                        <video
                            ref={videoRef}
                            src={song.url_video}
                            className="object-cover rounded-lg"
                            style={{ aspectRatio: "4/5" }}
                            muted
                            playsInline
                            loop
                            autoPlay
                        />
                    ) : (
                        <img
                            alt="Album cover"
                            className="w-full h-full rounded-lg"
                            src={
                                song && song.image
                                    ? song.image.startsWith('http')
                                        ? song.image
                                        : `/media/${song.image}`
                                    : 'https://i.pinimg.com/736x/3a/1f/d0/3a1fd088e3521120d68c7567bad13f6c.jpg'
                            }
                        />
                    )}
                </div>

                <div className='flex items-center mb-4'>
                    <div className='flex-1'>
                        <h2 className="font-bold text-2xl mb-1 leading-tight hover:text-green-500">
                            {currentSong?.name || "Không có bài hát"}
                        </h2>
                        <p className="text-gray-300 hover:text-green-500 cursor-pointer" onClick={() => song && song.artists && song.artists.length > 0 && navigate(`/singer/${song.artists[0].id}`)}>
                            {currentSong?.artists && currentSong.artists.length > 0 
                            ? currentSong.artists.map(a => a.name).join(',') 
                            : "Không có nghệ sĩ"}
                        </p>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                        <button aria-label="Collapse" className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-gray-300">
                            <img className='w-2 h-2' src='/icon/Create.png'/>
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-800 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-extrabold text-gray-200">
                            Artist
                        </h4>
                        <button className="text-gray-400 font-bold text-sm hover:text-white">
                            Show all
                        </button>
                    </div>
                    <div className='flex items-center'>
                        <div className="">
                            <p className="text-gray-300 font-semibold cursor-pointer" onClick={() => song && song.artists && song.artists.length > 0 && navigate(`/singer/${song.artists[0].id}`)}>
                            {currentSong?.artists && currentSong.artists.length > 0 
                            ? currentSong.artists.map(a => a.name).join(',') 
                            : "Không có nghệ sĩ"}    
                            </p>
                            <p className="text-gray-400 text-sm">
                                Main Artist, Composer
                            </p>
                        </div>
                        <div className='ml-auto justify-center items-center'>
                            <button
                                onClick={handleFollowToggle}
                                className={`text-white text-xs px-6 py-2 ml-2 rounded-full bg-opacity-0 border-[1px] border-neutral-500 hover:border-[1.5px] hover:border-white`}
                            >
                                {isFollowing ? 'Hủy' : 'Theo dõi'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-800 rounded-lg p-3 mb-3" ref={relatedSongsRef}>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-extrabold text-gray-200">
                            Next in queue
                        </h4>
                        <button className="text-gray-400 font-bold text-sm hover:text-white">
                            Open queue
                        </button>
                    </div>

                    {listSongRelated.length === 0 ? (
                        <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '16px', fontSize: '16px' }}>
                            Không có bài hát liên quan
                        </p>
                    ) : (
                        listSongRelated.map(relatedSong => (
                            <div className='flex items-center hover:bg-neutral-700 -ml-2 -mr-2 rounded-lg py-1' key={relatedSong.id} 
                            onClick={() => handleSongClick(relatedSong)}
                            >
                                <div className='mr-2 pl-2'>
                                    <img className='w-12 h-12 rounded-md' src={relatedSong.image} alt={relatedSong.name}  />
                                </div>
                                <div>
                                    <p className="text-gray-300 font-semibold">
                                        {relatedSong.name}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {relatedSong.artists.length > 0 ? relatedSong.artists.map(a => a.name).join(',') : "Unknown Artist"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default MusicBar;