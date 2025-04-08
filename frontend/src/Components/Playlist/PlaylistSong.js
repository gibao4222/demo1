import React from 'react';
import { FaPlay } from 'react-icons/fa';

const PlaylistSong = () => {
    const songs = [
        {
            id: 1,
            title: 'NOLOVENOLIFE',
            album: 'Ai Cứng Phải Bắt Đầu Từ Ai Cứng Phải Bắt Đầu Từ Ai Cứng Phải Bắt Đầu Từ ',
            artist: 'HIEUTHUHAI',
            dateAdded: '17 thg 3, 2024',
            duration: '2:50',
            image: '/img/Frame42.png',
        },
        {
            id: 2,
            title: 'Từng Là',
            album: 'Từng Là',
            artist: 'Vũ Cát Tường',
            dateAdded: '17 thg 3, 2024',
            duration: '4:12',
            image: '/img/AlbumCover1.png',
        },
    ];

    return (
        <div className="mt-8">
            {/* Tiêu đề danh sách bài hát */}
            <p className="text-xl font-bold text-white mb-8">Danh sách bài hát</p>

            {/* Bảng danh sách bài hát */}
            <table className="w-full text-sm text-gray-200">
                {/* Header của bảng */}
                <thead>
                    <tr className="text-gray-400 border-b border-neutral-700 bg-transparent">
                        <th className="py-2 px-2 text-left w-[5%] bg-transparent">#</th>
                        <th className="py-2 px-2 text-left w-[35%] bg-transparent">Tiêu đề</th>
                        <th className="py-2 px-2 text-left w-[25%] bg-transparent">Album</th>
                        <th className="py-2 px-2 text-left w-[30%] bg-transparent">Ngày thêm</th>
                        <th className="py-2 px-2 text-right w-[5%] bg-transparent">⏱</th>
                    </tr>
                </thead>

                {/* Nội dung bảng */}
                <tbody>
                    {songs.map((song, index) => (
                        <tr
                            key={song.id}
                            className="hover:bg-neutral-800 rounded"
                        >
                            {/* Số thứ tự */}
                            <td className="py-3 px-2">
                                <div className="flex items-center">
                                    <span className="mr-2">{index + 1}</span>
                                    <FaPlay className="text-gray-400 hover:text-white cursor-pointer" />
                                </div>
                            </td>

                            {/* Tiêu đề và ảnh bìa */}
                            <td className="py-3 px-2">
                                <div className="flex items-center">
                                    <img
                                        src={song.image}
                                        alt={song.title}
                                        className="w-10 h-10 rounded mr-3"
                                    />
                                    <div>
                                        <p className="text-white font-medium">{song.title}</p>
                                        <p className="text-gray-400 text-xs">{song.artist}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Album */}
                            <td className="py-3 px-2">{song.album}</td>

                            {/* Ngày thêm */}
                            <td className="py-3 px-2">{song.dateAdded}</td>

                            {/* Thời lượng */}
                            <td className="py-3 px-2 text-right">{song.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlaylistSong;