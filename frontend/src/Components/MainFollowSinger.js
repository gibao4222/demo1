import React, { useState, useEffect, useRef } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPortal } from 'react-dom';
import OptionSongAlbum from "./Modals/OptionSongAlbum";
import { usePlayer } from "../context/PlayerContext";
import { FaPause, FaPlay } from "react-icons/fa";
import MenuSub from "./MenuSub";

function MainFollowSinger() {
  const { id: singerId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [songs, setSongs] = useState([]);
  const [songDurations, setSongDurations] = useState({});
  const { token } = useAuth();
  const optionRef = useRef(null);
  const scrollRef = useRef(null); // Thêm ref cho phần tử có thanh cuộn
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [optionPosition, setOptionPosition] = useState({ top: 0, left: 0 });
  const [selectedSongId, setSelectedSongId] = useState(null);
  const optionButtonRefs = useRef({});

      const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
      const [previewEnded, setPreviewEnded] = useState(false);
      const previewTimeoutRef = useRef(null);
      const navigate = useNavigate();
      const [MenuSubPos, setMenuSubPos] = useState({ x: 0, y: 0 });
      const [showMenuSub, setShowMenuSub] = useState(false);
      const [MenuSubSong, setMenuSubSong] = useState(null);
      const { user } = useAuth();
      const isContextMenuTriggered = useRef(false); 

  // Lấy thông tin chi tiết nghệ sĩ
  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await axios.get(`/api/singers/singers/${singerId}/`);
        setArtist(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nghệ sĩ:", error);
        toast.error("Không thể tải thông tin nghệ sĩ!");
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [singerId]);
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

      const playSong = (song) => {
     
        if (currentSong && currentSong.id === song.id) {
            setIsPlaying(!isPlaying);
            return;
        }

        
        if (song.is_vip && !user?.vip) {
            setCurrentSong(song);
            setPreviewEnded(false);
            setShowUpgradePrompt(false);
        } else {
            setCurrentSong(song);
        }

        setIsPlaying(true); 
    };

    const handlePlayAll = () => {
    
      if (currentSong && songs.some(song => song.id === currentSong.id)) {
          setIsPlaying(!isPlaying);
          return;
        }
      if (songs.length === 0) return;
  
      setCurrentSong(songs)
      setCurrentSong(songs[0]);
      setQueue([]);
      setIsPlaying(true);
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
        };
    }, [currentSong, isPlaying, user?.vip, audioRef]);

    
    const handleMenuSub = (e, song) => {
      e.preventDefault();
    
      const menuWidth = 150;
      const menuHeight = 50;
      const maxX = window.innerWidth - menuWidth;
      const maxY = window.innerHeight - menuHeight;
      const adjustedX = Math.min(e.clientX, maxX);
      const adjustedY = Math.min(e.clientY, maxY);
      setMenuSubSong(song);
      setMenuSubPos({ x: adjustedX, y: adjustedY });
      setShowMenuSub(true);
      isContextMenuTriggered.current = true; 
  };

  
  const handleAddToQueue = () => {
    if (MenuSubSong && !queue.find(s => s.id === MenuSubSong.id)) {
      setQueue([...queue, MenuSubSong]);
    }
    setShowMenuSub(false);
  };
  useEffect(() => {
            const handleClickOutside = (e) => {
                if (e.button === 0 && !isContextMenuTriggered.current) {
                    setShowMenuSub(false);
                }
             
                if (isContextMenuTriggered.current) {
                    setTimeout(() => {
                        isContextMenuTriggered.current = false;
                    }, 100);
                }
            };
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, []);


  // Lấy danh sách bài hát của ca sĩ
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`/api/songs/singers/${singerId}/songs/`);
        setSongs(response.data);
        setCurrentSongList(response.data)
        console.log("SONG",response.data)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài hát:", error);
        toast.error("Không thể tải danh sách bài hát!");
      }
    };

    fetchSongs();
  }, [singerId])

  useEffect(() => {
    const calculateDurations = async () => {
      const durations = {};
      for (const song of songs) {
        if (song.url_song) {
          try {
            const duration = await getAudioDuration(song.url_song);
            durations[song.id] = duration;
          } catch (error) {
            console.error(`Lỗi khi tính thời lượng bài hát ${song.name}:`, error);
            durations[song.id] = "0:00";
          }
        } else {
          durations[song.id] = "0:00";
        }
      }
      setSongDurations(durations);
    };

    if (songs.length > 0) {
      calculateDurations();
    }
  }, [songs]);

  // Hàm lấy thời lượng bài hát từ url_song
  const getAudioDuration = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        resolve(formattedDuration);
      });
      audio.addEventListener("error", (e) => {
        reject(e);
      });
    });
  };

  // Kiểm tra trạng thái theo dõi khi component được render
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (!token) {
          console.log("Chưa đăng nhập, không kiểm tra trạng thái theo dõi.");
          return;
        }

        console.log("Kiểm tra trạng thái theo dõi cho singerId:", singerId);
        const response = await axios.get(
          `/api/users/theo-doi-nghe-si/?singer_id=${singerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ checkFollowStatus:", response.data);
        setIsFollowing(response.data.is_following || false);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        toast.error("Không thể kiểm tra trạng thái theo dõi!");
      }
    };

    checkFollowStatus();
  }, [singerId, token]);

  // Theo dõi vị trí cuộn để hiển thị/ẩn sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && optionRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        const scrollContainerRect = scrollRef.current.getBoundingClientRect();
        const optionRect = optionRef.current.getBoundingClientRect();
        const optionTopRelativeToScroll = optionRect.top - scrollContainerRect.top + scrollTop;
        const optionHeight = optionRef.current.offsetHeight;


        // Hiển thị header khi cuộn đến cuối phần option
        const isOptionFullyOutOfView = scrollTop > optionTopRelativeToScroll + optionHeight;
        setShowStickyHeader(isOptionFullyOutOfView);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [artist]);

  const handleFollowToggle = async () => {
    try {
      console.log("Token:", token);
      if (!token) {
        toast.error("Vui lòng đăng nhập để theo dõi!");
        return;
      }

      if (isFollowing) {
        console.log("Gửi yêu cầu DELETE để hủy theo dõi:", singerId);
        const response = await axios.delete(
          `/api/users/theo-doi-nghe-si/?singer_id=${singerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ DELETE:", response.data);
        toast.success(response.data.thông_báo || "Đã xóa khỏi Thư viện.");
        setIsFollowing(false);
      } else {
        console.log("Gửi yêu cầu POST để theo dõi:", singerId);
        const response = await axios.post(
          `/api/users/theo-doi-nghe-si/`,
          { singer_id: singerId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ POST:", response.data);
        toast.success(response.data.thông_báo || "Đã thêm vào Thư viện.");
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện theo dõi/hủy theo dõi:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
      const errorMsg = error.response?.data?.lỗi || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    }
  };

  const handleOpenOptionModal = (songId, event) => {
    event.stopPropagation();
    const ref = optionButtonRefs.current[songId];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      const modalWidth = 250;
      const windowWidth = window.innerWidth;
      const friendActivityWidth = 300;
      const availableWidth = windowWidth - friendActivityWidth;

      let leftPosition = rect.left + window.scrollX;

      if (leftPosition + modalWidth > availableWidth) {
        leftPosition = availableWidth - modalWidth - 10;
      }
      if (leftPosition < 0) {
        leftPosition = 10;
      }

      setOptionPosition({
        top: rect.bottom + window.scrollY - 100,
        left: leftPosition,
      });
    }
    setSelectedSongId(songId);
    setIsOptionOpen(true);
  };

  const handleCloseOptionModal = () => {
    setIsOptionOpen(false);
    setSelectedSongId(null);
  };

  const toggleShowAllSongs = () => {
    setShowAllSongs(!showAllSongs);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!artist) {
    return <div>Không tìm thấy nghệ sĩ!</div>;
  }

  const displayedSongs = showAllSongs ? songs : songs.slice(0, 5);

  return (
    <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden relative">
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
      {/* Sticky Header */}
      {showStickyHeader && (
        <div className="absolute top-0 left-0 right-0 bg-[#072447] z-50 flex items-center px-2 py-0.5">
          <button className="">
            <img
              className="w-16 h-16 hover:brightness-75 transition-all duration-200"
              src="/icon/Play_GreemHover.png"
              alt="Play button"
            />
          </button>
          <h1 className="text-3xl font-bold text-white ml-1 tracking-wider">{artist.name}</h1>
        </div>
      )}

      <div className="overflow-y-auto overlay-scroll pb-20" ref={scrollRef}>
        <div className="flex-1 flex">
          <div className="flex-1">
            <div className="relative">
              <img
                alt={artist.name}
                className="w-full h-[300px] object-cover object-top"
                height="400"
                src={
                  artist.image
                    ? artist.image.startsWith("http")
                      ? artist.image
                      : `https://localhost:3000${artist.image}`
                    : "https://storage.googleapis.com/a1aa/image/_CJYsizjY3hL_rf2L0alx_iaUDz0EXttAkg_pl1vBNE.jpg"
                }
                width="800"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="absolute bottom-7 left-5 space-y-3">
                  <div className="flex items-center">
                    <img src="/icon/Verification.png" className="w-7 h-7 mr-1" />
                    <p className="drop-shadow-xl">Nghệ sĩ được xác minh</p>
                  </div>
                  <h1 className="text-6xl font-bold drop-shadow-xl tracking-wider">
                    {artist.name}
                  </h1>
                  <p className="drop-shadow-xl pt-2">
                    <span className="tracking-wider">{artist.followers}</span>{" "}
                    người nghe hàng tháng
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-b from-[#072447] to-neutral-900 relative">
                {/* Phần option */}
                <div ref={optionRef} className="flex items-center px-2 py-2">
                <button onClick={()=>handlePlayAll()}  className="mr-3">
                    <img 
                    alt={isPlaying ? "Pause" : "Play"} 
                    src={isPlaying ? "/icon/icon-pause.png" : "/icon/Play_GreemHover.png"} 
                    height="50" 
                    width="50" />
                </button>
                  <button className="px-2">
                    <img
                      className="w-10 h-10 hover:brightness-75 transition-all duration-200"
                      src="/icon/Shuffle.png"
                      alt="Shuffle button"
                    />
                  </button>
                  <button
                    onClick={handleFollowToggle}
                    className={`text-white px-6 py-2 ml-2 rounded-full bg-opacity-0 bg-nuetral-900 border-[1px] border-neutral-500 hover:border-[1.5px] hover:border-white`}
                  >
                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </button>
                </div>

                <h2 className="text-2xl font-bold px-6 pt-2 pb-2">Phổ biến</h2>
              </div>

            <div className="mt-4 px-8">
              {displayedSongs.map((song, index) => (
                <div       onContextMenu={(e) => handleMenuSub(e, song)} key={song.id} className="flex items-center justify-between py-2.5 hover:bg-neutral-800 group">
          
                  <div className="flex items-center">
                  <div className="w-8 flex items-center justify-center ml-4 mr-2">

                  <span className="text-gray-400 group-hover:hidden">{index + 1}</span>

                  <div className="hidden group-hover:flex items-center justify-center">
                    {currentSong?.id === song.id && isPlaying ? (
                      <FaPause 
                        onClick={() => !(song.is_vip && !user?.vip && previewEnded) && playSong(song)} 
                        className={`mr-2 text-gray-200 cursor-pointer hover:text-white ${
                          song.is_vip && !user?.vip && previewEnded ? 'text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                    ) : (
                      <FaPlay 
                        onClick={() => !(song.is_vip && !user?.vip && previewEnded) && playSong(song)} 
                        className={`mr-2 text-gray-200 cursor-pointer hover:text-white ${
                          song.is_vip && !user?.vip && previewEnded ? 'text-gray-400 cursor-not-allowed' : ''
                        }`}
                      />
                    )}
                  </div>
                </div>
                    <img src={
                      artist.image
                        ? song.image.startsWith("http")
                          ? song.image
                          : `/media/${song.image}`
                        : "https://storage.googleapis.com/a1aa/image/_CJYsizjY3hL_rf2L0alx_iaUDz0EXttAkg_pl1vBNE.jpg"
                    }
                      className="w-9 h-9 rounded-sm" />
                    <p className="ml-4">{song.name}
                    {song.is_vip && (
                                                    <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded">
                                                        VIP
                                                    </span>
                                                )}
                    </p>
                     
                  </div>
                  <div className="flex items-center">
                    <p className="text-gray-400 mr-[145px]">{song.popularity.toLocaleString()}</p>
                    <p className="text-gray-400">{songDurations[song.id] || "0:00"}</p>
                    <div className="relative group ml-6 mr-5">
                      <img
                        ref={(el) => (optionButtonRefs.current[song.id] = el)}
                        src="/icon/Options_XS.png"
                        className="w-5 h-5 cursor-pointer"
                        alt="Options icon"
                        onClick={(event) => handleOpenOptionModal(song.id, event)}
                      />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#3c3c3c] text-white text-sm rounded py-1 px-2 whitespace-nowrap">
                        Tùy chọn khác
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {songs.length > 5 && (
                <button
                  onClick={toggleShowAllSongs}
                  className="text-gray-400 hover:text-white mt-4"
                >
                  {showAllSongs ? "See Less" : "See More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOptionOpen &&
        createPortal(
          <OptionSongAlbum
            onClose={handleCloseOptionModal}
            position={optionPosition}
            trackId={selectedSongId}
            albumData={{
              id_singer: { name: artist.name },
              name: artist.name,
              image: artist.image,
            }}
          />,
          document.body
        )}
        <MenuSub
                show={showMenuSub}
                position={MenuSubPos}
                onAddToQueue={handleAddToQueue}
            />
    </div>
  );
}

export default MainFollowSinger;