import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BottomPlayer_ex from './BottomPlayer_ex';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
function SongList() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredSongId, setHoveredSongId] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    axios.get('https://localhost/api/songs/songs/')
      .then(response => setSongs(response.data))
      .catch(error => console.error('Error fetching songs:', error));
  }, []);

  const playSong = (song) => {
    if (currentSong && currentSong.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleDetailSong = (id) => {
    if(isPlaying===true){
        setIsPlaying(false);
    }
   
    navigate(`/song/${id}`);
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);
  if (!user) {
    return <div>Loading user...</div>;
}

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Danh sách Bài hát</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map(song => (
          <div
            key={song.id}
            className="relative bg-zinc-900 rounded-lg overflow-hidden group cursor-pointer transition duration-300 hover:scale-105 h-[300px] flex flex-col"
            onMouseEnter={() => setHoveredSongId(song.id)}
            onMouseLeave={() => setHoveredSongId(null)}
          >
            {/* Hình ảnh */}
            <div className="relative w-full h-[180px]">
              <img src={song.image} alt={song.name} className="w-full h-full object-cover" />

              {/* Nút hover */}
              {hoveredSongId === song.id && (
                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black bg-opacity-50 transition duration-300">
                  {/* Play Button */}
                  <button
                    className="bg-green-500 hover:bg-green-400 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
                    onClick={() => playSong(song)}
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18V6M18 18V6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                  </button>

                  {/* Detail Button */}
                  <button
                    className="bg-white hover:bg-zinc-200 text-black w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
                    onClick={() => handleDetailSong(song.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Thông tin bài hát */}
            <div className="p-3 flex-1 flex flex-col justify-center">
              <h3 className="text-md font-semibold truncate">{song.name}</h3>
              <p className="text-sm text-zinc-400 truncate">{song.artist || 'Unknown Artist'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trình phát nhạc */}
      {currentSong && (
        <BottomPlayer_ex
          song={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
        />
      )}

      {/* Audio element */}
      <audio ref={audioRef} src={currentSong?.url_song} />
    </div>
  );
}

export default SongList;
