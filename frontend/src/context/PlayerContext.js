import React, { createContext, useContext, useRef, useState } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSongList, setCurrentSongList] = useState([]);
    const [queue, setQueue] = useState([]);
    const audioRef = useRef(new Audio()); 
   

   
    return (
        <PlayerContext.Provider value={{
            song: currentSong,
            setCurrentSong,
            isPlaying,
            setIsPlaying,
            songList: currentSongList,
            setCurrentSongList,
            queue,
            setQueue,
            audioRef,
         
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);