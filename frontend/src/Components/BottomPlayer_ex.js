import React, { useState, useRef, useEffect } from "react";
import { LuRepeat, LuRepeat1 } from "react-icons/lu";
import { IoShuffle } from "react-icons/io5";
import { usePlayer } from "../context/PlayerContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import FullScreenMedia from "./FullScreenPlayer";
import { Minimize2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
function BottomPlayer_ex() {
    const { 
        song: currentSong, 
        isPlaying, 
        setIsPlaying, 
        audioRef, 
        songList: currentSongList,
        setCurrentSong,
        queue,
        setQueue
    } = usePlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isVolume, setIsVolume] = useState(1);
    const [volumeTemp, setVolumeTemp] = useState(0);
    const [repeatMode, setRepeatMode] = useState("off");
    const [isShuffle, setIsShuffle] = useState(false);
    const [shuffledList, setShuffledList] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const song = currentSong || {};
    const songList = currentSongList || [];
    const [showQueuePopup, setShowQueuePopup] = useState(false);
    const [show, setShow] = useState(false);
    const isChanging = useRef(false);
    const updateSongHistory = async (songId) => {
        try {
          
            await axios.post("https://localhost/api/histories/add-history/", {
                id_song: songId,
                id_user: user.user_id
            });
        } catch (error) {
            console.error("Error when update history:", error);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !song.id || !song.url_song) return;

        if (audio.src !== song.url_song) {
            audio.src = song.url_song;
            audio.load(); 
            const playPromise = new Promise((resolve) => {
                const onCanPlay = () => {
                    audio.removeEventListener('canplay', onCanPlay);
                    resolve();
                };
                audio.addEventListener('canplay', onCanPlay);
            });

            playPromise.then(() => {
                if (isPlaying) {
                    audio.play().catch(error => console.error("Error playing audio:", error));
                }
            });
        } else if (isPlaying && audio.paused) {
            audio.play().catch(error => console.error("Error playing audio:", error));
        } else if (!isPlaying && !audio.paused) {
            audio.pause();
        }

        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            if (queue?.length > 0) {
                const nextSong = queue[0];
                setCurrentSong(nextSong);
                setQueue(preQueue => preQueue.slice(1));
                setIsPlaying(true);
            } else {
                const currentIndex = (isShuffle ? shuffledList : songList).findIndex(s => s.id === song.id);
                const nextList = isShuffle ? shuffledList : songList;
                if(isShuffle&&nextList.length>0&&repeatMode !== "all" ){
                    const nextIndex = (currentIndex + 1) % nextList.length;
                    setCurrentSong(nextList[nextIndex]);
                    setIsPlaying(true);
                }
           
                else if (repeatMode === "one") {
                    audio.currentTime = 0;
                    audio.play().catch(error => console.error("Error playing audio:", error));
                    setIsPlaying(true);
                } else if (repeatMode === "all" && nextList.length > 0) {
                    const nextIndex = (currentIndex + 1) % nextList.length;
                    setCurrentSong(nextList[nextIndex]);
                    setIsPlaying(true);
                } else {
                    const nextIndex = (currentIndex + 1) % nextList.length;
                    setCurrentSong(currentSongList[currentIndex + 1]);
                    setIsPlaying(true);
                }
            
            }
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [song.id, song.url_song, isPlaying, audioRef, queue, setQueue, setCurrentSong, repeatMode, isShuffle, shuffledList, songList]);

    useEffect(() => {
        if (song && song.id) {
            updateSongHistory(song.id);
        }
    }, [song?.id]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume / 100;
    }, [volume, audioRef]);

    const togglePlay = () => {
        if (!audioRef.current || !song.id || !song.url_song) {
            console.log("Không thể phát");
            return;
        }
        setIsPlaying(!isPlaying); 
    };

    const toggleRepeat = () => {
        if (repeatMode === "off") {
            setRepeatMode("one");
        } else if (repeatMode === "one") {
            setRepeatMode("all");
        } else {
            setRepeatMode("off");
        }
    };

    const toggleShuffle = () => {
        if (isShuffle) {
            setIsShuffle(false);
        } else {
            const newList = [...songList];
            for (let i = newList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newList[i], newList[j]] = [newList[j], newList[i]];
            }

            setShuffledList(newList);
            setIsShuffle(true);
        }
    };

    const handleNext = () => {
        if (queue?.length > 0) {
            const nextSong = queue[0];
            setCurrentSong(nextSong);
            setQueue(queue.slice(1));
            setIsPlaying(true);
        } else {
            const currentIndex = (isShuffle ? shuffledList : songList).findIndex(s => s.id === song.id);
            if (currentIndex === -1) return;
            const nextIndex = (currentIndex + 1) % (isShuffle ? shuffledList : songList).length;
            setCurrentSong((isShuffle ? shuffledList : songList)[nextIndex]);
            setIsPlaying(true);
        }
    };

    const handlePrev = () => {
        const currentIndex = (isShuffle ? shuffledList : songList).findIndex(s => s.id === song.id);
        if (currentIndex === -1) return;
        const prevIndex = (currentIndex - 1 + (isShuffle ? shuffledList : songList).length) % (isShuffle ? shuffledList : songList).length;
        setCurrentSong((isShuffle ? shuffledList : songList)[prevIndex]);
        setIsPlaying(true);
    };

   
    const handelFullScreen = () => {
        if (!audioRef.current || !song.id || !song.url_song) {
            console.log("Không thể phát");
            return;
        }
        else{
            if (show === false) {
                setShow(true);
                navigate('/fullscreen');
              } else {
                setShow(false);
                navigate(-1); // Quay lại trang trước
              }
        }
       
      };
      
  useEffect(() => {
    // Chạy khi show thay đổi
    if (!isChanging.current) return;

    // Hiển thị thông báo sau khi show đã thay đổi
    alert("Toggle: " + show); // Hoặc console.log

    isChanging.current = false; // Đánh dấu đã xong
  }, [show]);

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const seekTime = (e.target.value / 100) * duration;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value, 10);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
        newVolume === 0 ? setIsVolume(0) : setIsVolume(1);
    };

    const handleTurnChange = () => {
        if (isVolume === 1) {
            setVolumeTemp(volume);
            setVolume(0);
            setIsVolume(0);
        } else {
            setVolume(volumeTemp);
            setIsVolume(1);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            const queueButton = document.querySelector('button[onClick*="setShowQueue"]');
            const queuePopup = document.querySelector('.fixed.bottom-20.right-4.w-80');
            
            if (queuePopup && queueButton && 
                !queuePopup.contains(event.target) && 
                !queueButton.contains(event.target)) {
                setShowQueuePopup(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        
        
        <div className="fixed bottom-0 left-0 right-0 bg-black p-2 flex items-center justify-between overflow-hidden" style={{ minWidth: '100vw' }}>
     
            <div className="flex items-center" style={{ width: '25%', minWidth: '200px', maxWidth: '300px' }}>
                <img 
                    alt="" 
                    className="mr-4 rounded" 
                    height="60" 
                    src={song?.image 
      ? song.image.startsWith("http")
        ? song.image 
        : `/media/${song.image}`
      : "https://i.pinimg.com/736x/3a/1f/d0/3a1fd088e3521120d68c7567bad13f6c.jpg"}
                    width="60" 
                />
                <div style={{ overflow: 'hidden' }}>
                    <h3 className="font-bold mb-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.name || ""}
                    </h3>
                    <h6>
                    {/* {song.artists.length > 0 ? song.artists.map(a => a.name).join(',') : "Unknown Artist"} */}
                    </h6>
                </div>
            </div>

            <div className="flex flex-col items-center" style={{ flex: 1, maxWidth: '600px' }}>
                <div className="flex items-center">
                    <button className="mr-4" onClick={toggleShuffle}>
                        <IoShuffle className={isShuffle ? "text-green-500 w-6 h-6" : "text-gray-400 w-6 h-6"} />
                    </button>

                    <button onClick={() => handlePrev()} className="mr-4">
                        <img className="w-6 h-6" alt="Previous" src="/icon/Component2.png" />
                    </button>
                    <button className="mr-4" onClick={togglePlay}>
                        <img
                            alt={isPlaying ? "Pause" : "Play"}
                            src={isPlaying ? "/icon/Component1.png" : "/icon/play.png"}
                            className="w-10 h-10"
                        />
                    </button>
                    <button onClick={() => handleNext()} className="mr-4">
                        <img className="w-6 h-6" alt="Next" src="/icon/Component3.png" />
                    </button>
                    <button onClick={toggleRepeat}>
                        {repeatMode === "off" && <LuRepeat className="text-gray-400 w-5 h-5" />}
                        {repeatMode === "one" && <LuRepeat1 className="text-green-500 w-5 h-5" />}
                        {repeatMode === "all" && <LuRepeat className="text-green-500 w-5 h-5" />}
                    </button>
                </div>
                <div className="flex items-center">
                    <span className="mr-2">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        className="w-96 h-1 bg-gray-700 rounded-full overflow-hidden"
                        min="0"
                        max="100"
                        value={duration > 0 ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                    />
                    <span className="ml-2">{formatTime(duration)}</span>
                </div>
            </div>


            <div className="flex items-center" style={{ width: '25%', minWidth: '200px', justifyContent: 'flex-end' }}>
                <div className="flex items-center">
                    <button id="queueBtn"  onClick={() => setShowQueuePopup(!showQueuePopup)} className="mr-1">
                        <img alt="Queue" src="/icon/Queue_XS.png" className="w-6 h-6" />
                       
                    </button>
                    <button className="mr-1">
                        <img alt="Devices" src="/icon/Devices_XS.png" className="w-6 h-6"/>
                    </button>
                    <button className="mr-1 w-5 h-5">
                        <img onClick={() => handleTurnChange()} alt="Volume" src={volume === 0 ? "/icon/speaker3.png" : volume > 0 && volume < 70 ? "/icon/speaker2.png" : "/icon/speaker1.png"} className=""/>
                    </button>
                </div>
                <div className="w-24 h-6 flex items-center">
                    <input
                        type="range"
                        className="w-full h-1 cursor-pointer appearance-none bg-gray-400 rounded-full"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
                <div className="flex items-center">
  <button onClick={() => handelFullScreen()} className="ml-1">
    {!show ?  <img className="w-7 h-7" src="/icon/FullScreen_S.png" alt="Fullscreen" /> :<Minimize2 /> }
  </button>

 
</div>

            </div>

    
            <audio ref={audioRef} />
            {showQueuePopup && (
                <div className="fixed bottom-20 right-4 w-80 max-h-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50 border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
            <h3 className="font-medium text-white">Hàng đợi ({queue.length})</h3>
            <button 
                onClick={() => setShowQueuePopup(false)}
                className="text-gray-400 hover:text-white text-xl"
            >
                &times;
            </button>
        </div>
        
        <div className="overflow-y-auto max-h-80">
            {queue.length > 0 ? (
                queue.map((song, index) => (
                    <div 
                        key={`queue-${song.id}-${index}`}
                        className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer flex items-center ${
                            currentSong?.id === song.id ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => {
                            setCurrentSong(song);
                            setQueue(prev => prev.filter((_, i) => i !== index));
                            setIsPlaying(true);
                        }}
                    >
                        <img 
                            src={song.image || "https://i.pinimg.com/736x/3a/1f/d0/3a1fd088e3521120d68c7567bad13f6c.jpg"} 
                            className="w-10 h-10 rounded mr-3 object-cover" 
                            alt={song.name} 
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{song.name}</p>
                            <p className="text-sm text-gray-400 truncate">
                                {song.artists.length > 0 ? song.artists.map(a => a.name).join(',') : 'Unknown Artist'}
                            </p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setQueue(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="text-gray-400 hover:text-white ml-2"
                        >
                            ×
                        </button>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-gray-400">
                    Hàng đợi trống
                </div>
            )}
        </div>
    </div>
)}

        </div>
    );
}

export default BottomPlayer_ex;