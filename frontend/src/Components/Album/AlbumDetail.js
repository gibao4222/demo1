import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPlay } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getAlbumById, getAlbumSongById } from '../../Services/AlbumService';
import AlbumHeader from './AlbumHeader';
import SongTable from './AlbumSong';
import axios from '../../axios';

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
    const [dominantColor, setDominantColor] = useState('#434343');
    const [isLoadingColor, setIsLoadingColor] = useState(true);

    const BACKEND_DOMAIN = 'https://localhost';

    const fetchData = useCallback(async () => {
        if (!token || !id) {
            setError('Thiếu token hoặc albumId');
            setLoading(false);
            return;
        }

        try {
            const albumResponse = await getAlbumById(token, id);
            console.log('Dữ liệu album từ API:', albumResponse);
            setAlbumData(albumResponse);

            const albumSongsResponse = await getAlbumSongById(token, id);
            console.log('Dữ liệu bài hát từ API:', albumSongsResponse);

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
    }, [token, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Lắng nghe sự kiện libraryUpdated để làm mới albumData
    useEffect(() => {
        window.addEventListener('libraryUpdated', fetchData);
        return () => {
            window.removeEventListener('libraryUpdated', fetchData);
        };
    }, [fetchData]);

    // Hàm chuyển đổi hex sang RGB
    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };

    // Hàm tạo màu RGBA từ hex và opacity
    const getRgbaColor = (hex, opacity) => {
        const { r, g, b } = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // Lấy mã màu chủ đạo từ ảnh bìa album
    useEffect(() => {
        const fetchDominantColor = async () => {
            setIsLoadingColor(true);
            if (imageError || !albumData?.image || albumData.image === '/img/null.png') {
                setDominantColor('#434343');
                setIsLoadingColor(false);
                return;
            }

            const apiImageUrl = albumData.image.startsWith('http')
                ? albumData.image
                : `${BACKEND_DOMAIN}${albumData.image}`;

            try {
                const response = await axios.get(`${BACKEND_DOMAIN}/api/playlists/get-dominant-color/`, {
                    params: { image_url: apiImageUrl },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.dominant_color) {
                    setDominantColor(response.data.dominant_color);
                } else if (response.data.error) {
                    console.error('Error fetching dominant color:', response.data.error);
                    setDominantColor('#434343');
                }
            } catch (error) {
                console.error('Failed to fetch dominant color:', error.response?.data?.error || error.message);
                setDominantColor('#434343');
            } finally {
                setIsLoadingColor(false);
            }
        };

        if (albumData?.image) {
            fetchDominantColor();
        }
    }, [albumData?.image, imageError, token]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

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
                setIsSticky(controlsPosition.top <= 64); // Điều chỉnh theo chiều cao NavBar (64px)
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!user) {
            console.error('Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập');
            navigate('/login');
        }
    }, [user, navigate]);

    const handleImageError = () => {
        console.error('Không thể tải hình ảnh:', albumData?.image);
        setImageError(true);
    };

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

    if (loading) {
        return <div className="text-white">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!albumData || !tracks) {
        return <div className="text-white">Không tìm thấy dữ liệu album</div>;
    }

    return (
        <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden">
            <div className="overflow-y-auto overlay-scroll">
                <div
                    className="p-6 pb-0 h-auto h-96" // Xóa h-96 để chiều cao tự động
                    style={{
                        background: `linear-gradient(to bottom, ${getRgbaColor(dominantColor, 1)}, ${getRgbaColor(dominantColor, 0)})`,
                    }}
                >
                    {isLoadingColor ? (
                        <p className="text-white text-xl">Đang tải album...</p>
                    ) : (
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
                            dominantColor={dominantColor}
                        />
                    )}
                </div>
                <div className="relative z-10 bg-gradient-to-b from-neutral-900/35 to-neutral-900/100">
                    
                        
                    {isSticky && (
                        <div className="fixed top-[64px] left-[calc(20%+6px)] w-[calc(60%-12px)] bg-[#2A2A2A] z-50 border-b border-[#3A3A3A] px-6 py-3 flex items-center justify-start gap-4">
                            <button
                                aria-label="Phát nhạc"
                                className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center hover:bg-[#1db954] transition"
                            >
                                <FaPlay className="text-black text-sm" />
                            </button>
                            <h2 className="text-lg font-bold text-white">{albumData.name}</h2>
                        </div>
                    )}
                    
                    
                    

                    {isImageModalOpen && <ImageModal />}

                    <div className="mt-4 px-6">
                        <SongTable
                            tracks={tracks}
                            albumData={albumData}
                            hoveredTrackId={hoveredTrackId}
                            setHoveredTrackId={setHoveredTrackId}
                            onDurationsChange={handleDurationsChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlbumDetail;