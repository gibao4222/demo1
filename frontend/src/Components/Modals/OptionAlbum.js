import { useState, useRef, useEffect } from "react";
import { FaPlus, FaChevronRight, FaCheckCircle } from "react-icons/fa"; // Thêm FaCheckCircle
import { useAuth } from '../../context/AuthContext';
import { getPlaylists, createPlaylist, addSongToPlaylist } from '../../Services/PlaylistService';
import { updateAlbumLibraryStatus } from '../../Services/AlbumService';

const OptionAlbum = ({ onClose, position, tracks, albumData }) => {
    const { token, user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const modalRef = useRef(null);
    const playlistRef = useRef(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user || !user.id_spotify_user) {
                console.error('Thiếu thông tin user hoặc id_spotify_user:', user);
                setPlaylists([]);
                return;
            }
    
            setLoading(true);
            try {
                const data = await getPlaylists(token, user.id_spotify_user);
                if (!Array.isArray(data) || data.length === 0) {
                    setPlaylists([]);
                    console.error('Không có danh sách phát nào cho user hiện tại.');
                    return;
                }
                // Lọc playlist dựa trên id_spotify_user
                const filteredPlaylists = data.filter(
                    playlist => playlist.id_user === user.id_spotify_user
                );
                setPlaylists([...filteredPlaylists]);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách phát:', error);
                alert('Không thể tải danh sách phát. Vui lòng thử lại sau.');
                setPlaylists([]);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlaylists(); 
    }, [token, user]);

    const handleCreatePlaylist = async () => {
        try {
            if (!user || !user.user_id) {
                setError("Thiếu thông tin người dùng");
                return;
            }

            const newPlaylistName = `Danh sách phát của tôi #${playlists.length + 1}`;
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
            window.dispatchEvent(new Event('playlistUpdated'));
            setIsPlaylistOpen(false);
            setIsOpen(false);
            onClose();
        } catch (error) {
            setError("Không thể tạo danh sách phát");
            console.error('Lỗi khi tạo danh sách phát:', error.response?.data || error.message);
        }
    };

    const handleAddSongsToPlaylist = async (playlistId) => {
        if (!tracks || tracks.length === 0) {
            setError("Không có bài hát nào để thêm");
            alert("Không có bài hát nào để thêm");
            return;
        }

        try {
            for (const track of tracks) {
                await addSongToPlaylist(playlistId, track.id_song.id, token);
            }
            alert(`Đã thêm ${tracks.length} bài hát vào danh sách phát`);
            window.dispatchEvent(new Event('songsUpdated'));
            setIsPlaylistOpen(false);
            setIsOpen(false);
            onClose();
        } catch (error) {
            setError("Không thể thêm bài hát vào danh sách phát");
            alert("Không thể thêm bài hát vào danh sách phát");
            console.error('Lỗi khi thêm bài hát:', error.response?.data || error.message);
        }
    };

    const handleAddToLibrary = async () => {
        try {
            await updateAlbumLibraryStatus(token, albumData.id, true);
            alert(`Đã thêm album ${albumData.name} vào Thư viện`);
            window.dispatchEvent(new Event('libraryUpdated'));
            setIsOpen(false);
            onClose();
        } catch (error) {
            alert("Không thể thêm album vào thư viện");
            console.error('Lỗi khi thêm album vào thư viện:', error);
        }
    };

    const handleRemoveFromLibrary = async () => {
        try {
            await updateAlbumLibraryStatus(token, albumData.id, false);
            alert(`Đã xóa album ${albumData.name} khỏi Thư viện`);
            window.dispatchEvent(new Event('libraryUpdated'));
            setIsOpen(false);
            onClose();
        } catch (error) {
            alert("Không thể xóa album khỏi thư viện");
            console.error('Lỗi khi xóa album khỏi thư viện:', error);
        }
    };

    const filteredPlaylists = playlists.filter((p) =>
        (p.name || '').toLowerCase().includes(search.toLowerCase())
    );

    // Đóng toàn bộ menu khi click ra ngoài
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

    // Đóng menu phụ khi rê chuột ra ngoài cả menu chính và menu phụ
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
                    className="absolute z-50"
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
                                <button
                                    onClick={albumData.isInLibrary ? handleRemoveFromLibrary : handleAddToLibrary}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] rounded flex items-center gap-2"
                                >
                                    {albumData.isInLibrary ? (
                                        <FaCheckCircle className="text-base text-green-500" />
                                    ) : (
                                        <FaPlus className="text-xs" />
                                    )}
                                    <span>{albumData.isInLibrary ? "Xóa khỏi Thư viện" : "Thêm vào Thư viện"}</span>
                                </button>
                            </li>
                            <li>
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsPlaylistOpen(true)}
                                >
                                    <button
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] rounded flex items-center justify-between"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="w-[12px] h-[12px] invisible">
                                                <FaPlus className="text-xs" />
                                            </span>
                                            <span>Thêm vào danh sách phát</span>
                                        </span>
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                    {isPlaylistOpen && (
                                        <div
                                            ref={playlistRef}
                                            className="absolute left-full bottom-0 ml-1 w-48 bg-[#282828] rounded-md shadow-lg z-50"
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
                                                            className="p-2 hover:bg-[#3e3e3e] cursor-pointer flex items-center gap-2 text-sm"
                                                        >
                                                            <FaPlus className="text-xs" /> Danh sách phát mới
                                                        </li>
                                                        <li className="p-2 text-sm text-gray-400">Không tìm thấy danh sách phát</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li
                                                            onClick={handleCreatePlaylist}
                                                            className="p-2 hover:bg-[#3e3e3e] cursor-pointer flex items-center gap-2 text-sm"
                                                        >
                                                            <FaPlus className="text-xs" /> Danh sách phát mới
                                                        </li>
                                                        {filteredPlaylists.map((playlist) => (
                                                            <li
                                                                key={playlist.id}
                                                                onClick={() => handleAddSongsToPlaylist(playlist.id)}
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
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionAlbum;