import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaPlay } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getAlbumById, getAlbumSongById } from '../../Services/AlbumService';
import AlbumHeader from './AlbumHeader';
import SongTable from './AlbumSong';

const AlbumDetail = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { id } = useParams();
    const controlsRef = useRef(null);
    const [isSticky, setIsSticky] = useState(false);

    // State để lưu dữ liệu từ API
    const [albumData, setAlbumData] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Trạng thái
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [hoveredTrackId, setHoveredTrackId] = useState(null);
    const [totalDuration, setTotalDuration] = useState(0);

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchData = async () => {
            if (!token || !id) {
                setError('Thiếu token hoặc albumId');
                setLoading(false);
                return;
            }

            try {
                // Lấy thông tin album
                const albumResponse = await getAlbumById(token, id);
                console.log('Dữ liệu album từ API:', albumResponse);
                setAlbumData(albumResponse);

                // Lấy danh sách bài hát của album
                const albumSongsResponse = await getAlbumSongById(token, id);
                console.log('Dữ liệu bài hát từ API:', albumSongsResponse);

                // Kiểm tra và gán dữ liệu tracks
                if (albumSongsResponse && Array.isArray(albumSongsResponse)) {
                    setTracks(albumSongsResponse);
                } else {
                    setTracks([]);
                }

                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu:', err);
                setError('Không thể lấy dữ liệu album');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

    // Hàm formatTime
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    // Xử lý khi durations thay đổi
    const handleDurationsChange = (durations) => {
        const total = Object.values(durations).reduce((sum, duration) => {
            return sum + (duration || 0);
        }, 0);
        setTotalDuration(total);
    };

    // Theo dõi vị trí cuộn để hiển thị thanh sticky
    useEffect(() => {
        const handleScroll = () => {
            if (controlsRef.current) {
                const controlsPosition = controlsRef.current.getBoundingClientRect();
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

    // Xử lý lỗi hình ảnh
    const handleImageError = () => {
        console.error('Không thể tải hình ảnh:', albumData?.image);
        setImageError(true);
    };

    // Component modal ảnh lớn sử dụng Portal
    const ImageModal = () => {
        return createPortal(
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                onClick={() => setIsImageModalOpen(false)}
            >
                <div className="relative">
                    <img
                        src={imageError ? '/img/null.png' : albumData.image}
                        alt="Ảnh bìa album lớn"
                        className="w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] object-contain rounded"
                        onError={handleImageError}
                    />
                </div>
            </div>,
            document.body
        );
    };

    // Nếu đang tải dữ liệu
    if (loading) {
        return <div className="text-white">Đang tải...</div>;
    }

    // Nếu có lỗi
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    // Nếu không có dữ liệu
    if (!albumData || !tracks) {
        return <div className="text-white">Không tìm thấy dữ liệu album</div>;
    }

    return (
        <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)]">
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
                        <h2 className="text-lg font-bold text-white">{albumData.name}</h2>
                    </div>
                )}

                {/* Phần đầu album và nút điều khiển */}
                <AlbumHeader
                    tracks={tracks}
                    albumData={albumData}
                    imageError={imageError}
                    setImageError={setImageError}
                    isHovered={isHovered}
                    setIsHovered={setIsHovered}
                    isOptionOpen={isOptionOpen}
                    setIsOptionOpen={setIsOptionOpen}
                    modalPosition={modalPosition}
                    setModalPosition={setModalPosition}
                    isImageModalOpen={isImageModalOpen}
                    setIsImageModalOpen={setIsImageModalOpen}
                    controlsRef={controlsRef}
                    totalDuration={totalDuration}
                    formatTime={formatTime}
                />

                {/* Hiển thị modal ảnh lớn bằng Portal */}
                {isImageModalOpen && <ImageModal />}

                {/* Bảng danh sách bài hát */}
                <SongTable
                    tracks={tracks}
                    albumData={albumData}
                    hoveredTrackId={hoveredTrackId}
                    setHoveredTrackId={setHoveredTrackId}
                    onDurationsChange={handleDurationsChange}
                />
            </div>
        </div>
    );
};

export default AlbumDetail;