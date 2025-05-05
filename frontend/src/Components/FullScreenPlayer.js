import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

const FullScreenPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const song = location.state?.song;
  const { user } = useAuth();
      const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
      const [previewEnded, setPreviewEnded] = useState(false);
          const previewTimeoutRef = useRef(null);
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

  const isVideo = song?.url_video?.endsWith('.mp4');
  const videoRef = useRef(null); // Ref cho video

  const handleClose = () => {
    navigate(-1); // Quay lại trang trước
  };
  const handleUpgrade = () => {
    navigate("/payment");
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
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
        };
    }, [currentSong, isPlaying, user?.vip, audioRef]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {}); // tránh lỗi promise
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!song) {
    return <div className="text-white p-4">Không có dữ liệu bài hát.</div>;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 text-white bg-black flex flex-col pb-20">
      {/* Nút đóng */}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={handleClose} className="text-3xl font-bold bg-black bg-opacity-50 rounded-full px-3 py-1">
          ×
        </button>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black">
  {isVideo ? (
    <video
      ref={videoRef}
      src={song.url_video}
      className="max-w-full max-h-full object-contain"
      autoPlay
      muted
      loop
    />
  ) : (
    <img
      src={song.image}
      alt={song.name}
      className="max-w-full max-h-full object-contain"
    />
  )}
</div>


<div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
  <div className="bg-black bg-opacity-50 px-4 py-2 rounded-md text-center">
    <h1 className="text-xl font-semibold">{song.name}</h1>
    <p className="text-sm text-gray-300">
      {song.artists?.map(a => a.name).join(', ')}
    </p>
  </div>
</div>

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
    </div>
  );
};

export default FullScreenPage;
