import { LuRepeat, LuRepeat1 } from "react-icons/lu";
import { IoShuffle } from "react-icons/io5";
import React, { useState, useRef, useEffect } from "react";

function BottomPlayer_ex({ song, isPlaying, setIsPlaying, audioRef, songList, setCurrentSong, onFullScreenClick }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isVolume, setIsVolume] = useState(1);
    const [volumeTemp, setVolumeTemp] = useState(0);
    const [repeatMode, setRepeatMode] = useState("off");
    const [isShuffle, setIsShuffle] = useState(false);
    const [shuffledList, setShuffledList] = useState([]);


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            const currentIndex = (isShuffle ? shuffledList : songList).findIndex(s => s.id === song.id);
            const nextList = isShuffle ? shuffledList : songList;

            if (repeatMode === "one") {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            } else if (repeatMode === "all") {
                const nextIndex = (currentIndex + 1) % nextList.length;
                setCurrentSong(nextList[nextIndex]);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        };


        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        audio.volume = volume / 100;

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [song, volume, setIsPlaying, audioRef, repeatMode]);

    const togglePlay = () => {
        if (!audioRef.current) return;
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
        const currentIndex = (isShuffle ? shuffledList : songList).findIndex(s => s.id === song.id);
        const nextList = isShuffle ? shuffledList : songList;
        const nextIndex = (currentIndex + 1) % nextList.length;
        setCurrentSong(nextList[nextIndex]);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        const currentIndex = (isShuffle ? shuffledList : songList).findIndex(s => s.id === song.id);
        const nextList = isShuffle ? shuffledList : songList;
        const prevIndex = (currentIndex - 1 + nextList.length) % nextList.length;
        setCurrentSong(nextList[prevIndex]);
        setIsPlaying(true);
    };

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
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-2 flex items-center justify-between" style={{ minWidth: '100vw' }}>
            {/* Left section - Song info */}
            <div className="flex items-center" style={{ width: '25%', minWidth: '200px', maxWidth: '300px' }}>
                <img alt="Album Art" className="mr-4 rounded" height="60" src={song.image} width="60" />
                <div style={{ overflow: 'hidden' }}>
                    <h3 className="font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.name}
                    </h3>
                </div>
            </div>

            {/* Middle section - Controls */}
            <div className="flex flex-col items-center" style={{ flex: 1, maxWidth: '600px' }}>
                <div className="flex items-center">
                    <button className="mr-4" onClick={toggleShuffle}>
                        <IoShuffle className={isShuffle ? "text-green-500 w-7 h-7" : "text-gray-400 w-7 h-7"} />
                    </button>
                    <button onClick={() => handlePrev()} className="mr-4">
                        <img alt="Previous" src="/icon/Component2.png" />
                    </button>
                    <button className="mr-4" onClick={togglePlay}>
                        <img
                            alt={isPlaying ? "Pause" : "Play"}
                            src={isPlaying ? "/icon/Component1.png" : "/icon/play.png"}
                        />
                    </button>
                    <button onClick={() => handleNext()} className="mr-4">
                        <img alt="Next" src="/icon/Component3.png" />
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

            {/* Right section - Volume controls */}
            <div className="flex items-center" style={{ width: '25%', minWidth: '200px', justifyContent: 'flex-end' }}>
                <div className="flex items-center">
                    <button className="mr-1">
                        <img alt="Queue" src="/icon/Queue_XS.png" />
                    </button>
                    <button className="mr-1">
                        <img alt="Devices" src="/icon/Devices_XS.png" />
                    </button>
                    <button className="mr-1">
                        <img onClick={() => handleTurnChange()} alt="Volume" src={volume === 0 ? "/icon/speaker3.png" : volume > 0 && volume < 70 ? "/icon/speaker2.png" : "/icon/speaker1.png"} />
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
                    <button className="ml-1" onClick={onFullScreenClick}>
                        <img src="/icon/FullScreen_S.png" alt="Fullscreen" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BottomPlayer_ex;