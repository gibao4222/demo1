import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BottomPlayer_ex from './BottomPlayer_ex';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SongDetail() {
    const { id } = useParams();
    const [song, setSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const { user } = useAuth();

    const playlistData = {
        name: "Gentle Classical Sleep Mix",
        description: "Gentle Classical Sleep music picked just for you",
        creator: "Spotify",
        songCount: 50,
        duration: "about 2 hr 15 min",
        songs: [
            {
                id: 1,
                title: "Buổi Sáng Tươi Mới",
                artist: "Artemio Li Fonti",
                album: "Chúc Ngủ Ngon Và Những Giấc Mơ...",
                duration: "3:44",
                image: ""
            },
            {
                id: 2,
                title: "Cảm Xúc Đêm Tối",
                artist: "Richard Ramsey",
                album: "Chúc Ngủ Ngon Và Những Giấc Mơ...",
                duration: "1:58",
                image: "https://www.pinterest.com/pin/7740630604642753/",
            },
         
        ],
    };

    useEffect(() => {
        axios.get(`https://localhost/api/songs/songs/${id}/`)
            .then(response => setSong(response.data))
            .catch(error => console.error('Error fetching song details:', error));
    }, [id]);

    const playSong = () => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (song && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [song, isPlaying]);

    if (!song) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <div>Loading user...</div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex"> 
            <div className="p-4 w-2/3"> 
                
                <div className="flex items-center p-6 relative">
                    <div className="flex items-center">
                        <img 
                            src={song.image} 
                            alt={song.name} 
                            className="h-40 w-40 sm:w-48 md:w-56 lg:w-64 object-contain rounded-md" 
                        />
                        <div className="ml-4">
                            <h1 className="text-3xl font-bold">{song.name}</h1>
                            <p className="text-sm text-gray-400">{song.artist}</p>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <button
                        onClick={playSong}
                        className="mt-6 px-6 py-2 bg-green-500 text-white rounded-full text-lg hover:bg-green-600"
                    >
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                </div>
                <audio ref={audioRef} src={song?.url_song} />
                {song && (
                    <BottomPlayer_ex
                        song={song}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        audioRef={audioRef}
                        image={song.image} 
                    />
                )}
                {/* Danh sách bài hát trong playlist */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Playlist</h2>
                    <ul>
                        {playlistData.songs.map(song => (
                            <li key={song.id} className="flex items-center p-2 hover:bg-gray-800 rounded-md">
                                <img src="/icon/Repeat_S.png" alt={song.title} className="h-10 w-10 object-cover rounded-md mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold">{song.title}</h3>
                                    <p className="text-sm text-gray-400">{song.artist}</p>
                                </div>
                                <span className="ml-auto text-sm text-gray-400">{song.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="w-1/3 p-4"> 
                {user.vip && song.file_video ? (
                    <video
                        src={song.url_video}
                        className="w-full h-auto object-contain rounded-md" 
                        muted
                        autoPlay
                        loop
                    />
                ) : (
                    <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-auto object-contain rounded-md"
                    />
                    
                )}
            </div>
        </div>
    );
}

export default SongDetail;