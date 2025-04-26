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
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const audioRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    axios.get('https://localhost/api/songs/songs/')
      .then(response => setSongs(response.data))
      .catch(error => console.error('Error fetching songs:', error));
  }, []);

  const playSong = (song) => {
    // If already playing this song, toggle pause/play
    if (currentSong && currentSong.id === song.id) {
      setIsPlaying(!isPlaying);
      return;
    }

    // Check for VIP song and non-VIP user
    if (song.is_vip && !user?.vip) {
      setCurrentSong(song);
      setIsPlaying(true);
      setPreviewEnded(false);
      setShowUpgradePrompt(false);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleDetailSong = (id) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    navigate(`/song/${id}`);
  };
  const handleUpgrade=()=>{
    navigate("/payment")
  }

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
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [currentSong, isPlaying, user?.vip]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {

      if (currentSong.is_vip && !user?.vip) {
        audioRef.current.currentTime = 0;
        setPreviewEnded(false);
      }
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, user?.vip]);

  if (!user) {
    return <div className="text-white text-center py-8">Loading user...</div>;
  }

  return (
    <div className="p-4 text-white">

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

      <h2 className="text-2xl font-bold mb-6">Danh sách Bài hát</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {songs.map(song => (
          <div
            key={song.id}
            className="relative bg-zinc-900 rounded-lg overflow-hidden group cursor-pointer transition duration-300 hover:scale-105 h-[300px] flex flex-col"
            onMouseEnter={() => setHoveredSongId(song.id)}
            onMouseLeave={() => setHoveredSongId(null)}
          >
        
            {song.is_vip && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded z-10">
                PREMIUM
              </div>
            )}

            <div className="relative w-full h-[180px]">
              <img src={song.image} alt={song.name} className="w-full h-full object-cover" />

              
              {hoveredSongId === song.id && (
                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black bg-opacity-50 transition duration-300">
          
                  <button
                    className={`${
                      song.is_vip && !user?.vip && previewEnded && currentSong?.id === song.id
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-400 text-white'
                    } w-12 h-12 flex items-center justify-center rounded-full shadow-lg`}
                    onClick={() => playSong(song)}
                    disabled={song.is_vip && !user?.vip && previewEnded && currentSong?.id === song.id}
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

        
            <div className="p-3 flex-1 flex flex-col justify-center">
              <h3 className="text-md font-semibold truncate">
                {song.name}
                {song.is_vip && !user?.vip && currentSong?.id === song.id && previewEnded && (
                  <span className="ml-2 text-xs text-yellow-400">(Hết preview)</span>
                )}
              </h3>
              <p className="text-sm text-zinc-400 truncate">{song.artists.length >0 ? song.artists.map(a=>a.name).join('-') : 'Unknown Artist'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Player */}
      {currentSong && (
        <BottomPlayer_ex
          song={currentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
          songList={songs}
          setCurrentSong={setCurrentSong}
   
        />
      )}

      {/* Audio element */}
      <audio ref={audioRef} src={currentSong?.url_song} />
    </div>
  );
}

export default SongList;