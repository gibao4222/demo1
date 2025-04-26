import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BottomPlayer_ex from './BottomPlayer_ex';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SongDetail() {
    const { id } = useParams();
    const [song, setSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLyric, setCurrentLyric] = useState("");
    const [lyrics, setLyrics] = useState([]);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [previewEnded, setPreviewEnded] = useState(false);
    const audioRef = useRef(null);
    const lyricsContainerRef = useRef(null);
    const lyricElementsRef = useRef([]);
    const { user } = useAuth();
    const scrollAnimationRef = useRef(null);
    const previewTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const [listSongRelated, setListSongRelated] = useState([]);
    // const [currentPlaylist, setCurrentPlaylist] = useState([]);
    const [selectedSongId, setSelectedSongId] = useState(null);
    useEffect(() => {
        getRelatedSongs();
        axios.get(`https://localhost/api/songs/songs/${id}/`)
            .then(response => {
                setSong(response.data);
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
        };
    }, [id]);

    useEffect(()=>{
        if (song) fetchLyrics(song.url_lyric)
    },[song])
    
    // useEffect(() => {
    //     if (song && listSongRelated.length > 0) {
    //         setCurrentPlaylist([song, ...listSongRelated]);
    //     }
    // }, [song, listSongRelated]);

    const getRelatedSongs = async () => {
        try {
            const res = await axios.get(`https://localhost/api/songs/related-songs/${id}`);
            setListSongRelated(res.data);
        } catch (e) {
            console.error(e);
        }
    }

    const handleSongClick = (clickedSong) => {
        setSong(clickedSong);
        setIsPlaying(true);
        setSelectedSongId(clickedSong.id);
        setPreviewEnded(false);
       
      fetchLyrics(clickedSong.url_lyric)
        
        window.scrollTo(0, 0); 
    }

    const fetchLyrics = async (url) => {
        try {
            const response = await axios.get(url, { responseType: "text" });
            setLyrics(parseLyrics(response.data));
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            setLyrics("");
        }
    };

    const handleUpgrade = () => {
        navigate('/payment');
    }

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
    }, [lyrics, isPlaying, user?.vip, song?.is_vip]);

    useEffect(() => {
        if (!audioRef.current || !song) return;

        if (isPlaying) {
            if (!user?.vip && song?.is_vip) {
                setPreviewEnded(false);
                audioRef.current.currentTime = 0;
            }
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, song, user?.vip]);

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
        if (currentLyric && lyricElementsRef.current.length > 0) {
            const activeIndex = lyrics.findIndex(l => l.text === currentLyric);
            if (activeIndex >= 0 && lyricElementsRef.current[activeIndex]) {
                smoothScrollToLyric(lyricElementsRef.current[activeIndex]);
            }
        }
    }, [currentLyric, lyrics]);

    if (!song) return <div className="text-white text-center py-8">Loading song...</div>;
    if (!user) return <div className="text-white text-center py-8">Loading user...</div>;

    return (
        <div className="mb-10 bg-gray-900 text-white min-h-screen flex flex-col md:flex-row pb-24">
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
                                onClick={() => {
                                    handleUpgrade();
                                }}
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

            <div className="p-4 w-full md:w-2/3">
                <div className="flex flex-col md:flex-row items-center p-4 md:p-6 sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm">
                    <img 
                        src={song.image} 
                        alt={song.name} 
                        className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-md"
                    />
                    <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-bold line-clamp-1">{song.name}</h1>
                        <p className="text-gray-400 text-sm">{song.artists.length >0 ? song.artists.map(a=>a.name).join(','):"Unknown Artist"}</p>
                        {song.is_vip && (
                            <span className="inline-block mr-6 mt-1 px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-bold rounded">
                                PREMIUM
                            </span>
                        )}
                        <button
                            onClick={handlePlayPause}
                            className={`mt-3 px-6 py-1 rounded-full text-sm font-bold ${
                                !user.vip && song.is_vip && previewEnded
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
                                    className={`my-4 py-2 px-3 rounded transition-all duration-300 ${
                                        currentLyric === line.text
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
    <ul>
        {listSongRelated?.map(relatedSong => (
            <li 
                key={relatedSong.id} 
                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedSongId === relatedSong.id 
                        ? 'bg-gray-700 text-green-400' 
                        : 'hover:bg-gray-800'
                }`}
                onClick={() => handleSongClick(relatedSong)}
            >
                <img src={relatedSong.image} alt={relatedSong.name} className="h-10 w-10 object-cover rounded-md mr-4" />
                <div>
                    <h3 className={`text-lg font-semibold ${
                        song?.id === relatedSong.id ? 'text-green-400' : 'text-white'
                    }`}>
                        {relatedSong.name}
                    </h3>
                </div>
                <span className={`ml-auto text-sm ${
                    song?.id === relatedSong.id ? 'text-green-300' : 'text-gray-400'
                }`}>
                    {relatedSong.artists.length >0 ? relatedSong.artists.map(a=>a.name).join(','):"Unknown Artist" }
                </span>
            </li>
        ))}
    </ul>
</div>
                <audio ref={audioRef} src={song.url_song} />
            </div>

            <div className="w-full md:w-1/3 p-4 sticky top-0 h-screen overflow-hidden">
                {user.vip && song.url_video ? (
                    <video
                        src={song.url_video}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                        autoPlay
                        loop
                    />
                ) : (
                    <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-full object-cover rounded-lg"
                    />
                )}
            </div>

            {song && (
                <BottomPlayer_ex
                    song={song}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    audioRef={audioRef}
                    songList={listSongRelated}
                    setCurrentSong={setSong}
                />
            )}
        </div>
    );
}

export default SongDetail;