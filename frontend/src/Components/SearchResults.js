import React, { useState, useEffect } from 'react';
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { getPlaylists, addSongToPlaylist } from '../Services/PlaylistService';
import { useAuth } from '../context/AuthContext';

const SearchResults = ({ topResult, songs, playlists, albums }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    // Gọi API để lấy danh sách phát khi component mount
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!token) {
                setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
                return;
            }
            setLoading(true);
            try {
                const data = await getPlaylists(token);
                setUserPlaylists(data);
                setError(null);
            } catch (err) {
                setError('Không thể tải danh sách phát. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [token]);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePlaylistClick = (playlist) => {
        navigate(`/PlaylistDetail/${playlist.id}`, { state: { playlist } });
    };

    // Toggle dropdown cho bài hát cụ thể
    const toggleDropdown = (songId) => {
        setDropdownOpen(dropdownOpen === songId ? null : songId);
    };

    // Xử lý thêm bài hát vào danh sách phát
    const addToPlaylist = async (song, playlist) => {
        if (!token) {
            alert('Vui lòng đăng nhập để thêm bài hát vào danh sách phát.');
            setDropdownOpen(null);
            return;
        }
        try {
            await addSongToPlaylist(playlist.id, song.id, token);
            alert(`Đã thêm "${song.name}" vào "${playlist.name}" thành công!`);
            setDropdownOpen(null);
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào danh sách phát:', error);
            const errorMessage = error.response?.data?.message || 'Không thể thêm bài hát vào danh sách phát. Vui lòng thử lại.';
            alert(errorMessage);
        }
    };

    return (
        <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-4xl">
            {/* Tiêu đề "Kết quả hàng đầu" */}
            <h2 className="text-xl font-semibold mb-4">Kết quả hàng đầu</h2>

            {/* Phần Top Result */}
            {topResult && (
                <div className="flex items-center mb-6 cursor-pointer"
                    onClick={() => topResult.type === 'Playlist' && handlePlaylistClick(topResult)}>
                    <img
                        src={topResult.image}
                        alt={topResult.name}
                        className="w-32 h-32 rounded mr-4"
                    />
                    <div>
                        <h3 className="text-3xl font-bold">{topResult.name}</h3>
                        <p className="text-gray-400">
                            {topResult.type} • {topResult.artist || 'Không rõ'}
                        </p>
                    </div>
                </div>
            )}

            {/* Tiêu đề "Bài hát" */}
            <h2 className="text-xl font-semibold mb-4">Bài hát</h2>
            <div className="space-y-2">
                {songs && songs.length > 0 ? (
                    songs.slice(0, 4).map((song) => (
                        <div
                            key={song.id}
                            className={`flex items-center justify-between p-2 rounded hover:bg-gray-700 ${song.isPlaying ? 'bg-gray-600' : ''}`}
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={song.image || '/default-song.jpg'}
                                    alt={song.name}
                                    className="w-12 h-12 rounded"
                                />
                                <div>
                                    <p className="text-white font-medium">{song.name}</p>
                                    <p className="text-gray-400 text-sm">{song.artist || 'Không rõ'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 relative">
                                {song.isPlaying && <span className="text-green-500">✓</span>}
                                <span className="text-gray-400">{song.duration || '3:00'}</span>
                                <button
                                    className="text-gray-400 hover:text-white text-xl"
                                    onClick={() => toggleDropdown(song.id)}
                                    disabled={loading} // Vô hiệu hóa khi đang tải
                                >
                                    <IoMdAdd />
                                </button>
                                {/* Dropdown Menu */}
                                {dropdownOpen === song.id && (
                                    <div className="absolute right-0 top-8 bg-gray-700 rounded shadow-lg z-10 w-48">
                                        <div className="p-2">
                                            <p className="text-white font-medium mb-2">Thêm vào danh sách phát</p>
                                            {loading ? (
                                                <p className="text-gray-400">Đang tải...</p>
                                            ) : error ? (
                                                <p className="text-red-400">{error}</p>
                                            ) : userPlaylists.length > 0 ? (
                                                userPlaylists.map((playlist) => (
                                                    <button
                                                        key={playlist.id}
                                                        className="block w-full text-left px-2 py-1 text-gray-200 hover:bg-gray-600 rounded"
                                                        onClick={() => addToPlaylist(song, playlist)}
                                                    >
                                                        {playlist.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-gray-400">Không có danh sách phát</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Không tìm thấy bài hát</p>
                )}
            </div>

            {/* Tiêu đề "Playlist" */}
            <h2 className="text-xl font-semibold mb-4 mt-6">Playlist</h2>
            <div className="space-y-2">
                {playlists && playlists.length > 0 ? (
                    playlists.slice(0, 4).map((playlist) => (
                        <div
                            key={playlist.id}
                            className={`flex items-center justify-between p-2 rounded hover:bg-gray-700 ${playlist.isPlaying ? 'bg-gray-600' : ''} cursor-pointer`}
                            onClick={() => handlePlaylistClick(playlist)}
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={playlist.image || '/default-playlist.jpg'}
                                    alt={playlist.name}
                                    className="w-12 h-12 rounded"
                                />
                                <div>
                                    <p className="text-white font-medium">{playlist.name}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Không tìm thấy playlist</p>
                )}
            </div>

            {/* Tiêu đề "Album" */}
            <h2 className="text-xl font-semibold mb-4 mt-6">Album</h2>
            <div className="space-y-2">
                {albums && albums.length > 0 ? (
                    albums.slice(0, 4).map((album) => (
                        <div
                            key={album.id}
                            className={`flex items-center justify-between p-2 rounded hover:bg-gray-700 ${album.isPlaying ? 'bg-gray-600' : ''}`}
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={album.image || '/default-album.jpg'}
                                    alt={album.name}
                                    className="w-12 h-12 rounded"
                                />
                                <div>
                                    <p className="text-white font-medium">{album.name}</p>
                                    <p className="text-gray-400 text-sm">{album.artist || 'Không rõ'}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Không tìm thấy album</p>
                )}
            </div>
        </div>
    );
};

export default SearchResults;