import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaylists, createPlaylist } from '../Services/PlaylistService';
import { useAuth } from '../context/AuthContext';
import PlaylistItem from './Playlist/PlaylistItem';

function SideBar() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = useCallback(async () => {
    console.log('fetchPlaylists called with token:', token);
    try {
      const data = await getPlaylists(token);
      console.log('Fetched playlists:', data);
      setPlaylists([...data]);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchPlaylists();
    } else {
      navigate('/login');
    }

    window.addEventListener('playlistUpdated', fetchPlaylists);

    return () => {
      window.removeEventListener('playlistUpdated', fetchPlaylists);
    };
  }, [token, fetchPlaylists, navigate]);

  const handleCreatePlaylist = async () => {
    try {
      if (!user) {
        console.error('User not logged in');
        navigate('/login');
        return;
      }

      if (!user.user_id) {
        console.error('User ID is missing:', user);
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
        id_user: user.user_id,
        is_active: true,
      };

      const newPlaylist = await createPlaylist(playlistData, token);
      console.log('Playlist created successfully:', newPlaylist);

      setPlaylists([...playlists, newPlaylist]);
      navigate(`/PlaylistDetail/${newPlaylist.id}`, {
        state: { playlist: newPlaylist },
      });
    } catch (error) {
      console.error('Failed to create playlist:', error.response?.data || error.message);
    }
  };

  return (
    <div className="w-2/7 bg-black p-4 sideBar sticky top-0 h-[calc(100vh-150px)] overflow-y-auto scrollbar scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-gray-600 scrollbar-width-thin">
      <div className="mb-8">
        <ul className="mt-8">
          <li className="mb-4 li-inline">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center cursor-pointer"
            >
              <img alt="Home" src="/icon/Home_Fill_S.png" className="w-6 h-6 mr-2" />
              Home
            </button>
          </li>
          <li className="mb-4 li-inline">
            <img alt="" src="/icon/Search_S.png" /> Search
          </li>
          <li className="mb-4 li-inline">
            <img alt="" src="/icon/Library_S.png" />
            Your Library
          </li>
        </ul>
      </div>
      <div className="mb-8">
        <ul>
          <li className="mb-4 li-inline">
            <button
              onClick={handleCreatePlaylist}
              className="flex items-center cursor-pointer"
            >
              <img alt="Create Playlist" src="/icon/+Library_S.png" className="w-6 h-6 mr-2" />
              Create Playlist
            </button>
          </li>
          <li className="mb-4 li-inline">
            <img alt="" src="/icon/LikedSongs_S.png" />
            Liked Songs
          </li>
          <hr />
        </ul>
      </div>
      <div className="mt-6">
        {playlists.length > 0 ? (
          <ul className="mt-4">
            {playlists.map((playlist) => (
              <PlaylistItem key={playlist.id} playlist={playlist} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 mt-4">Chưa có danh sách phát nào.</p>
        )}
      </div>
    </div>
  );
}

export default SideBar;