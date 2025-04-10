// src/components/MusicPlayer.js

import React, { useState, useRef } from 'react';

function PlayMusic({ song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!song) {
    return <p>Select a song to play</p>;
  }

  return (
    <div className="music-player">
      <h3>Now Playing: {song.name} - {song.artist}</h3>
      <audio
        ref={audioRef}
        controls={false}
        src={song.url_song} // Dùng URL âm thanh từ API
        autoPlay
      />
      <div className="controls">
        <button onClick={togglePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}

export default PlayMusic;
