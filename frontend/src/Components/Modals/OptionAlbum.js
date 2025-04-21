import { useState, useRef, useEffect } from "react";
import { FaPlus, FaChevronRight } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import { getPlaylists, createPlaylist } from '../../Services/PlaylistService';

const OptionAlbum = ({ onClose, position }) => {
    const { token, user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const modalRef = useRef(null);
    const playlistRef = useRef(null);

    // Lấy danh sách playlists từ API
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!token) {
                setError("Thiếu token xác thực");
                return;
            }

            setLoading(true);
            try {
                const data = await getPlaylists(token);
                setPlaylists(data.map(playlist => playlist.name));
            } catch (err) {
                setError("Không thể tải danh sách phát");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [token]);

    // Xử lý tạo playlist mới
    const handleCreatePlaylist = async () => {
        try {
            if (!user || !user.user_id) {
                setError("Thiếu thông tin người dùng");
                return;
            }

            // Tạo tên playlist mới dựa trên số thứ tự
            const maxId = playlists.length > 0 ? playlists.length : 0;
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

            // Gọi API để tạo playlist mới
            const newPlaylist = await createPlaylist(playlistData, token);

            // Cập nhật danh sách playlists trong menu phụ
            setPlaylists([...playlists, newPlaylist.name]);

            // Kích hoạt sự kiện playlistUpdated để SideBar làm mới danh sách
            window.dispatchEvent(new Event('playlistUpdated'));

            // Đóng menu phụ và modal
            setIsPlaylistOpen(false);
            setIsOpen(false);
            onClose();
        } catch (error) {
            setError("Không thể tạo danh sách phát");
            console.error('Lỗi khi tạo danh sách phát:', error.response?.data || error.message);
        }
    };

    const filteredPlaylists = playlists.filter((p) =>
        p.toLowerCase().includes(search.toLowerCase())
    );

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
                                <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] rounded flex items-center gap-2">
                                    <FaPlus className="text-xs" />
                                    <span>Thêm vào Thư viện</span>
                                </button>
                            </li>
                            <li>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsPlaylistOpen(true)}
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
                                                        {filteredPlaylists.map((playlist, index) => (
                                                            <li
                                                                key={index}
                                                                className="p-2 hover:bg-[#3e3e3e] cursor-pointer text-sm"
                                                            >
                                                                {playlist}
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