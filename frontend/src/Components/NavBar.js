import React, { useState } from 'react';
import axios from 'axios';
import NavItem from './Item/NavItem';
import SearchResults from './SearchResults';

const NavBar = ({ user, onLogout }) => {
    const [activeItem, setActiveItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ songs: [], playlists: [], albums: [] });
    const [topResult, setTopResult] = useState(null);

    const handleItemClick = (item) => {
        setActiveItem((prev) => (prev === item ? null : item));
    };

    const handleSearchChange = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() !== '') {
            try {
                const [songsResponse, playlistsResponse, albumsResponse] = await Promise.all([
                    axios.get(`https://localhost/api/songs/songs/?search=${term}`),
                    axios.get(`https://localhost/api/playlists/playlists/?search=${term}`),
                    axios.get(`https://localhost/api/albums/albums/?Search=${term}`)
                ]);

                // Chuẩn hóa dữ liệu
                const songs = Array.isArray(songsResponse.data) ? songsResponse.data : [];
                const playlists = Array.isArray(playlistsResponse.data) ? playlistsResponse.data : [];
                const albums = Array.isArray(albumsResponse.data) ? albumsResponse.data : [];

                // Kiểm tra và lọc dữ liệu dựa trên từ khóa
                const normalizedTerm = term.toLowerCase();
                const filteredSongs = songs.filter(song =>
                    song.name?.toLowerCase().includes(normalizedTerm) ||
                    song.artist?.toLowerCase().includes(normalizedTerm)
                );
                const filteredPlaylists = playlists.filter(playlist =>
                    playlist.name?.toLowerCase().includes(normalizedTerm)
                );
                const filteredAlbums = albums.filter(album =>
                    album.name?.toLowerCase().includes(normalizedTerm)
                );

                // Cập nhật kết quả tìm kiếm
                setSearchResults({
                    songs: filteredSongs,
                    playlists: filteredPlaylists,
                    albums: filteredAlbums,
                });

                // Lấy kết quả hàng đầu
                if (filteredPlaylists.length > 0) {
                    setTopResult({ ...filteredPlaylists[0], type: 'Playlist' });
                } else if (filteredAlbums.length > 0) {
                    setTopResult({ ...filteredAlbums[0], type: 'Album' });
                } else if (filteredSongs.length > 0) {
                    setTopResult({ ...filteredSongs[0], type: 'Song' });
                } else {
                    setTopResult(null);
                }
            } catch (error) {
                console.error('Lỗi khi tìm kiếm:', error);
                setSearchResults({ songs: [], playlists: [], albums: [] });
                setTopResult(null);
            }
        } else {
            setSearchResults({ songs: [], playlists: [], albums: [] });
            setTopResult(null);
        }
    };

    return (
        <div className="sticky top-0 z-50 w-full flex items-center gap-96 bg-black px-4 py-2.5">
            <div className="flex items-center space-x-3.5">
                <img
                    src="/icon/Spotify_BackGround_White.png"
                    alt="Spotify Logo"
                    className="w-10 h-10 mr-4"
                />
                <NavItem
                    icon="/icon/Home_Fill_S.png"
                    active={activeItem === 'Home'}
                    activeStyle="none"
                    onClick={() => handleItemClick('Home')}
                />

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Bạn muốn phát nội dung gì?"
                        className="bg-gray-800 text-white placeholder-gray-400 rounded-full py-2.5 pl-10 pr-12 w-[500px] focus:outline-none focus:ring-2 focus:ring-white"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <img
                        src="/icon/Search_S.png"
                        alt="Tìm kiếm"
                        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50"
                    />
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2 h-5 w-px bg-white opacity-50" />
                    {/* Nút Duyệt tìm */}
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2  p-1">
                        <img
                            src="/icon/browser.webp"
                            alt="Duyệt tìm"
                            className="w-12 h-10 brightness-0 invert opacity-50"
                        />
                    </button>

                    {/* Hiển thị kết quả tìm kiếm */}
                    {(searchResults.songs?.length > 0 || searchResults.playlists?.length > 0 || searchResults.albums?.length > 0) && (
                        <div className="absolute bg-gray-800 text-white rounded-lg mt-2 w-full max-h-96 overflow-y-auto z-50">
                            <SearchResults
                                topResult={topResult}
                                songs={searchResults.songs}
                                playlists={searchResults.playlists}
                                albums={searchResults.albums}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-6 ml-6">
                <button className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-500">
                    Khám phá Premium
                </button>
                <div className="relative flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white">
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                        </svg>
                    </button>
                    <div className="flex bg-gray-700 rounded-full h-9 w-9 items-center justify-center">
                        <img
                            src="/images/blog/blog-10.jpg"
                            alt="User Avatar"
                            className="w-7 h-7 rounded-full items-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;