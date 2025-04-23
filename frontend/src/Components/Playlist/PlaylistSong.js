import React, { useEffect, useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { FiClock } from "react-icons/fi";
import { RiDeleteBin6Line } from 'react-icons/ri';
import { getSongPlaylist, getSongById, deleteSongFromPlaylist } from '../../Services/PlaylistService';

const PlaylistSong = ({ playlist, token }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredSongId, setHoveredSongId] = useState(null);

    const fetchSongs = async () => {
        if (!playlist?.id || !token) {
            console.error('Thiếu ID playlist hoặc token:', { playlistId: playlist?.id, token });
            setError('Không có thông tin playlist hoặc token.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const playlistSongs = await getSongPlaylist(playlist.id, token);
            console.log('Danh sách bài hát:', playlistSongs);

            if (!Array.isArray(playlistSongs)) {
                console.error('Dữ liệu bài hát không phải mảng:', playlistSongs);
                setError('Dữ liệu bài hát không hợp lệ.');
                setLoading(false);
                return;
            }

            if (playlistSongs.length === 0) {
                console.log('Không tìm thấy bài hát cho playlist ID:', playlist.id);
                setSongs([]);
                setLoading(false);
                return;
            }

            // Loại bỏ bản ghi trùng lặp dựa trên id_song
            const uniqueSongs = Array.from(new Map(playlistSongs.map(item => [item.id_song, item])).values());

            const songDetailsPromises = uniqueSongs.map(async (item) => {
                try {
                    const song = await getSongById(item.id_song, token);
                    console.log(`Lấy thông tin bài hát id_song ${item.id_song}:`, song);
                    return {
                        playlistSongId: item.id, // ID của PlaylistSong
                        id: song.id,
                        title: song.name || 'Không rõ',
                        album: song.album || 'Không rõ',
                        artist: song.artist || 'Không rõ',
                        duration: song.duration || '--:--',
                        image: song.image || '/img/null.png',
                        dateAdded: item.date_added || 'Không rõ',
                    };
                } catch (songError) {
                    console.error(`Lỗi khi lấy thông tin bài hát id_song ${item.id_song}:`, songError);
                    return null;
                }
            });

            const fullSongs = (await Promise.all(songDetailsPromises)).filter(song => song !== null);
            console.log('Danh sách bài hát đã xử lý:', fullSongs);
            setSongs(fullSongs);

            if (fullSongs.length === 0) {
                setError('Không thể tải chi tiết bài hát. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách bài hát:', error);
            setError('Không thể tải danh sách bài hát. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, [playlist?.id, token]);

    const handleDeleteSong = async (playlistSongId) => {
        if (!playlistSongId || !token) {
            console.error('Thiếu playlistSongId hoặc token:', { playlistSongId, token });
            setError('Không thể xóa bài hát: thiếu thông tin.');
            return;
        }

        try {
            await deleteSongFromPlaylist(playlistSongId, token);
            console.log(`Xóa bài hát với playlistSongId ${playlistSongId} thành công`);
            // Làm mới danh sách bài hát
            await fetchSongs();
        } catch (error) {
            console.error(`Lỗi khi xóa bài hát với playlistSongId ${playlistSongId}:`, error);
            setError('Không thể xóa bài hát. Vui lòng thử lại.');
        }
    };

    return (
        <div className="mt-8">
            <p className="text-xl font-bold text-white mb-8">Danh sách bài hát</p>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : songs.length === 0 ? (
                <p className="text-gray-400">Không có bài hát nào trong danh sách phát này.</p>
            ) : (
                <table className="w-full text-sm text-gray-200">
                    <thead>
                        <tr className="text-gray-400 border-b border-neutral-700 bg-transparent">
                            <th className="py-2 px-2 text-left w-[5%] bg-transparent">#</th>
                            <th className="py-2 px-2 text-left w-[35%] bg-transparent">Tiêu đề</th>
                            <th className="py-2 px-2 text-left w-[25%] bg-transparent">Album</th>
                            <th className="py-2 px-2 text-left w-[15%] bg-transparent">Ngày thêm</th>
                            <th className="py-2 px-2 text-right w-[10%] bg-transparent">
                                <div className="flex justify-end">
                                    <FiClock />
                                </div>
                            </th>
                            <th className="py-2 px-2 text-center w-[10%] bg-transparent"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map((song, index) => (
                            <tr
                                key={song.id}
                                className="hover:bg-neutral-800 rounded"
                                onMouseEnter={() => setHoveredSongId(song.id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                            >
                                <td className="py-3 px-2">
                                    <div className="flex items-center">
                                        {hoveredSongId === song.id ? (
                                            <FaPlay className="mr-2 text-gray-200" />
                                        ) : (
                                            <span className="mr-2">{index + 1}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center">
                                        <img src={song.image} alt={song.title} className="w-10 h-10 rounded mr-3" />
                                        <div>
                                            <p className="text-white font-medium">{song.title}</p>
                                            <p className="text-gray-400 text-xs">{song.artist}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2">{song.album}</td>
                                <td className="py-3 px-2">{song.dateAdded}</td>
                                <td className="py-3 px-2 text-right">{song.duration}</td>
                                <td className="py-3 px-2 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        {hoveredSongId === song.id && (
                                            <RiDeleteBin6Line
                                                className="text-gray-200 cursor-pointer"
                                                onClick={() => handleDeleteSong(song.playlistSongId)}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PlaylistSong;