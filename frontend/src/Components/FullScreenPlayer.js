import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

const FullScreenPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
      const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
      const [previewEnded, setPreviewEnded] = useState(false);
          const previewTimeoutRef = useRef(null);
  const {
   song: currentSong,
   isPlaying,
   setIsPlaying,
   audioRef,
  } = usePlayer();

  const isVideo = currentSong?.url_video?.endsWith('.mp4');
  const videoRef = useRef(null); 

  const handleClose = () => {
    navigate(-1); 
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
      const syncVideoWithAudio = () => {
        if (audioRef.current && videoRef.current) {
          videoRef.current.currentTime = audioRef.current.currentTime;
        }
      };
    
      const audio = audioRef.current;
      if (!audio || !videoRef.current) return;
    
      audio.addEventListener('timeupdate', syncVideoWithAudio);
    
      return () => {
        audio.removeEventListener('timeupdate', syncVideoWithAudio);
      };
    }, [audioRef]);
    

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {}); 
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!currentSong) {
    return <div className="text-white p-4">Không có dữ liệu bài hát.</div>;
  }

  return (
    <div className="mb-10 bg-neutral-900 text-white h-auto flex flex-col md:flex-row rounded-lg">
     
    

    
      <div className="flex-1 flex items-center justify-center  bg-black">
  {isVideo ? (
    <video
      ref={videoRef}
      src={currentSong.url_video}
      className="max-w-full max-h-full object-contain"
      autoPlay
      muted
      loop
    />
  ) : (
    <img
      src={currentSong.image}
      alt={currentSong.name}
      className="max-w-full max-h-full object-contain"
    />
  )}
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
            <div className="absolute top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-black bg-opacity-50 px-4 py-2 rounded-md text-center">
    <h1 className="text-xl font-semibold">{currentSong.name}</h1>
    <p className="text-sm text-gray-300">
      {currentSong.artists?.map(a => a.name).join(', ')}
    </p>
  </div>
</div>

    </div>
  );
};

export default FullScreenPage;
