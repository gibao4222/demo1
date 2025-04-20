import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlay, FaPlus, FaEllipsisH, FaList } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OptionAlbum from './Modals/OptionAlbum';

const AlbumDetail = ({ album, tracks: initialTracks }) => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const optionsButtonRef = useRef(null);
    const controlsRef = useRef(null); // Ref để theo dõi vị trí của phần nút điều khiển
    const [isSticky, setIsSticky] = useState(false); // Trạng thái để hiển thị thanh sticky

    // Dữ liệu album mặc định
    const defaultAlbum = useMemo(
        () => ({
            id: null,
            title: 'Ai Cũng Phải Bắt Đầu Từ Đâu Đó',
            artist: 'HIEUTHUHAI',
            year: '2023',
            trackCount: '13 bài hát',
            duration: '39 phút 44 giây',
            cover: 'https://storage.googleapis.com/a1aa/image/d15a06a1-8f32-4027-fad9-abfb597d894d.jpg',
            artistIcon: 'https://storage.googleapis.com/a1aa/image/c97297ef-8a21-49e5-daef-aa87ddef91fc.jpg',
            currentTrackThumbnail: 'https://storage.googleapis.com/a1aa/image/6eab2f22-1d30-4476-06ec-8c9858095b49.jpg',
        }),
        []
    );

    // Dữ liệu bài hát mặc định
    const defaultTracks = useMemo(
        () => [
            {
                id: 1,
                title: 'Ai Cũng Phải Bắt Đầu Từ Đâu Đó',
                artist: 'HIEUTHUHAI',
                duration: '2:18',
                explicit: true,
                thumbnail: 'https://storage.googleapis.com/a1aa/image/6eab2f22-1d30-4476-06ec-8c9858095b49.jpg',
            },
            {
                id: 2,
                title: 'Giờ Thì Ai Cười',
                artist: 'HIEUTHUHAI',
                duration: '3:05',
                explicit: false,
                thumbnail: '',
            },
        ],
        []
    );

    // Memoize dữ liệu album và tracks
    const albumData = useMemo(() => album || defaultAlbum, [album, defaultAlbum]);
    const tracks = useMemo(() => initialTracks || defaultTracks, [initialTracks, defaultTracks]);

    // Trạng thái
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [hoveredTrackId, setHoveredTrackId] = useState(null); // Theo dõi track đang được hover

    // Theo dõi vị trí cuộn để hiển thị thanh sticky
    useEffect(() => {
        const handleScroll = () => {
            if (controlsRef.current) {
                const controlsPosition = controlsRef.current.getBoundingClientRect();
                // Nếu phần nút điều khiển nằm ngoài tầm nhìn (top < 0), hiển thị thanh sticky
                setIsSticky(controlsPosition.top < 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Kiểm tra xác thực
    useEffect(() => {
        if (!user) {
            console.error('Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập');
            navigate('/login');
        }
    }, [user, navigate]);

    // Tìm kiếm bài hát
    useEffect(() => {
        const searchSongs = async () => {
            if (!searchTerm || !token) {
                setSearchResults([]);
                return;
            }

            try {
                const response = await axios.get(`/api/songs/songs/?search=${encodeURIComponent(searchTerm)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Kết quả tìm kiếm bài hát:', response.data);
                const filteredResults = response.data.filter(
                    (song) =>
                        (song.name && song.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                setSearchResults(filteredResults);
            } catch (error) {
                console.error('Lỗi khi tìm kiếm bài hát:', error);
                setSearchResults([]);
            }
        };

        const debounce = setTimeout(searchSongs, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, token]);

    // Xử lý lỗi hình ảnh
    const handleImageError = () => {
        console.error('Không thể tải hình ảnh:', albumData.cover);
        setImageError(true);
    };

    // Mở modal tùy chọn
    const handleOpenOptionModal = () => {
        if (optionsButtonRef.current) {
            const rect = optionsButtonRef.current.getBoundingClientRect();
            setModalPosition({
                top: rect.bottom + window.scrollY + 2,
                left: rect.left + window.scrollX + 30,
            });
        }
        setIsOptionOpen(true);
    };

    // Mở modal ảnh lớn
    const handleImageClick = () => {
        setIsImageModalOpen(true);
    };

    return (
        <div className="w-full p-6 bg-gradient-to-b from-[#2A2A2A] to-black text-white min-h-[calc(100vh-300px)] overflow-y-auto scrollbar scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
            {/* Thanh tiêu đề sticky */}
            {isSticky && (
                <div className="fixed top-0 left-[28.57%] right-0 w-5/7 bg-[#2A2A2A] z-50 border-b border-[#3A3A3A] px-6 py-3 flex items-center justify-start gap-4">
                    <button
                        aria-label="Phát nhạc"
                        className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center hover:bg-[#1db954] transition"
                    >
                        <FaPlay className="text-black text-sm" />
                    </button>
                    <h2 className="text-lg font-bold text-white">{albumData.title}</h2>
                </div>
            )}

            <div className="max-w-7xl mx-auto rounded-lg select-none">
                {/* Phần đầu album */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 bg-gradient-to-b from-[#3A3A3A] to-[#242424] rounded-lg p-6 md:p-8">
                    <div
                        className="relative w-48 h-48 shadow-2xl shadow-black rounded overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={handleImageClick}
                    >
                        <img
                            src={imageError ? '/img/null.png' : albumData.cover}
                            alt="Ảnh bìa album"
                            className="w-full h-full object-cover rounded"
                            onError={handleImageError}
                            width={200}
                            height={200}
                        />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <span className="text-xs font-semibold mb-1">Album</span>
                        <h1 className="font-extrabold text-3xl md:text-4xl leading-tight">{albumData.title}</h1>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#d9d9d9] font-semibold">
                            <span>{albumData.artist}</span>
                            <span>·</span>
                            <span>{albumData.year}</span>
                            <span>·</span>
                            <span>
                                {albumData.trackCount}, {albumData.duration}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nút điều khiển */}
                <div ref={controlsRef} className="flex items-center gap-4 mt-6">
                    <button
                        aria-label="Phát nhạc"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1ed760] flex items-center justify-center hover:bg-[#1db954] transition"
                    >
                        <FaPlay className="text-black text-lg md:text-xl" />
                    </button>
                    <button
                        aria-label="Thêm vào danh sách phát"
                        className="w-12 h-12 rounded-md flex items-center justify-center group"
                    >
                        <FaPlus className="text-white text-2xl transition group-hover:text-gray-100 group-hover:scale-110" />
                    </button>

                    <button
                        aria-label="Tùy chọn khác"
                        ref={optionsButtonRef}
                        onClick={handleOpenOptionModal}
                        className="w-12 h-12 rounded-md flex items-center justify-center group"
                    >
                        <FaEllipsisH className="text-white text-2xl transition group-hover:text-gray-100 group-hover:scale-110" />
                    </button>
                </div>

                {/* Component OptionAlbum */}
                {isOptionOpen && (
                    <OptionAlbum
                        onClose={() => setIsOptionOpen(false)}
                        position={modalPosition}
                    />
                )}

                {/* Modal ảnh lớn */}
                {isImageModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setIsImageModalOpen(false)}
                    >
                        <div className="relative">
                            <img
                                src={imageError ? '/img/null.png' : albumData.cover}
                                alt="Ảnh bìa album lớn"
                                className="w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] object-contain rounded"
                                onError={handleImageError}
                            />
                        </div>
                    </div>
                )}

                {/* Bảng danh sách bài hát */}
                <div className="mt-4">
                    <table className="w-full rounded-md text-white text-sm">
                        {/* Tiêu đề bảng */}
                        <thead>
                            <tr className="border-b border-[#2a2a2a] text-sm font-semibold text-gray-400">
                                <th className="py-2 px-2 text-center w-[10%] bg-transparent">#</th>
                                <th className="px-4 py-3 text-left bg-transparent">Tiêu đề</th>
                                <th className="px-4 py-3 text-right w-[10%] bg-transparent">
                                    <i className="far fa-clock"></i>
                                </th>
                            </tr>
                        </thead>
                        {/* Nội dung bảng */}
                        <tbody>
                            {tracks.map((track) => (
                                <tr
                                    key={track.id}
                                    className="hover:bg-neutral-800 rounded"
                                    onMouseEnter={() => setHoveredTrackId(track.id)}
                                    onMouseLeave={() => setHoveredTrackId(null)}
                                >
                                    <td className="px-4 py-3 w-[5%] text-center">
                                        {hoveredTrackId === track.id ? (
                                            <FaPlay className="text-[#1ed760] text-center text-sm" />
                                        ) : (
                                            <span className="text-white font-semibold select-none">
                                                {track.id}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white leading-tight">{track.title}</span>
                                            <span className="text-xs text-white font-semibold flex items-center gap-1 mt-0.5">
                                                {track.explicit && (
                                                    <span className="bg-white text-black rounded px-1.5 py-0.5 select-none text-[9px] font-bold">
                                                        E
                                                    </span>
                                                )}
                                                <span>{track.artist}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right w-[10%]">
                                        <span className="text-white font-semibold select-none">{track.duration}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Liên kết danh sách phát */}
                <div className="flex justify-end mt-4 text-[#7a0f00] text-xs font-semibold cursor-pointer select-none">
                    Danh sách
                    <FaList className="ml-1" />
                </div>
            </div>
        </div>
    );
};

export default AlbumDetail;