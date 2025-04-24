import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { SlOptions } from 'react-icons/sl';
import { HiOutlinePencil } from 'react-icons/hi2';
import ModalChangePlaylist from '../Modals/ChangePlaylist';
import OptionPlaylist from '../Modals/OptionPlaylist';
import { getPlaylists, deletePlaylist, addSongToPlaylist, getPlaylistDetail } from '../../Services/PlaylistService';
import PlaylistSong from './PlaylistSong';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../axios';

const PlaylistDetail = ({ playlist }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const fileInputRef = useRef(null);
  const optionsButtonRef = useRef(null);
  const searchBarRef = useRef(null);
  const nameRef = useRef(null);

  const BACKEND_DOMAIN = 'https://localhost';

  const [currentPlaylist, setCurrentPlaylist] = useState(() => {
    const selectedPlaylist = playlist || location.state?.playlist || {
      id: null,
      name: 'Danh sách phát của tôi #1',
      description: 'Thêm phần mô tả không bắt buộc',
      image: 'null',
    };
    console.log('Khởi tạo currentPlaylist:', selectedPlaylist);
    return selectedPlaylist;
  });

  const [imageSrc, setImageSrc] = useState(currentPlaylist.image);
  const [name, setName] = useState(currentPlaylist.name);
  const [description, setDescription] = useState(currentPlaylist.description);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [searchModalPosition, setSearchModalPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [fontSizeClass, setFontSizeClass] = useState('text-7xl');
  const [dominantColor, setDominantColor] = useState('#434343');
  const [isLoadingColor, setIsLoadingColor] = useState(true);
  const [refreshSongs, setRefreshSongs] = useState(false); // State để làm mới PlaylistSong

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const getRgbaColor = (hex, opacity) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    if (!currentPlaylist.id) {
      console.error('Không có playlist ID hợp lệ, chuyển hướng về trang chủ.');
      navigate('/home');
    }
  }, [currentPlaylist.id, navigate]);

  useEffect(() => {
    const updatedImageSrc = currentPlaylist.image && currentPlaylist.image.startsWith('/media/')
      ? `${BACKEND_DOMAIN}${currentPlaylist.image}`
      : currentPlaylist.image || '/img/null.png';
    setImageSrc(updatedImageSrc);
    setName(currentPlaylist.name);
    setDescription(currentPlaylist.description);
    setImageError(false);
    console.log('Updated currentPlaylist:', currentPlaylist);
  }, [currentPlaylist]);

  useEffect(() => {
    const fetchDominantColor = async () => {
      setIsLoadingColor(true);
      if (imageError || imageSrc === '/img/null.png') {
        setDominantColor('#434343');
        setIsLoadingColor(false);
        return;
      }

      const apiImageUrl = imageSrc.startsWith('http')
        ? imageSrc
        : `${BACKEND_DOMAIN}${imageSrc}`;

      try {
        const response = await axios.get(`${BACKEND_DOMAIN}/api/playlists/get-dominant-color/`, {
          params: { image_url: apiImageUrl },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.dominant_color) {
          setDominantColor(response.data.dominant_color);
        } else if (response.data.error) {
          console.error('Error fetching dominant color:', response.data.error);
          setDominantColor('#434343');
        }
      } catch (error) {
        console.error('Failed to fetch dominant color:', error.response?.data?.error || error.message);
        setDominantColor('#434343');
      } finally {
        setIsLoadingColor(false);
      }
    };

    fetchDominantColor();
  }, [imageSrc, imageError, token]);

  useEffect(() => {
    console.log('dominantColor updated:', dominantColor);
  }, [dominantColor]);

  useEffect(() => {
    if (!user) {
      console.error('User not logged in, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getPlaylists(token);
        setPlaylists(data);
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      }
    };

    if (token) {
      fetchPlaylists();
    }
  }, [token]);

  useEffect(() => {
    const searchSongs = async () => {
      if (!searchTerm || !token) {
        setSearchResults([]);
        setIsSearchModalOpen(false);
        return;
      }

      try {
        const response = await axios.get(`/api/songs/songs/?search=${encodeURIComponent(searchTerm)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Search songs response:', response.data);
        const filteredResults = response.data.filter(song =>
          (song.name && song.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(filteredResults);
        setIsSearchModalOpen(filteredResults.length > 0);
      } catch (error) {
        console.error('Failed to search songs:', error);
        setSearchResults([]);
        setIsSearchModalOpen(false);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, token]);

  useEffect(() => {
    if (nameRef.current) {
      const containerWidth = window.innerWidth * 0.6 - 12 - 278;
      const textWidth = nameRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        setFontSizeClass('text-6xl');
      } else {
        setFontSizeClass('text-7xl');
      }
    }
  }, [name]);

  const handleAddSong = async (songId) => {
    if (!currentPlaylist.id || !token) {
      alert('Không thể thêm bài hát: thiếu thông tin playlist hoặc token.');
      return;
    }

    try {
      console.log('Gọi addSongToPlaylist với:', { playlistId: currentPlaylist.id, songId, token }); // Debug
      await addSongToPlaylist(currentPlaylist.id, songId, token);
      console.log('Song added to playlist:', { playlistId: currentPlaylist.id, songId });

      console.log('Gọi getPlaylistDetail với:', { playlistId: currentPlaylist.id, token }); // Debug
      const updatedPlaylist = await getPlaylistDetail(currentPlaylist.id, token);
      console.log('Updated playlist from API:', updatedPlaylist); // Debug

      if (updatedPlaylist && updatedPlaylist.id) {
        setCurrentPlaylist(updatedPlaylist);
      } else {
        console.warn('Không thể cập nhật currentPlaylist, làm mới PlaylistSong thay thế.');
        setRefreshSongs(prev => !prev); // Làm mới PlaylistSong
      }

      setSearchTerm('');
      setSearchResults([]);
      setIsSearchModalOpen(false);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      alert('Có lỗi xảy ra khi thêm bài hát. Vui lòng thử lại.');
    }
  };

  const handleImageError = () => {
    console.error('Failed to load image:', imageSrc);
    setImageSrc('/img/null.png');
    setImageError(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEdit = () => {
    openModal();
  };

  const handleDelete = async () => {
    try {
      await deletePlaylist(currentPlaylist.id, token);
      console.log('Playlist deleted successfully');
      window.dispatchEvent(new Event('playlistUpdated'));
      navigate('/home');
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Có lỗi xảy ra khi xóa playlist. Vui lòng thử lại.');
    }
  };

  const handleOpenOptionModal = () => {
    if (optionsButtonRef.current) {
      const rect = optionsButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 5,
      });
    }
    setIsOptionOpen(true);
  };

  useEffect(() => {
    if (searchBarRef.current && searchResults.length > 0) {
      const rect = searchBarRef.current.getBoundingClientRect();
      const modalWidth = 292;
      setSearchModalPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right + window.scrollX - modalWidth,
      });
    }
  }, [searchResults]);

  const handleCloseSearchModal = (e) => {
    if (e.target === e.currentTarget) {
      setSearchResults([]);
      setIsSearchModalOpen(false);
    }
  };

  return (
    <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden">
      <div className="overflow-y-auto overlay-scroll pb-20">
        <div
          className="p-6 transition-all duration-300 h-96"
          style={{
            background: `linear-gradient(to bottom, ${getRgbaColor(dominantColor, 1)},${getRgbaColor(dominantColor, 0)})`,
          }}
        >
          {isLoadingColor ? (
            <p className="text-white text-xl">Loading playlist...</p>
          ) : (
            <>
              <div className="flex justify-start items-start gap-4 pt-3">
                <div
                  className="relative w-48 h-48 shadow-2xl shadow-black rounded overflow-hidden"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="cursor-pointer rounded-lg overflow-hidden w-48 h-48">
                    <img
                      src={imageError ? '/img/null.png' : imageSrc}
                      alt="Album cover"
                      className="w-48 h-48 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    {isHovered && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded"
                        onClick={openModal}
                      >
                        <HiOutlinePencil className="text-white text-6xl mb-2" />
                        <span className="text-white font-bold">Chọn ảnh</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between h-48 text-left">
                  <span className="text-base text-gray-300 pt-6">Playlist</span>
                  <h1 ref={nameRef} className={`font-bold item-center flex-1 flex items-center ${fontSizeClass}`}>
                    {name}
                  </h1>
                  <div className="text-gray-300">
                    <div className="text-sm mt-1">{description}</div>
                    <div className="text-sm mt-1">
                      {user?.username || 'Người dùng'} • {currentPlaylist.create_date || 'Không có ngày tạo'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="relative z-10 bg-gradient-to-b from-neutral-900/35 to-neutral-900/100 -mt-32">
          <div className="flex items-center pl-5 pt-3">
            <button className="mr-3">
              <img alt="" src="/icon/Play_GreemHover.png" height="72" width="72"/>
            </button>
            {/* <button className="mr-3">
              <img alt="" src="/icon/Heart_XS.png" height="38" width="38"/>
            </button> */}
            <button className="mr-3">
              <img alt="" src="/icon/Download_XS.png" height="38" width="38"/>
            </button>
            <button className="mr-3">
              <SlOptions
                ref={optionsButtonRef}
                className="text-gray-300 text-2xl cursor-pointer hover:text-white"
                onClick={handleOpenOptionModal}
              />
              {isOptionOpen && (
                <OptionPlaylist
                  isOptionOpen={isOptionOpen}
                  setIsOptionOpen={setIsOptionOpen}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  modalPosition={modalPosition}
                />
              )}
            </button>
            <div className="ml-auto pr-5">
              <div ref={searchBarRef} className="flex items-center bg-[#3F4040] py-1 px-2 rounded w-52">
                <FaSearch className="text-gray-300" />
                <input
                  type="text"
                  placeholder="Tìm bài hát"
                  className="bg-[#3F4040] text-gray-200 ml-2 w-full focus:outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isSearchModalOpen && searchResults.length > 0 && (
            <div className="fixed inset-0 z-50" onClick={handleCloseSearchModal}>
              <div
                className="absolute bg-[#282828] text-white rounded-lg shadow-lg w-[70] max-h-64 overflow-y-auto"
                style={{ top: `${searchModalPosition.top}px`, left: `${searchModalPosition.left}px` }}
              >
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    className="r-0 flex items-center justify-between py-2 px-3 hover:bg-[#3E3E3E] cursor-pointer"
                  >
                    <div className="flex items-center">
                      <img
                        src={song.image || '/img/null.png'}
                        alt={song.name}
                        className="w-10 h-10 rounded mr-2"
                      />
                      <div className='pr-2'>
                        <p className="text-white text-xs">{song.name}</p>
                        <p className="text-gray-400 text-xs">{song.artist || 'Không rõ'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddSong(song.id)}
                      className="bg-transparent text-gray-300 border border-gray-300 px-2 py-1 rounded text-xs hover:text-[#7cb0ff] transition duration-200"
                    >
                      Thêm
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ModalChangePlaylist
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            imageSrc={imageSrc}
            setImageSrc={setImageSrc}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            fileInputRef={fileInputRef}
            playlistId={currentPlaylist.id}
            token={token}
          />
          <div className="mt-4">
            {currentPlaylist.id ? (
              <PlaylistSong playlist={currentPlaylist} token={token} refreshSongs={refreshSongs} />
            ) : (
              <p className="text-red-400">Không thể tải danh sách bài hát: thiếu ID playlist.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;