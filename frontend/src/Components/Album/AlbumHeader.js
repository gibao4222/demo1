import React, { useRef } from 'react';
import { FaPlus, FaEllipsisH, FaCheckCircle } from 'react-icons/fa';
import OptionAlbum from '../Modals/OptionAlbum';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { updateAlbumLibraryStatus } from '../../Services/AlbumService';
import { usePlayer } from '../../context/PlayerContext';

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
    dominantColor,
}) => {
    const { token } = useAuth();
    const handleImageError = () => {
        console.error('Không thể tải hình ảnh:', albumData?.image);
        setImageError(true);
    };
     const {
            song: currentSong,
            setCurrentSong,
            isPlaying,
            setIsPlaying,
            audioRef,
            queue,
            setQueue,
            setCurrentSongList
        } = usePlayer();

    const optionsButtonRef = useRef(null);
    const handleOpenOptionModal = () => {
        if (optionsButtonRef.current) {
            const rect = optionsButtonRef.current.getBoundingClientRect();
            const modalWidth = 250;
            const windowWidth = window.innerWidth;
            const friendActivityWidth = 300;
            const availableWidth = windowWidth - friendActivityWidth;

            let leftPosition = rect.left + window.scrollX;

            if (leftPosition + modalWidth > availableWidth) {
                leftPosition = availableWidth - modalWidth - 10;
            }
            if (leftPosition < 0) {
                leftPosition = 10;
            }

            setModalPosition({
                top: rect.bottom + window.scrollY - 5,
                left: leftPosition,
            });

            console.log('Window width:', windowWidth, 'Available width:', availableWidth, 'Left position:', leftPosition);
        }
        setIsOptionOpen(true);
    };

    const handleImageClick = () => {
        setIsImageModalOpen(true);
    };

    const handlePlayAll = () => {
        const songsArray = tracks.map(item => ({
            ...item.id_song,
        
        }));
       
        if (currentSong && songsArray.some(song => song.id === currentSong.id)) {
            setIsPlaying(!isPlaying);
            return;
          }
        if (songsArray.length === 0) return;
    
        setCurrentSong(songsArray)
        setCurrentSong(songsArray[0]);
        setQueue([]);
        setIsPlaying(true);
    };

    const handleAddToLibrary = async () => {
        try {
            await updateAlbumLibraryStatus(token, albumData.id, true);
            alert(`Đã thêm album ${albumData.name} vào Thư viện`);
            window.dispatchEvent(new Event('libraryUpdated'));
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
        } catch (error) {
            alert("Không thể xóa album khỏi thư viện");
            console.error('Lỗi khi xóa album khỏi thư viện:', error);
        }
    };

    const handleLibraryAction = () => {
        if (albumData.isInLibrary) {
            handleRemoveFromLibrary();
        } else {
            handleAddToLibrary();
        }
    };

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

    const releaseYear = albumData.release_date ? albumData.release_date.split('-')[0] : 'N/A';

    return (
        <>
        <div className="flex justify-start items-start gap-4 pt-3 pb-1">
            
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
            <div className="flex flex-col justify-between h-48 text-left">
                <span className="text-base text-gray-300 pt-6">Album</span>
                <h1 className="font-bold text-6xl md:text-6xl leading-tight">{albumData.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-base text-[#d9d9d9]">
                    <span>{albumData.id_singer?.name || "Không có thông tin ca sĩ"}</span>
                    <span> • {releaseYear}</span>
                    <span> • {tracks.length || 0} bài hát</span>
                    <span> • {totalDuration ? formatTime(totalDuration) : '0:00'}</span>
                </div>
            </div>
        </div>

        <div ref={controlsRef} className="flex items-center gap-4 mt-6 bg-opacity-35 bg-neutral-900 w-[calc(100%+3rem)] -ml-6">
            <div className="flex items-center pl-6 pt-3">
            <button onClick={()=>handlePlayAll()}  className="mr-3">
            <img 
            alt={isPlaying ? "Pause" : "Play"} 
            src={isPlaying ? "/icon/icon-pause.png" : "/icon/Play_GreemHover.png"} 
            height="50" 
            width="50" />
                </button>
                <div className="relative group">
                    <button
                        onClick={handleLibraryAction}
                        className="w-12 h-12 rounded-md flex items-center justify-center"
                    >
                        {albumData.isInLibrary ? (
                            <FaCheckCircle className="text-2xl text-green-500 transition group-hover:text-green-400 group-hover:scale-110" />
                        ) : (
                            <FaPlus className="text-white text-2xl transition group-hover:text-gray-100 group-hover:scale-110" />
                        )}
                    </button>
                    <div className="absolute bottom-full mb-[3px] left-1/2 transform -translate-x-1/2 hidden group-hover:flex items-center justify-center bg-[#282828] text-white text-sm rounded px-3 py-1 shadow-lg whitespace-nowrap">
                        {albumData.isInLibrary ? "Xóa khỏi Thư viện" : "Lưu vào thư viện"}
                    </div>
                </div>

                <button
                    aria-label="Tùy chọn khác"
                    ref={optionsButtonRef}
                    onClick={handleOpenOptionModal}
                    className="w-12 h-12 rounded-md flex items-center justify-center group"
                >
                    <FaEllipsisH className="text-white text-2xl transition group-hover:text-gray-100 group-hover:scale-110" />
                </button>
            </div>
            
        </div>

        {isOptionOpen &&
            createPortal(
                <OptionAlbum
                    onClose={() => setIsOptionOpen(false)}
                    position={modalPosition}
                    tracks={tracks}
                    albumData={albumData}
                />,
                document.body
            )}
        </>
    );
};

export default AlbumHeader;