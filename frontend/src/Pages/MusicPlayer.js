import React, { useEffect, useState } from "react";
import axios from "axios";

const MusicPlayer = () => {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:8000/api/songs/").then((response) => {
            setSongs(response.data);
        });
    }, []);

    return (
        <div>
            <h2>Music Player</h2>
            <ul>
                {songs.map((song) => (
                    <li key={song.id}>
                        {song.title}{" "}
                        <button onClick={() => setCurrentSong(song.file)}>Play</button>
                    </li>
                ))}
            </ul>

            {currentSong && (
                <audio controls autoPlay>
                    <source src={`http://localhost:8000${currentSong}`} type="audio/mpeg" />
                </audio>
            )}
        </div>
    );
};

export default MusicPlayer;
