import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OptionPlaylist from '../Modals/OptionPlaylist';
import { deletePlaylist } from '../../Services/PlaylistService';
import { useAuth } from '../../context/AuthContext';

const PlaylistItem = ({ playlist, setPlaylists, playlists }) => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    // Click chuột trái: Điều hướng tới /create
    const handleLeftClick = () => {
        navigate('/create', { state: { playlist } });
    };

    // Click chuột phải: Hiển thị modal
    const handleRightClick = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setModalPosition({
            top: rect.bottom + window.scrollY - 50,
            left: rect.left + window.scrollX + 100,
        });
        setIsOptionOpen(true);
    };

    // Xử lý chỉnh sửa playlist
    const handleEdit = () => {
        navigate('/create', { state: { playlist } });
        setIsOptionOpen(false);
    };

    // Xử lý xóa playlist
    const handleDelete = async () => {
        try {
            await deletePlaylist(playlist.id, token);
            console.log('Playlist deleted successfully');
            setPlaylists(playlists.filter(p => p.id !== playlist.id));
            setIsOptionOpen(false);
        } catch (error) {
            console.error('Failed to delete playlist:', error);
            alert('Có lỗi xảy ra khi xóa playlist. Vui lòng thử lại.');
        }
    };

    return (
        <li
            className="p-3 flex items-center hover:bg-neutral-800 cursor-pointer transition-colors duration-200"
            onClick={handleLeftClick}
            onContextMenu={handleRightClick}
        >
            <div className="flex items-center w-full">
                <img
                    src={playlist.image || '/img/null.png'}
                    alt={playlist.name}
                    className="w-12 h-12 mr-4 rounded"
                />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm">Playlist</p>
                </div>
            </div>

            {/* Tích hợp OptionPlaylist */}
            <OptionPlaylist
                isOptionOpen={isOptionOpen}
                setIsOptionOpen={setIsOptionOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
                modalPosition={modalPosition}
            />
        </li>
    );
};

export default PlaylistItem;