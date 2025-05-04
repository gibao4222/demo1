import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaEllipsisH } from 'react-icons/fa';
import { FiClock } from "react-icons/fi";
import OptionSongAlbum from '../Modals/OptionSongAlbum';
import { createPortal } from 'react-dom';
import { usePlayer } from '../../context/PlayerContext';
import { FaPause } from "react-icons/fa6";
import MenuSub from '../MenuSub';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AlbumSong = ({ tracks, albumData, hoveredTrackId, setHoveredTrackId, onDurationsChange }) => {
    const [durations, setDurations] = useState({});
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [optionPosition, setOptionPosition] = useState({ top: 0, left: 0 });
    const [selectedTrackId, setSelectedTrackId] = useState(null);
    const optionButtonRef = useRef(null);
    const { user } = useAuth();
    const [MenuSubPos, setMenuSubPos] = useState({ x: 0, y: 0 });
    const [showMenuSub, setShowMenuSub] = useState(false);
    const [MenuSubSong, setMenuSubSong] = useState(null);
    const [previewEnded, setPreviewEnded] = useState(false);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const isContextMenuTriggered = useRef(false); 
    const navigate = useNavigate();

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

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
    
    useEffect(() => {
        const fetchDurations = async () => {
            const durationMap = {};
            for (const track of tracks) {
                if (track.id_song.url_song) {
                    try {
                        const audio = new Audio(track.id_song.url_song);
                        await new Promise((resolve) => {
                            audio.addEventListener('loadedmetadata', () => {
                                durationMap[track.id] = audio.duration;
                                resolve();
                            });
                        });
                    } catch (error) {
                        console.error(`Error loading audio for track ${track.id}:`, error);
                        durationMap[track.id] = null;
                    }
                }
            }
            setDurations(durationMap);
            onDurationsChange(durationMap);
        };

        if (tracks.length > 0) {
            fetchDurations();
        }
        const songsArray = tracks.map(item => ({
            ...item.id_song,
        }));
        setCurrentSongList(songsArray);
    }, [tracks, onDurationsChange]);

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

    const handleUpgrade = () => {
        navigate("/payment");
    };

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

    const handleOpenOptionModal = (trackId, songId, event) => {
        event.stopPropagation();
        if (optionButtonRef.current) {
            const rect = optionButtonRef.current.getBoundingClientRect();
            const modalWidth = 250;
            const windowWidth = window.innerWidth;
            const friendActivityWidth = 300;
            const availableWidth = windowWidth - friendActivityWidth;

            let leftPosition = rect.left + window.scrollX;

            if (leftPosition + modalWidth > availableWidth) {
                leftPosition = availableWidth - modalWidth - 10;
            }
            if (leftPosition < 0) {
                leftPosition = 10;
            }

            setOptionPosition({
                top: rect.bottom + window.scrollY - 100,
                left: leftPosition,
            });
        }
        setSelectedTrackId(songId);
        setIsOptionOpen(true);
    };

    const handleCloseOptionModal = () => {
        setIsOptionOpen(false);
        setSelectedTrackId(null);
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
        <div className="max-w-7xl mx-auto rounded-lg select-none">
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

            <div className="mt-4">
                {tracks.length === 0 ? (
                    <p className="text-white">Không có bài hát nào trong album này.</p>
                ) : (
                    <table className="w-full rounded-md text-white text-sm">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] text-sm font-semibold text-gray-400">
                                <th className="py-2 px-4 text-center w-[10%] bg-transparent">#</th>
                                <th className="px-4 py-3 text-left bg-transparent">Tiêu đề</th>
                                <th className="py-2 px-4 text-right w-[10%] bg-transparent">
                                    <div className="flex justify-end">
                                        <FiClock />
                                    </div>
                                </th>
                                <th className="py-2 px-4 text-right w-[10%] bg-transparent"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map((track, index) => (
                                <tr
                                    key={track.id}
                                    className="hover:bg-neutral-800 rounded"
                                    onMouseEnter={() => setHoveredTrackId(track.id)}
                                    onMouseLeave={() => setHoveredTrackId(null)}
                                    onContextMenu={(e) => handleMenuSub(e, track.id_song)}
                                >
                                    <td className="px-4 py-3 w-[10%] text-center">
                                        <div className="flex justify-center items-center h-full">
                                            {hoveredTrackId === track.id ? (
                                                <button 
                                                    onClick={() => handlePlaySong(track.id_song)}
                                                    disabled={track.id_song.is_vip && !user?.vip && previewEnded && currentSong?.id === track.id_song.id}
                                                    className={`${
                                                        track.id_song.is_vip && !user?.vip && previewEnded && currentSong?.id === track.id_song.id
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-200 hover:text-white'
                                                    }`}
                                                >
                                                    {currentSong?.id === track.id_song.id && isPlaying ? (
                                                        <FaPause className="mr-2" />
                                                    ) : (
                                                        <FaPlay className="mr-2" />
                                                    )}
                                                </button>
                                            ) : currentSong?.id === track.id_song.id && isPlaying ? (
                                                <FaPause 
                                                    onClick={() => handlePlaySong(track.id_song)} 
                                                    className="mr-2 text-gray-200" 
                                                />
                                            ) : (
                                                <span className="mr-2">{index + 1}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white leading-tight">
                                                {track.id_song.name}
                                            
                                                {track.id_song.is_vip && (
                                                    <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded">
                                                        PREMIUM
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-white font-semibold flex items-center gap-1 mt-0.5">
                                                <span>{albumData.id_singer.name}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right w-[10%]">
                                        <span className="text-white font-semibold select-none">
                                            {durations[track.id] ? formatTime(durations[track.id]) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center w-[10%]">
                                        <div className="flex justify-center items-center h-full">
                                            {hoveredTrackId === track.id ? (
                                                <div className="flex justify-center items-center h-full relative group">
                                                    <FaEllipsisH
                                                        ref={optionButtonRef}
                                                        onClick={(event) => handleOpenOptionModal(track.id, track.id_song.id, event)}
                                                        className="cursor-pointer"
                                                    />
                                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#3c3c3c] text-white text-base rounded py-1 px-2 whitespace-nowrap">
                                                        Tùy chọn khác
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="w-5 h-5" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {isOptionOpen &&
                createPortal(
                    <OptionSongAlbum
                        onClose={handleCloseOptionModal}
                        position={optionPosition}
                        trackId={selectedTrackId}
                        albumData={albumData}
                    />,
                    document.body
                )}
            <MenuSub
                show={showMenuSub}
                position={MenuSubPos}
                onAddToQueue={handleAddToQueue}
            />
        </div>
    );
};

export default AlbumSong;