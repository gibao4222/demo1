import { useState, useRef, useEffect } from "react";
import { FaPlus, FaHeart, FaUser } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import { getPlaylists, createPlaylist, addSongToPlaylist } from '../../Services/PlaylistService';
import { useNavigate } from 'react-router-dom';

const OptionSongAlbum = ({ onClose, position, trackId, albumData }) => {
    const { token, user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const modalRef = useRef(null);
    const playlistRef = useRef(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!token) {
                setError("Thiếu token xác thực");
                console.log('Hiển thị alert error: Thiếu token xác thực');
                alert("Thiếu token xác thực");
                return;
            }

            setLoading(true);
            try {
                const data = await getPlaylists(token);
                setPlaylists(data);
            } catch (err) {
                setError("Không thể tải danh sách phát");
                console.log('Hiển thị alert error: Không thể tải danh sách phát');
                alert("Không thể tải danh sách phát");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [token]);

    const handleCreatePlaylist = async () => {
        try {
            if (!user || !user.user_id) {
                setError("Thiếu thông tin người dùng");
                console.log('Hiển thị alert error: Thiếu thông tin người dùng');
                alert("Thiếu thông tin người dùng");
                return;
            }

            if (!trackId || !token) {
                setError("Thiếu thông tin bài hát hoặc token");
                console.log('Hiển thị alert error: Thiếu thông tin bài hát hoặc token');
                alert("Thiếu thông tin bài hát hoặc token");
                return;
            }

            const currentDate = new Date().toISOString().split('T')[0];

            const playlistData = {
                name: albumData.name,
                description: 'Thêm phần mô tả không bắt buộc',
                image: albumData.image || '/img/null.png',
                create_date: currentDate,
                id_user: user.user_id,
                is_active: true,
            };

            // Tạo playlist mới
            const newPlaylist = await createPlaylist(playlistData, token);
            setPlaylists([...playlists, newPlaylist]);

            // Thêm bài hát vừa chọn (trackId) vào playlist mới
            await addSongToPlaylist(newPlaylist.id, trackId, token);

            window.dispatchEvent(new Event('playlistUpdated'));
            console.log('Hiển thị alert success: Đã tạo danh sách phát mới và thêm bài hát');
            alert("Đã tạo danh sách phát mới và thêm bài hát");
            setIsPlaylistOpen(false);
            setIsOpen(false);
            onClose();
        } catch (error) {
            setError("Không thể tạo danh sách phát hoặc thêm bài hát");
            console.log('Hiển thị alert error:', error.response?.data?.error || "Không thể tạo danh sách phát hoặc thêm bài hát");
            alert(error.response?.data?.error || "Không thể tạo danh sách phát hoặc thêm bài hát");
            console.error('Lỗi khi tạo danh sách phát hoặc thêm bài hát:', error.response?.data || error.message);
        }
    };

    const handleAddSongToPlaylist = async (playlistId) => {
        if (!playlistId || !trackId || !token) {
            setError("Thiếu thông tin playlist hoặc bài hát");
            console.log('Hiển thị alert error: Thiếu thông tin playlist hoặc bài hát');
            alert("Thiếu thông tin playlist hoặc bài hát");
            return;
        }

        try {
            await addSongToPlaylist(playlistId, trackId, token);
            console.log('Hiển thị alert success: Đã thêm bài hát vào playlist');
            alert("Đã thêm bài hát vào playlist");
            setIsPlaylistOpen(false);
            setIsOpen(false);
            onClose();
        } catch (error) {
            setError("Không thể thêm bài hát vào playlist");
            console.log('Hiển thị alert error:', error.response?.data?.error || "Không thể thêm bài hát vào playlist");
            alert(error.response?.data?.error || "Không thể thêm bài hát vào playlist");
            console.error('Lỗi khi thêm bài hát:', error.response?.data || error.message);
        }
    };

    const filteredPlaylists = playlists.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleNavigateToSinger = () => {
        navigate('/home');
        setIsOpen(false);
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target) &&
                (!playlistRef.current || !playlistRef.current.contains(event.target))
            ) {
                setIsOpen(false);
                setIsPlaylistOpen(false);
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target) &&
                playlistRef.current &&
                !playlistRef.current.contains(event.target)
            ) {
                setIsPlaylistOpen(false);
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div>
            {isOpen && (
                <div
                    className="absolute z-[1000]"
                    style={{
                        top: position?.top || 0,
                        left: position?.left || 0,
                    }}
                >
                    <div
                        ref={modalRef}
                        className="bg-[#282828] text-white rounded-md p-2 w-[250px] shadow-lg"
                    >
                        <ul className="space-y-1">
                            <li>
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsPlaylistOpen(true)}
                                >
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] rounded flex items-center gap-4">
                                        <FaPlus className="text-xs" />
                                        <span>Thêm vào danh sách phát</span>
                                    </button>
                                    {isPlaylistOpen && (
                                        <div
                                            ref={playlistRef}
                                            className="absolute right-full bottom-0 ml-1 w-48 bg-[#282828] rounded-md shadow-lg z-[1000]"
                                        >
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Tìm danh sách phát"
                                                className="w-full p-2 bg-[#3e3e3e] text-white text-sm rounded-t outline-none placeholder-gray-400"
                                            />
                                            <ul className="min-h-[150px] max-h-48 overflow-y-auto divide-y divide-[#3e3e3e]">
                                                {loading ? (
                                                    <li className="p-2 text-sm">Đang tải...</li>
                                                ) : error ? (
                                                    <li className="p-2 text-sm text-red-400">{error}</li>
                                                ) : filteredPlaylists.length === 0 ? (
                                                    <>
                                                        <li
                                                            onClick={handleCreatePlaylist}
                                                            className="p-2 hover:bg-[#3e3e3e] cursor-pointer flex items-center gap-4 text-sm"
                                                        >
                                                            <FaPlus className="text-xs" />
                                                            <span>Danh sách phát mới</span>
                                                        </li>
                                                        <li className="p-2 text-sm text-gray-400">Không tìm thấy danh sách phát</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li
                                                            onClick={handleCreatePlaylist}
                                                            className="p-2 hover:bg-[#3e3e3e] cursor-pointer flex items-center gap-4 text-sm"
                                                        >
                                                            <FaPlus className="text-xs" />
                                                            <span>Danh sách phát mới</span>
                                                        </li>
                                                        {filteredPlaylists.map((playlist) => (
                                                            <li
                                                                key={playlist.id}
                                                                onClick={() => handleAddSongToPlaylist(playlist.id)}
                                                                className="p-2 hover:bg-[#3e3e3e] cursor-pointer text-sm"
                                                            >
                                                                {playlist.name}
                                                            </li>
                                                        ))}
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </li>
                            <li>
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] rounded flex items-center gap-4">
                                    <FaHeart className="text-xs" />
                                    <span>Lưu vào Bài hát đã thích</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleNavigateToSinger}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] rounded flex items-center gap-4"
                                >
                                    <FaUser className="text-xs" />
                                    <span>Chuyển tới nghệ sĩ</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionSongAlbum;