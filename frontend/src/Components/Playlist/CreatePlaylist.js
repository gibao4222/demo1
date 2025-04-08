import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { SlOptions } from 'react-icons/sl';
import { HiOutlinePencil } from 'react-icons/hi2';
import ModalChangePlaylist from '../Modals/ChangePlaylist';
import OptionPlaylist from '../Modals/OptionPlaylist';
import { getPlaylists, deletePlaylist } from '../../Services/PlaylistService';
import PlaylistSong from './PlaylistSong';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const CreatePlaylist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const fileInputRef = useRef(null);
  const optionsButtonRef = useRef(null);

  const newPlaylist = useMemo(() => {
    return location.state?.playlist || {
      id: null,
      name: 'Danh sách phát của tôi #1',
      description: 'Thêm phần mô tả không bắt buộc',
      image: '/img/null.png',
    };
  }, [location.state?.playlist]);

  // console.log('Received playlist:', newPlaylist);

  const [imageSrc, setImageSrc] = useState(newPlaylist.image);
  const [name, setName] = useState(newPlaylist.name);
  const [description, setDescription] = useState(newPlaylist.description);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setImageSrc(newPlaylist.image);
    setName(newPlaylist.name);
    setDescription(newPlaylist.description);
    setImageError(false);
  }, [newPlaylist]);

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

  const handleImageError = () => {
    console.error('Failed to load image:', imageSrc);
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
      await deletePlaylist(newPlaylist.id, token);
      console.log('Playlist deleted successfully');
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
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX + 15,
      });
    }
    setIsOptionOpen(true);
  };

  return (
    <div className="w-full p-6 bg-gradient-to-b from-[#434343] to-black text-white h-[calc(100vh-100px)] overflow-y-auto scrollbar scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
      <div className="flex justify-start items-start gap-4">
        <div
          className="relative w-47 h-47 shadow-2xl shadow-black rounded overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="cursor-pointer">
            <img
              src={imageError ? '/img/null.png' : imageSrc}
              alt="Album cover"
              className="w-full h-full object-contain rounded"
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
        <div className="self-end ml-4 text-left">
          <span className="text-base text-gray-300">Playlist</span>
          <h1 className="text-4xl font-bold">{name}</h1>
          <div className="text-sm text-gray-300 mt-1">{description}</div>
          <div className="text-sm text-gray-300 mt-1">
            {user?.username || 'Người dùng'} • {newPlaylist.create_date || 'Không có ngày tạo'}
          </div>
        </div>
      </div>

      <div className="relative mt-6">
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
      </div>

      <PlaylistSong playlist={newPlaylist} />

      <div className="mt-6">
        <p className="text-xl font-bold">Hãy cùng tìm nội dung cho danh sách phát của bạn</p>
        <div className="mt-4 flex items-center bg-[#3F4040] p-2 rounded">
          <FaSearch className="text-gray-300" />
          <input
            type="text"
            placeholder="Tìm bài hát"
            className="bg-[#3F4040] text-gray-200 ml-2 w-full focus:outline-none"
          />
        </div>
      </div>

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
        playlistId={newPlaylist.id}
        token={token}
      />
    </div>
  );
};

export default CreatePlaylist;