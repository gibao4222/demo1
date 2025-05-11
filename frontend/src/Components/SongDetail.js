import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MenuSub from './MenuSub';
import { usePlayer } from '../context/PlayerContext';
import BottomPlayer_ex from './BottomPlayer_ex';

function SongDetail() {
    const { id } = useParams();
    const [song, setSong] = useState(null);
    const [currentLyric, setCurrentLyric] = useState("");
    const [lyrics, setLyrics] = useState([]);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [previewEnded, setPreviewEnded] = useState(false);
    const lyricsContainerRef = useRef(null);
    const lyricElementsRef = useRef([]);
    const { user } = useAuth();
    const scrollAnimationRef = useRef(null);
    const previewTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const [listSongRelated, setListSongRelated] = useState([]);
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [showMenuSub, setShowMenuSub] = useState(false);
    const [MenuSubPos, setMenuSubPos] = useState({ x: 0, y: 0 });
    const [MenuSubSong, setMenuSubSong] = useState(null);
    const [fullscreenElement, setFullscreenElement] = useState(null);
    const relatedSongsRef = useRef(null);
    const isLoadingSongRef = useRef(false);
    const videoRef = useRef(null);

    const {
        song: contextCurrentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        audioRef,
        queue,
        setQueue,
        setCurrentSongList
    } = usePlayer();

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
        if (contextCurrentSong && (!song || contextCurrentSong.id !== song.id)) {
            setSong(contextCurrentSong);
            if (contextCurrentSong.url_lyric) fetchLyrics(contextCurrentSong.url_lyric);
        }
    }, [contextCurrentSong, song]);

    useEffect(() => {
        getRelatedSongs();
        axios.get(`https://localhost/api/songs/songs/${id}/`)
            .then(response => {
                setSong(response.data);
                setCurrentSong(response.data);
                const lyricUrl = response.data.url_lyric === null ? null : response.data.url_lyric;
                if (lyricUrl) fetchLyrics(lyricUrl);
            })
            .catch(error => console.error('Error fetching song details:', error));

        return () => {
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        };
    }, [id, setCurrentSong]);

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
        try {
            const res = await axios.get(`https://localhost/api/songs/related-songs/${id}`);
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
        const lyricUrl = clickedSong.url_lyric === null ? null : clickedSong.url_lyric;
        if (lyricUrl) fetchLyrics(lyricUrl);

        window.scrollTo(0, 0);

        setIsPlaying(true);
        isLoadingSongRef.current = false;
    };

    const toggleFullScreen = () => {
        const element = user.vip && song.url_video
            ? document.querySelector('.video-container')
            : document.querySelector('.image-container');

        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setFullscreenElement(element);
        } else {
            document.exitFullscreen();
            setFullscreenElement(null);
        }
    };

    const handleMenuSub = (e, relatedSong) => {
        e.preventDefault();
        setMenuSubSong(relatedSong);
        setMenuSubPos({ x: e.clientX, y: e.clientY });
        setShowMenuSub(true);
    };

    const handleAddToQueue = () => {
        if (MenuSubSong && !queue.find(s => s.id === MenuSubSong.id)) {
            setQueue([...queue, MenuSubSong]);
        }
        setShowMenuSub(false);
    };

    const fetchLyrics = async (url) => {
        try {
            const response = await axios.get(url, { responseType: "text" });
            setLyrics(parseLyrics(response.data));
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            setLyrics([]);
        }
    };

    const handleUpgrade = () => {
        navigate('/payment');
    };

    const parseLyrics = (rawLyrics) => {
        if (!rawLyrics) return [];

        const lines = rawLyrics.split('\n');
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const timeMatch = lines[i].match(/(\d+):(\d+):(\d+),(\d+)/);
            if (timeMatch && lines[i + 1]) {
                const hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const seconds = parseInt(timeMatch[3]);
                const milliseconds = parseInt(timeMatch[4]);
                const totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

                result.push({
                    time: totalSeconds,
                    text: lines[i + 1].trim()
                });
                i++;
            }
        }

        return result;
    };

    const handlePlayPause = () => {
        if (!user?.vip && song?.is_vip && previewEnded) {
            setShowUpgradePrompt(true);
            return;
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (lyrics.length > 0) {
                const currentTime = audio.currentTime;
                let currentLyricObj = null;

                for (let i = lyrics.length - 1; i >= 0; i--) {
                    if (lyrics[i].time <= currentTime) {
                        currentLyricObj = lyrics[i];
                        break;
                    }
                }

                setCurrentLyric(currentLyricObj?.text || "");
            }

            if (!user?.vip && song?.is_vip && audio.currentTime >= 10 && isPlaying) {
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
    }, [lyrics, isPlaying, user?.vip, song?.is_vip, audioRef]);

    useEffect(() => {
        if (currentLyric && lyricElementsRef.current.length > 0) {
            const activeIndex = lyrics.findIndex(l => l.text === currentLyric);
            if (activeIndex >= 0 && lyricElementsRef.current[activeIndex]) {
                smoothScrollToLyric(lyricElementsRef.current[activeIndex]);
            }
        }
    }, [currentLyric, lyrics]);

    const smoothScrollToLyric = (element) => {
        if (!element || !lyricsContainerRef.current) return;

        const container = lyricsContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        const targetScrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 100;

        if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
        }

        const animateScroll = () => {
            const currentScrollTop = container.scrollTop;
            const distance = targetScrollTop - currentScrollTop;

            if (Math.abs(distance) < 1) {
                container.scrollTop = targetScrollTop;
                return;
            }

            container.scrollTop = currentScrollTop + distance * 0.2;
            scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        };

        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    };

    useEffect(() => {
        const handleClickOutside = () => setShowMenuSub(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (!song) return <div className="text-white text-center py-8">Loading song...</div>;
    if (!user) return <div className="text-white text-center py-8">Loading user...</div>;

    return (
        <div className="mb-10 bg-neutral-900 text-white min-h-screen flex flex-col md:flex-row rounded-lg overflow-hidden" style={{ paddingBottom: '400px', zIndex: 20 }}>
            <style>
                {`
                    .related-songs {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.5s ease, transform 0.5s ease;
                    }
                    .related-songs.visible {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .song-header {
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        position: relative;
                    }
                    .song-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%);
                    }
                `}
            </style>

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

            <div className="p-4 w-full md:w-3/3">
                <div
                    className="song-header flex flex-col md:flex-row items-center p-4 md:p-6 sticky top-0 z-10"
                    style={{
                        backgroundImage: `url(${song?.image
                            ? song.image.startsWith("http")
                                ? song.image
                                : `/media/${song.image}`
                            : "https://i.pinimg.com/736x/3a/1f/d0/3a1fd088e3521120d68c7567bad13f6c.jpg"})`
                    }}
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center w-full">
                        <img
                            src={song?.image
                                ? song.image.startsWith("http")
                                    ? song.image
                                    : `/media/${song.image}`
                                : "https://i.pinimg.com/736x/3a/1f/d0/3a1fd088e3521120d68c7567bad13f6c.jpg"}
                            alt={song.name}
                            className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-md"
                        />
                        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                            <h1 className="text-xl md:text-2xl font-bold line-clamp-2">{song.name}</h1>
                            <p className="text-gray-400 text-sm">{song.artists.length > 0 ? song.artists.map(a => a.name).join(',') : "Unknown Artist"}</p>
                            {song.is_vip && (
                                <span className="inline-block mr-6 mt-1 px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-bold rounded">
                                    PREMIUM
                                </span>
                            )}
                            <button
                                onClick={handlePlayPause}
                                className={`mt-3 px-6 py-1 rounded-full text-sm font-bold ${!user.vip && song.is_vip && previewEnded
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                disabled={!user.vip && song.is_vip && previewEnded}
                            >
                                {isPlaying ? "PAUSE" : "PLAY"}
                            </button>
                            {!user.vip && song.is_vip && (
                                <p className="text-xs text-gray-400 mt-1">
                                    {previewEnded ? 'Bạn đã nghe hết 10 giây preview' : 'Đang phát bản preview 10 giây'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div
                        ref={lyricsContainerRef}
                        className="lyrics-container h-[calc(100vh-250px)] overflow-y-auto p-4"
                    >
                        {lyrics.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Bài hát này chưa có lời</p>
                        ) : (
                            lyrics.map((line, index) => (
                                <p
                                    key={index}
                                    ref={el => lyricElementsRef.current[index] = el}
                                    className={`my-4 py-2 px-3 rounded transition-all duration-300 ${currentLyric === line.text
                                        ? 'active-lyric bg-gray-800 text-green-400 text-lg font-bold border-l-4 border-green-500'
                                        : 'text-gray-400 hover:bg-gray-800/50'
                                        }`}
                                >
                                    {line.text}
                                </p>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Bài hát cùng ca sĩ</h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '300px' }}>
                        <ul ref={relatedSongsRef} className="related-songs">
                            {listSongRelated.length === 0 ? (
                                <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '16px', fontSize: '16px' }}>
                                    Không có bài hát liên quan
                                </p>
                            ) : (
                                listSongRelated.map(relatedSong => (
                                    <li
                                        key={relatedSong.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            backgroundColor: selectedSongId === relatedSong.id ? '#374151' : 'transparent'
                                        }}
                                        onClick={() => handleSongClick(relatedSong)}
                                        onContextMenu={(e) => handleMenuSub(e, relatedSong)}
                                    >
                                        <img
                                            src={relatedSong.image}
                                            alt={relatedSong.name}
                                            style={{
                                                height: '40px',
                                                width: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                marginRight: '16px'
                                            }}
                                        />
                                        <div>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: song?.id === relatedSong.id ? '#10B981' : '#FFFFFF'
                                            }}>
                                                {relatedSong.name}
                                            </h3>
                                        </div>
                                        <span style={{
                                            marginLeft: 'auto',
                                            fontSize: '14px',
                                            color: song?.id === relatedSong.id ? '#6EE7B7' : '#9CA3AF'
                                        }}>
                                            {relatedSong.artists.length > 0 ? relatedSong.artists.map(a => a.name).join(',') : "Unknown Artist"}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* <div className="w-full md:w-1/3  sticky top-0" style={{ height: "calc(150vh - 200px)" }}>
                {user.vip && song.url_video ? (
                    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                        <div className="relative w-full h-full">
                            <video
                                ref={videoRef}
                                src={song.url_video}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                style={{ aspectRatio: "16/9" }}
                                muted
                                playsInline
                                loop
                                autoPlay
                            />
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                        <img
                            src={
                                song?.image
                                    ? song.image.startsWith("http")
                                        ? song.image
                                        : `/media/${song.image}`
                                    : "https://i.pinimg.com/736x/3a/1f/d0/3a1fd088e3521120d68c7567bad13f6c.jpg"
                            }
                            alt={song.name}
                            className="w-full h-full object-cover rounded-lg"
                            style={{ aspectRatio: "1/1" }}
                        />
                    </div>
                )}
            </div> */}

            <MenuSub
                show={showMenuSub}
                position={MenuSubPos}
                onAddToQueue={handleAddToQueue}
            />
        </div>
    );
}

export default SongDetail;