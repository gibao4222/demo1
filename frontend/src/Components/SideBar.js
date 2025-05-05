import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaylists, createPlaylist } from '../Services/PlaylistService';
import { getLibraryAlbums } from '../Services/AlbumService';
import { useAuth } from '../context/AuthContext';
import PlaylistItem from './Playlist/PlaylistItem';
import NavItem from './Item/NavItem';

function SideBar({ onToggleExpand, isExpanded }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [libraryAlbums, setLibraryAlbums] = useState([]);
  const [activeTab, setActiveTab] = useState('Danh sách phát');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isPlaylistHovered, setIsPlaylistHovered] = useState(false);
  const [isFolderHovered, setIsFolderHovered] = useState(false);
  const [isAIPlaylistHovered, setIsAIPlaylistHovered] = useState(false);
  const createButtonRef = useRef(null);

  const fetchPlaylists = useCallback(async () => {
    try {
      if (!user || !user.id_spotify_user) {
        console.error('Thiếu thông tin user hoặc id_spotify_user:', user);
        setPlaylists([]);
        return;
      }
      const data = await getPlaylists(token, user.id_spotify_user);
      if (!Array.isArray(data) || data.length === 0) {
        setPlaylists([]);
        console.error('Không có danh sách phát nào cho user hiện tại.');
        return;
      }
      // Lọc playlist dựa trên id_spotify_user
      const filteredPlaylists = data.filter(playlist => playlist.id_user === user.id_spotify_user);
      setPlaylists([...filteredPlaylists]);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phát:', error);
      alert('Không thể tải danh sách phát. Vui lòng thử lại sau.');
      setPlaylists([]);
    }
  }, [token, user]);

  const fetchLibraryAlbums = useCallback(async () => {
    try {
      const data = await getLibraryAlbums(token);
      if (!Array.isArray(data) || data.length === 0) {
        setLibraryAlbums([]);
        console.error('Không có album nào trong thư viện.');
        return;
      }
      setLibraryAlbums(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách album trong thư viện:', error);
      alert('Không thể tải danh sách album trong thư viện. Vui lòng thử lại sau.');
      setLibraryAlbums([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPlaylists();
      fetchLibraryAlbums();
    } else {
      navigate('/login');
    }

    window.addEventListener('playlistUpdated', fetchPlaylists);
    window.addEventListener('libraryUpdated', fetchLibraryAlbums);

    return () => {
      window.removeEventListener('playlistUpdated', fetchPlaylists);
      window.removeEventListener('libraryUpdated', fetchLibraryAlbums);
    };
  }, [token, fetchPlaylists, fetchLibraryAlbums, navigate]);

  useEffect(() => {
    if (isModalOpen && createButtonRef.current) {
      const rect = createButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isModalOpen]);

  const handleCreatePlaylist = async () => {
    try {
      if (!user || !user.user_id) {
        console.error('Thiếu thông tin người dùng:', user);
        alert('Vui lòng đăng nhập để tạo playlist.');
        navigate('/login');
        return;
      }

      const maxId = playlists.length > 0 ? Math.max(...playlists.map(playlist => playlist.id)) : 0;
      const newPlaylistNumber = maxId + 1;
      const newPlaylistName = `Danh sách phát của tôi #${newPlaylistNumber}`;
      const currentDate = new Date().toISOString().split('T')[0];

      const playlistData = {
        name: newPlaylistName,
        description: 'Thêm phần mô tả không bắt buộc',
        image: '/img/null.png',
        create_date: currentDate,
        id_user: user.id_spotify_user,
        is_active: true,
      };

      const newPlaylist = await createPlaylist(playlistData, token);
      setPlaylists([...playlists, newPlaylist]);
      alert('Đã tạo playlist thành công!');
      navigate(`/PlaylistDetail/${newPlaylist.id}`, {
        state: { playlist: newPlaylist },
      });
    } catch (error) {
      console.error('Lỗi khi tạo danh sách phát:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Không thể tạo playlist. Vui lòng thử lại.');
    }
  };

  const handleCreateAIPlaylist = async () => {
    try {
      if (!user || !user.user_id) {
        console.error('Thiếu thông tin người dùng:', user);
        alert('Vui lòng đăng nhập để tạo playlist AI.');
        navigate('/login');
        return;
      }

      setIsModalOpen(false);

      const response = await fetch('https://localhost/api/playlists/create-recommended-playlist/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Assuming token is required for auth
        },
        body: JSON.stringify({
          user_id: user.id_spotify_user,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tạo playlist AI');
      }

      const newPlaylist = await response.json();
      setPlaylists([...playlists, newPlaylist.playlist]);
      alert('Đã tạo playlist AI thành công!');
      navigate(`/PlaylistDetail/${newPlaylist.playlist.id}`, {
        state: { playlist: newPlaylist.playlist },
      });
    } catch (error) {
      console.error('Lỗi khi tạo playlist AI:', error);
      alert('Không thể tạo playlist AI. Vui lòng thử lại sau.');
    }
  };

  const handleCreateFolder = () => {
    console.log('Tạo thư mục');
    setIsModalOpen(false);
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/AlbumDetail/${albumId}`);
  };

  return (
    <div
      className={`bg-neutral-900 px-3.5 py-3 rounded-lg flex flex-col `}
      style={{ height: 'calc(100vh - 136px)' }}
    >
      <div className="shadow-xl sticky top-0 z-10 bg-neutral-900 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Thư viện</h2>
          <div className="flex space-x-2 relative">
            <div ref={createButtonRef}>
              <NavItem
                icon="/icon/Create.png"
                text="Tạo"
                active={isModalOpen}
                activeStyle="rotate"
                rotateDegree={45}
                onClick={() => setIsModalOpen((prev) => !prev)}
                className="px-2 py-2"
              />
            </div>
            <NavItem
              active={isExpanded}
              activeStyle="rotate"
              rotateDegree={180}
              onClick={onToggleExpand}
              noBackground={true}
              className="py-2 pr-0"
            >
              <img src="/icon/Arrow.png" alt="Arrow Icon" className="w-4 h-4" />
            </NavItem>

            {/* Modal */}
            {isModalOpen && (
              <div
                className="fixed z-[100] bg-neutral-800 rounded-lg shadow-lg p-1"
                style={{
                  top: `${modalPosition.top}px`,
                  left: `${modalPosition.left}px`,
                  width: `356px`,
                }}
              >
                <ul>
                  <li
                    className="group px-2.5 py-2 text-white hover:bg-neutral-700 cursor-pointer rounded flex items-center m-0.5"
                    onClick={handleCreatePlaylist}
                    onMouseEnter={() => setIsPlaylistHovered(true)}
                    onMouseLeave={() => setIsPlaylistHovered(false)}
                  >
                    <NavItem
                      icon="/icon/AddPlaylist.png"
                      hoverIcon="/icon/AddPlaylist_Green.png"
                      activeStyle="none"
                      hoverRotateDegree={10}
                      isParentHovered={isPlaylistHovered}
                      className="mr-2.5 bg-neutral-500 group-hover:bg-neutral-700 transition-colors duration-200"
                    />
                    <div className="flex flex-col">
                      <span className="text-base font-bold">Playlist</span>
                      <span className="text-sm text-neutral-400">
                        Tạo danh sách phát gồm bài hát hoặc tập
                      </span>
                    </div>
                  </li>
                  <li
                    className="group px-2.5 py-2 text-white hover:bg-neutral-700 cursor-pointer rounded flex items-center m-0.5"
                    onClick={handleCreateAIPlaylist}
                    onMouseEnter={() => setIsAIPlaylistHovered(true)}
                    onMouseLeave={() => setIsAIPlaylistHovered(false)}
                  >
                    <NavItem
                      icon="/icon/AddPlaylist.png"
                      hoverIcon="/icon/AddPlaylist_Green.png"
                      activeStyle="none"
                      hoverRotateDegree={10}
                      isParentHovered={isAIPlaylistHovered}
                      className="mr-2.5 bg-neutral-500 group-hover:bg-neutral-700 transition-colors duration-200"
                    />
                    <div className="flex flex-col">
                      <span className="text-base font-bold">Playlist AI</span>
                      <span className="text-sm text-neutral-400">
                        Tạo danh sách phát thông minh với AI
                      </span>
                    </div>
                  </li>
                  <hr className="mx-3.5 my-1 opacity-500" />
                  <li
                    className="group px-2.5 py-2 text-white hover:bg-neutral-700 cursor-pointer rounded flex items-center m-0.5"
                    onClick={handleCreateFolder}
                    onMouseEnter={() => setIsFolderHovered(true)}
                    onMouseLeave={() => setIsFolderHovered(false)}
                  >
                    <NavItem
                      icon="/icon/Folder.png"
                      hoverIcon="/icon/Folder_Green.png"
                      activeStyle="none"
                      hoverRotateDegree={10}
                      isParentHovered={isFolderHovered}
                      className="mr-2.5 my-0 bg-neutral-500 group-hover:bg-neutral-700 transition-colors duration-200"
                    />
                    <div className="flex flex-col">
                      <span className="text-base font-bold">Thư mục</span>
                      <span className="text-sm text-neutral-400">
                        Sắp xếp danh sách phát của bạn
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Các tab điều hướng */}
        <div className="flex flex-nowrap overflow-x-auto space-x-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <NavItem
            text="Danh sách phát"
            active={activeTab === 'Danh sách phát'}
            activeStyle="default"
            onClick={() => setActiveTab('Danh sách phát')}
            className="py-1 flex-shrink-0"
          />
          <NavItem
            text="Album"
            active={activeTab === 'Album'}
            activeStyle="default"
            onClick={() => setActiveTab('Album')}
            className="py-1 flex-shrink-0"
          />
          <NavItem
            text="Nghệ sĩ"
            active={activeTab === 'Nghệ sĩ'}
            activeStyle="default"
            onClick={() => setActiveTab('Nghệ sĩ')}
            className="py-1 flex-shrink-0"
          />
          <NavItem
            text="Podcast và chương trình"
            active={activeTab === 'Podcast'}
            activeStyle="default"
            onClick={() => setActiveTab('Podcast')}
            className="py-1 flex-shrink-0"
          />
        </div>
      </div>

      {/* Body - Phần cuộn độc lập */}
      <div className="flex-1 overflow-y-auto scrollbar scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-neutral-600 scrollbar-width-thin transition-all duration-300">
        {activeTab === 'Danh sách phát' && (
          <ul className="mt-4">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  setPlaylists={setPlaylists}
                  playlists={playlists}
                />
              ))
            ) : (
              <p className="text-neutral-400">Chưa có danh sách phát nào.</p>
            )}
          </ul>
        )}
        {activeTab === 'Album' && (
          <ul className="mt-4">
            {Array.isArray(libraryAlbums) && libraryAlbums.length > 0 ? (
              libraryAlbums.map((album) => (
                <li
                  key={album.id}
                  className="flex items-center p-2 hover:bg-neutral-700 cursor-pointer rounded"
                  onClick={() => handleAlbumClick(album.id)}
                >
                  <img
                    src={album.image || '/img/null.png'}
                    alt={album.name}
                    className="w-10 h-10 rounded mr-3"
                  />
                  <span className="text-white">{album.name}</span>
                </li>
              ))
            ) : (
              <p className="text-neutral-400">Chưa có album nào trong thư viện.</p>
            )}
          </ul>
        )}
        {activeTab === 'Nghệ sĩ' && (
          <p className="text-neutral-400">Danh sách nghệ sĩ sẽ hiển thị ở đây.</p>
        )}
        {activeTab === 'Podcast' && (
          <p className="text-neutral-400">Danh sách podcast sẽ hiển thị ở đây.</p>
        )}
      </div>
    </div>
  );
}

export default SideBar;