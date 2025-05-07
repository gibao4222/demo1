import React, { useState, useRef } from 'react';
import axios from "../axios";
import { FaMicrophoneLines, FaMicrophoneLinesSlash } from "react-icons/fa6";

const AudioSearch = ({ onSearch }) => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioFile = new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" });

            const formData = new FormData();
            formData.append('audio', audioFile);

            try {
                const res = await axios.post('/api/songs/search-by-audio/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (res.data.results && res.data.results.length > 0) {
                    const bestMatch = res.data.results[0];
                    alert(`Kết quả: ${bestMatch.name} (${Math.round(bestMatch.similarity * 100)}%)`);
                } else {
                    alert('Không tìm thấy bài hát phù hợp');
                }
            } catch (err) {
                console.error("Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                alert('Không tìm thấy bài hát hoặc có lỗi xảy ra! Chi tiết: ' +
                    (err.response?.data?.message || err.message));
            }
        };

        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
        }
    };

    return (
        <div className="relative">
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 h-5 w-px bg-white opacity-50" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1">
                <img
                    src="/icon/browser.webp"
                    alt="Duyệt tìm"
                    className="w-12 h-10 brightness-0 invert opacity-50"
                />
            </button>
            {!recording ? (
                <button
                    title="Ghi âm tìm bài hát"
                    className="absolute right-14 top-1/2 transform -translate-y-1/2 p-1"
                    onClick={startRecording}
                >
                    <FaMicrophoneLines style={{ fontSize: '20px' }} />
                </button>
            ) : (
                <button
                    title="Dừng ghi âm"
                    className="absolute right-14 top-1/2 transform -translate-y-1/2 p-1"
                    onClick={stopRecording}
                >
                    <FaMicrophoneLinesSlash style={{ fontSize: '20px' }} />
                </button>
            )}
        </div>
    );
};

export default AudioSearch;
