import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { FiClock } from "react-icons/fi";
import { RiDeleteBin6Line } from 'react-icons/ri';
import { getSongPlaylist, getSongById, deleteSongFromPlaylist } from '../../Services/PlaylistService';
import { usePlayer } from '../../context/PlayerContext';
import { FaPause } from "react-icons/fa6";
import MenuSub from '../MenuSub';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 

const PlaylistSong = ({ playlist, token, refreshSongs, playAllTrigger, onPlayAllComplete }) => {

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredSongId, setHoveredSongId] = useState(null);
    const [durations, setDurations] = useState({});
    const [MenuSubPos, setMenuSubPos] = useState({ x: 0, y: 0 });
    const [showMenuSub, setShowMenuSub] = useState(false);
    const [MenuSubSong, setMenuSubSong] = useState(null);
    const isContextMenuTriggered = useRef(false); 
    

    const [previewEnded, setPreviewEnded] = useState(false);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const { user } = useAuth(); 
    const navigate = useNavigate(); 

    const {
        song: currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        audioRef,
        queue,
        setQueue,
        setCurrentSongList
    } = usePlayer();
    // Hàm định dạng thời gian
    const formatTime = (time) => {
        if (!time) return 'N/A';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        if (playAllTrigger && songs.length > 0) {
          handlePlayAll();
          onPlayAllComplete(); 
        }
      }, [playAllTrigger, songs]);


    // Hàm tính khoảng thời gian tương đối
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Không rõ';// Kiểm tra ngày không hợp lệ

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Không rõ';

            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            // Nếu thời gian âm (tương lai), trả về "Vừa xong"
            if (diffInSeconds < 0) return 'Vừa xong';
            // Dưới 60 giây: hiển thị giây (0-59 giây)
            if (diffInSeconds < 60) {
                return diffInSeconds === 0 ? 'Vừa xong' : `${diffInSeconds} giây trước`;
            }
              // Dưới 60 phút: hiển thị phút (1-59 phút)
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return `${diffInMinutes} phút trước`;
            }
              // Dưới 24 giờ: hiển thị giờ (1-23 giờ)
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return `${diffInHours} giờ trước`;
            }
             // Từ 24 giờ trở lên: hiển thị số ngày
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 30) {
                return `${diffInDays} ngày trước`;
            }
             // Dưới 12 tháng: hiển thị số tháng
            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) {
                return `${diffInMonths} tháng trước`;
            }
               // Từ 12 tháng trở lên: hiển thị số năm
            const diffInYears = Math.floor(diffInMonths / 12);
            return `${diffInYears} năm trước`;
        } catch (error) {
            console.error(`Lỗi định dạng thời gian ${dateString}:`, error);
            return 'Không rõ';
        }
    };

    
    const handlePlaySong = (song) => {
        if (currentSong && currentSong.id === song.id) {
            setIsPlaying(!isPlaying);
            return;
        }
        
     
        if (song.is_vip && !user?.vip) {
            setCurrentSong(song);
            setPreviewEnded(false); 
            setShowUpgradePrompt(false);
        } else {
            setCurrentSong(song);
        }
    
        setIsPlaying(true);
    };

    const handlePlayAll = () => {
        if (currentSong && songs.some(song => song.id === currentSong.id)) {
            setIsPlaying(!isPlaying);
            return;
        }
        if (songs.length === 0) return;
        setCurrentSongList(songs);
        
        setCurrentSong(songs[0]);
        setQueue([]);
        setIsPlaying(true);
    };

    const handleUpgrade = () => {
        navigate("/payment");
    };

    const fetchSongs = async () => {
        if (!playlist?.id || !token) {
            console.error('Thiếu ID playlist hoặc token:', { playlistId: playlist?.id, token });
            setError('Không có thông tin playlist hoặc token.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const playlistSongs = await getSongPlaylist(playlist.id, token);
            console.log('Danh sách bài hát từ API:', playlistSongs);

            if (!Array.isArray(playlistSongs)) {
                console.error('Dữ liệu bài hát không phải mảng:', playlistSongs);
                setError('Dữ liệu bài hát không hợp lệ.');
                setLoading(false);
                return;
            }

            if (playlistSongs.length === 0) {
                console.log('Không tìm thấy bài hát cho playlist ID:', playlist.id);
                setSongs([]);
                setLoading(false);
                return;
            }

            const uniqueSongs = Array.from(new Map(playlistSongs.map(item => [item.id_song, item])).values());

            const songDetailsPromises = uniqueSongs.map(async (item) => {
                try {
                    const song = await getSongById(item.id_song, token);
                    console.log(`Lấy thông tin bài hát id_song ${item.id_song}:`, song);
         
                    return {
                        playlistSongId: item.id,
                        id: song.id,
                        title: song.name || 'Không rõ',
                        album: song.album?.name || 'Không rõ',
                        artist: song.artists.length > 0 ? song.artists.map(a => a.name).join('-') : 'Không rõ',
                        duration: song.duration || '--:--',
                        image: song.image || '/img/null.png',
                        dateAdded: formatRelativeTime(item.date_added),
                        file_audio: song.file_audio,
                        url_song: song.url_song,
                        is_vip: song.is_vip || false,
                        url_video: song?.url_video
                    };
                } catch (songError) {
                    console.error(`Lỗi khi lấy thông tin bài hát id_song ${item.id_song}:`, songError);
                    return null;
                }
            });

            const fullSongs = (await Promise.all(songDetailsPromises)).filter(song => song !== null);
            console.log('Danh sách bài hát đã xử lý:', fullSongs);
            setSongs(fullSongs);
            setCurrentSongList(fullSongs);

            if (fullSongs.length === 0) {
                setError('Không thể tải chi tiết bài hát. Vui lòng thử lại.');
            }

            const durationMap = {};
            for (const song of fullSongs) {
                if (song.file_audio) {
                    try {
                        const audio = new Audio(song.file_audio);
                        await new Promise((resolve) => {
                            audio.addEventListener('loadedmetadata', () => {
                                durationMap[song.id] = audio.duration;
                                resolve();
                            });
                            audio.addEventListener('error', () => {
                                console.error(`Lỗi tải metadata cho bài hát ${song.id}`);
                                durationMap[song.id] = null;
                                resolve();
                            });
                        });
                    } catch (error) {
                        console.error(`Lỗi tải audio cho bài hát ${song.id}:`, error);
                        durationMap[song.id] = null;
                    }
                } else {
                    durationMap[song.id] = null;
                }
            }
            setDurations(durationMap);

        } catch (error) {
            console.error('Lỗi khi tải danh sách bài hát:', error);
            setError('Không thể tải danh sách bài hát. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        const handleTimeUpdate = () => {
    
            if (currentSong.is_vip && !user?.vip && audio.currentTime >= 10 && isPlaying) {
                audio.pause();
                setPreviewEnded(true); 
                setShowUpgradePrompt(true); 
                setIsPlaying(false); 
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [currentSong, isPlaying, user?.vip, audioRef]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;

        if (audio.src !== currentSong.url_song) {
            audio.src = currentSong.url_song;
            if (isPlaying) {
                audio.play().catch(error => console.error("Error playing audio:", error));
            }
        } else if (isPlaying && audio.paused) {
            audio.play().catch(error => console.error("Error playing audio:", error));
        } else if (!isPlaying && !audio.paused) {
            audio.pause();
        }
    }, [currentSong, isPlaying, audioRef]);

    const handleMenuSub = (e, song) => {
        e.preventDefault();
      
        const menuWidth = 150;
        const menuHeight = 50;
        const maxX = window.innerWidth - menuWidth;
        const maxY = window.innerHeight - menuHeight;
        const adjustedX = Math.min(e.clientX, maxX);
        const adjustedY = Math.min(e.clientY, maxY);
        setMenuSubSong(song);
        setMenuSubPos({ x: adjustedX, y: adjustedY });
        setShowMenuSub(true);
        isContextMenuTriggered.current = true; 
    };

    const handleAddToQueue = () => {
      if (MenuSubSong && !queue.find(s => s.id === MenuSubSong.id)) {
        setQueue([...queue, MenuSubSong]);
      }
      setShowMenuSub(false);
    };

    useEffect(() => {
        console.log('PlaylistSong useEffect - playlist.id:', playlist?.id, 'refreshSongs:', refreshSongs);
        fetchSongs();
    }, [playlist?.id, token, refreshSongs]);

    useEffect(() => {
        const handleSongsUpdated = () => {
            fetchSongs();
        };

        window.addEventListener('songsUpdated', handleSongsUpdated);

        return () => {
            window.removeEventListener('songsUpdated', handleSongsUpdated);
        };
    }, []);

    const handleDeleteSong = async (playlistSongId) => {
        if (!playlistSongId || !token) {
            console.error('Thiếu playlistSongId hoặc token:', { playlistSongId, token });
            setError('Không thể xóa bài hát: thiếu thông tin.');
            alert('Không thể xóa bài hát: thiếu thông tin.');
            return;
        }

        try {
            await deleteSongFromPlaylist(playlistSongId, token);
            console.log(`Xóa bài hát với playlistSongId ${playlistSongId} thành công`);
            alert('Đã xóa bài hát khỏi playlist!');
            await fetchSongs();
        } catch (error) {
            console.error(`Lỗi khi xóa bài hát với playlistSongId ${playlistSongId}:`, error);
            setError('Không thể xóa bài hát. Vui lòng thử lại.');
            alert('Không thể xóa bài hát. Vui lòng thử lại.');
        }
    };
      useEffect(() => {
            const handleClickOutside = (e) => {
                if (e.button === 0 && !isContextMenuTriggered.current) {
                    setShowMenuSub(false);
                }
             
                if (isContextMenuTriggered.current) {
                    setTimeout(() => {
                        isContextMenuTriggered.current = false;
                    }, 100);
                }
            };
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, []);

    return (
        <div className="mt-8 pl-6 pr-6">
      
            {showUpgradePrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
                        <h2 className="text-2xl font-bold mb-6 text-green-400">NÂNG CẤP PREMIUM</h2>
                        <div className="mb-6">
                            <p className="text-lg mb-2">Theo yêu cầu của đơn vị sở hữu bản quyền,</p>
                            <p className="text-lg">bạn cần tài khoản PREMIUM để nghe trọn vẹn bài hát này</p>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <button
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg"
                                onClick={handleUpgrade}
                            >
                                NÂNG CẤP NGAY
                            </button>
                            <button
                                className="px-6 py-2 text-gray-300 hover:text-white"
                                onClick={() => setShowUpgradePrompt(false)}
                            >
                                Để sau
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : songs.length === 0 ? (
                <p className="text-gray-400">Không có bài hát nào trong danh sách phát này.</p>
            ) : (
                <table className="w-full text-sm text-gray-200">
                    <thead>
                        <tr className="text-gray-400 border-b border-neutral-700 bg-transparent">
                            <th className="py-2 px-2 text-left w-[5%] bg-transparent">#</th>
                            <th className="py-2 px-2 text-left w-[35%] bg-transparent">Tiêu đề</th>
                            <th className="py-2 px-2 text-left w-[25%] bg-transparent">Album</th>
                            <th className="py-2 px-2 text-left w-[15%] bg-transparent">Ngày thêm</th>
                            <th className="py-2 px-2 text-right w-[10%] bg-transparent">
                                <div className="flex justify-end">
                                    <FiClock />
                                </div>
                            </th>
                            <th className="py-2 px-2 text-center w-[10%] bg-transparent"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map((song, index) => (
                            <tr
                                key={song.id}
                                className="hover:bg-neutral-800 rounded cursor-pointer"
                                onMouseEnter={() => setHoveredSongId(song.id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                                onContextMenu={(e) => handleMenuSub(e, song)}
                            >
                                <td className="py-3 px-2">
                                    <div className="flex items-center">
                                        {currentSong?.id === song.id && isPlaying ? (
                                            <FaPause 
                                                onClick={() => handlePlaySong(song)} 
                                                className={`mr-2 text-gray-200 cursor-pointer hover:text-white ${
                                                    song.is_vip && !user?.vip && previewEnded ? 'text-gray-400 cursor-not-allowed' : ''
                                                }`}
                                                disabled={song.is_vip && !user?.vip && previewEnded}
                                            />
                                        ) : hoveredSongId === song.id ? (
                                            <FaPlay 
                                                onClick={() => handlePlaySong(song)} 
                                                className={`mr-2 text-gray-200 cursor-pointer hover:text-white ${
                                                    song.is_vip && !user?.vip && previewEnded ? 'text-gray-400 cursor-not-allowed' : ''
                                                }`}
                                                disabled={song.is_vip && !user?.vip && previewEnded}
                                            />
                                        ) : (
                                            <span className="mr-2">{index + 1}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center">
                                        <img src={song.image} alt={song.title} className="w-10 h-10 rounded mr-3" />
                                        <div>
                                            <p className="text-white font-medium">
                                                {song.title}
                                            
                                              
                                             
                                                {song.is_vip && (
                                                    <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded">
                                                        PREMIUM
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-gray-400 text-xs">{song.artist}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2">{song.album}</td>
                                <td className="py-3 px-2">{song.dateAdded}</td>
                                <td className="py-3 px-2 text-right">
                                    <span className="text-white font-semibold select-none">
                                        {durations[song.id] ? formatTime(durations[song.id]) : 'N/A'}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        {hoveredSongId === song.id && (
                                            <RiDeleteBin6Line
                                                className="text-gray-200 cursor-pointer hover:text-white"
                                                onClick={() => {
                                                  
                                                    handleDeleteSong(song.playlistSongId);
                                                }}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <MenuSub
                show={showMenuSub}
                position={MenuSubPos}
                onAddToQueue={handleAddToQueue}
            />
        </div>
    );
};

export default PlaylistSong;