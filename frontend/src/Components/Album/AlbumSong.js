import React, { useState, useEffect } from 'react';
import { FaPlay, FaEllipsisH, FaCheckCircle } from 'react-icons/fa';
import { FiClock } from "react-icons/fi";

const AlbumSong = ({ tracks, albumData, hoveredTrackId, setHoveredTrackId, onDurationsChange }) => {
    const [durations, setDurations] = useState({});

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        const fetchDurations = async () => {
            const durationMap = {};
            for (const track of tracks) {
                if (track.id_song.file_audio) {
                    try {
                        const audio = new Audio(track.id_song.file_audio);
                        await new Promise((resolve) => {
                            audio.addEventListener('loadedmetadata', () => {
                                durationMap[track.id] = audio.duration;
                                resolve();
                            });
                        });
                    } catch (error) {
                        console.error(`Error loading audio for track ${track.id}:`, error);
                        durationMap[track.id] = null;
                    }
                }
            }
            setDurations(durationMap);
            // Gửi durations lên parent component
            onDurationsChange(durationMap);
        };

        if (tracks.length > 0) {
            fetchDurations();
        }
    }, [tracks, onDurationsChange]);

    return (
        <div className="max-w-7xl mx-auto rounded-lg select-none">
            <div className="mt-4">
                {tracks.length === 0 ? (
                    <p className="text-white">Không có bài hát nào trong album này.</p>
                ) : (
                    <table className="w-full rounded-md text-white text-sm">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] text-sm font-semibold text-gray-400">
                                <th className="py-2 px-4 text-center w-[10%] bg-transparent">#</th>
                                <th className="px-4 py-3 text-left bg-transparent">Tiêu đề</th>
                                <th className="py-2 px-4 text-center w-[5%] bg-transparent"></th>
                                <th className="py-2 px-4 text-right w-[10%] bg-transparent">
                                    <div className="flex justify-end">
                                        <FiClock />
                                    </div>
                                </th>
                                <th className="py-2 px-4 text-right w-[10%] bg-transparent"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map((track, index) => (
                                <tr
                                    key={track.id}
                                    className="hover:bg-neutral-800 rounded"
                                    onMouseEnter={() => setHoveredTrackId(track.id)}
                                    onMouseLeave={() => setHoveredTrackId(null)}
                                >
                                    <td className="px-4 py-3 w-[10%] text-center">
                                        <div className="flex justify-center items-center h-full">
                                            {hoveredTrackId === track.id ? (
                                                <FaPlay className="text-[#1ed760] text-sm" />
                                            ) : (
                                                <span className="text-white font-semibold select-none">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white leading-tight">
                                                {track.id_song.name}
                                            </span>
                                            <span className="text-xs text-white font-semibold flex items-center gap-1 mt-0.5">
                                                <span>{albumData.id_singer.name}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center w-[5%]">
                                        <div className="flex justify-center items-center h-full relative group">
                                            <FaCheckCircle className="text-green-500" />
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#3c3c3c] text-white text-base rounded py-1 px-2 whitespace-nowrap">
                                                Thêm vào danh sách phát
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right w-[10%]">
                                        <span className="text-white font-semibold select-none">
                                            {durations[track.id] ? formatTime(durations[track.id]) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center w-[10%]">
                                        <div className="flex justify-center items-center h-full">
                                            {hoveredTrackId === track.id ? (
                                                <div className="flex justify-center items-center h-full relative group">
                                                    <FaEllipsisH />
                                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#3c3c3c] text-white text-base rounded py-1 px-2 whitespace-nowrap">
                                                        Option
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="w-5 h-5" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AlbumSong;