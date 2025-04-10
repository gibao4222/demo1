import React, { useState, useRef, useEffect } from "react";

function BottomPlayer_ex({ song, isPlaying, setIsPlaying, audioRef }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        audio.volume = volume / 100;

        // Cleanup để tránh memory leak
        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [song, volume, setIsPlaying, audioRef]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const seekTime = (e.target.value / 100) * duration;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-2 flex items-center justify-between">
            <div className="flex items-center">
                <img alt="Album Art" className="mr-4 rounded" height="60" src={song.image} width="60" />
                <div>
                    <h3 className="font-bold">{song.name}</h3>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex items-center">
                    <button className="mr-4 mb-2">
                        <img alt="Shuffle" src="/icon/Shuffle_S.png" />
                    </button>
                    <button className="mr-4">
                        <img alt="Previous" src="/icon/Component2.png" />
                    </button>
                    <button className="mr-4" onClick={togglePlay}>
                        <img
                            alt={isPlaying ? "Pause" : "Play"}
                            src={isPlaying ? "/icon/Component1.png" : "/icon/play-icon.png"}
                        />
                    </button>
                    <button className="mr-4">
                        <img alt="Next" src="/icon/Component3.png" />
                    </button>
                    <button className="mr-4">
                        <img alt="Repeat" src="/icon/Repeat_S.png" />
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
            <div className="flex items-center">
                <div className="flex items-center">
                    <button className="mr-1">
                        <img alt="Queue" src="/icon/Queue_XS.png" />
                    </button>
                    <button className="mr-1">
                        <img alt="Devices" src="/icon/Devices_XS.png" />
                    </button>
                    <button className="mr-1">
                        <img alt="Volume" src="/icon/Volume_XS.png" />
                    </button>
                </div>
                <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <input
                        type="range"
                        className="w-full h-full"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
                <div className="flex items-center">
                    <button className="ml-1">
                        <img src="/icon/FullScreen_S.png" alt="Fullscreen" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BottomPlayer_ex;
