import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Lấy tham số từ URL
import axios from 'axios';
import SideBar from '../Components/SideBar';
import BottomPlayer from '../Components/BottomPlayer';
import SearchResults from '../Components/SearchResults';

function SearchPage() {
    const [searchParams] = useSearchParams(); // Lấy tham số từ URL
    const [topResult, setTopResult] = useState(null);
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const query = searchParams.get('q'); // Lấy từ khóa tìm kiếm từ URL
        if (query) {
            // Gọi API để lấy kết quả tìm kiếm
            axios.get(`https://localhost/api/songs/songs/?q=${query}`)
                .then((response) => {
                    const songsData = response.data.songs || [];
                    // Chuẩn hóa dữ liệu bài hát
                    const formattedSongs = songsData.map(song => ({
                        id: song.id,
                        name: song.name,
                        artist: song.artist,
                        duration: song.duration || '3:00',
                        image: song.image || '/default-song.jpg',
                        isPlaying: false,
                    }));

                    // Lấy bài hát đầu tiên làm topResult (nếu có)
                    const topResultData = songsData.length > 0 ? {
                        name: songsData[0].name,
                        type: 'Bài hát',
                        artist: songsData[0].artist,
                        image: songsData[0].image || '/default-album.jpg',
                    } : null;

                    setSongs(formattedSongs);
                    setTopResult(topResultData);
                    setError(null);
                })
                .catch((error) => {
                    console.error('Lỗi khi tìm kiếm bài hát:', error);
                    setError('Không thể tìm kiếm bài hát. Vui lòng thử lại sau.');
                    setSongs([]);
                    setTopResult(null);
                });
        }
    }, [searchParams]); // Chạy lại khi searchParams thay đổi

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1">
                <SideBar />
                <div className="flex-1 p-4">
                    {error ? (
                        <div className="bg-black text-red-500 p-4 rounded-lg">
                            {error}
                        </div>
                    ) : (
                        <SearchResults topResult={topResult} songs={songs} />
                    )}
                </div>
            </div>
            <BottomPlayer />
        </div>
    );
}

export default SearchPage;