import React, { useRef } from 'react';
import { FaPlay, FaPlus, FaEllipsisH } from 'react-icons/fa';
import OptionAlbum from '../Modals/OptionAlbum';

const AlbumHeader = ({
    tracks,
    albumData,
    imageError,
    setImageError,
    isHovered,
    setIsHovered,
    isOptionOpen,
    setIsOptionOpen,
    modalPosition,
    setModalPosition,
    isImageModalOpen,
    setIsImageModalOpen,
    controlsRef,
    totalDuration,
    formatTime,
}) => {
    const handleImageError = () => {
        console.error('Không thể tải hình ảnh:', albumData?.image);
        setImageError(true);
    };

    const optionsButtonRef = useRef(null);
    const handleOpenOptionModal = () => {
        if (optionsButtonRef.current) {
            const rect = optionsButtonRef.current.getBoundingClientRect();
            setModalPosition({
                top: rect.bottom + window.scrollY - 80,
                left: rect.left + window.scrollX - 220,
            });
        }
        setIsOptionOpen(true);
    };

    const handleImageClick = () => {
        setIsImageModalOpen(true);
    };

    const releaseYear = albumData.release_date ? albumData.release_date.split('-')[0] : 'N/A';

    return (
        <div className="max-w-7xl mx-auto rounded-lg select-none">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 bg-gradient-to-b from-[#3A3A3A] to-[#242424] rounded-lg p-6 md:p-8">
                <div
                    className="relative w-48 h-48 shadow-2xl shadow-black rounded overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleImageClick}
                >
                    <img
                        src={imageError ? '/img/null.png' : albumData.image}
                        alt="Ảnh bìa album"
                        className="w-full h-full object-cover rounded"
                        onError={handleImageError}
                        width={200}
                        height={200}
                    />
                </div>
                <div className="flex flex-col flex-grow">
                    <span className="text-base font-semibold mb-1">Album</span>
                    <h1 className="font-extrabold text-3xl md:text-4xl leading-tight">{albumData.name}</h1>
                    <div className="flex items-center gap-2 mt-2 text-base text-[#d9d9d9] font-semibold">
                        <span>{albumData.id_singer?.name || "Không có thông tin ca sĩ"}</span>
                        <span> • {releaseYear}</span>
                        <span> • {tracks.length || 0} bài hát</span>
                        <span> • {totalDuration ? formatTime(totalDuration) : '0:00'}</span>
                    </div>
                </div>
            </div>

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

            {isOptionOpen && (
                <OptionAlbum
                    onClose={() => setIsOptionOpen(false)}
                    position={modalPosition}
                />
            )}
        </div>
    );
};

export default AlbumHeader;