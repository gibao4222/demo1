import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AudioRecorderModal = ({ isOpen, onClose, onResult }) => {
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Nhấn để ghi âm');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setRecording(false);
      setIsProcessing(false);
      setStatusMessage('Nhấn để ghi âm');
      audioChunksRef.current = [];
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };
          mediaRecorderRef.current.onstop = handleStopRecording;
        })
        .catch(err => {
          console.error("Error accessing microphone:", err);
          setStatusMessage('Lỗi truy cập microphone');
          alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
        });
    }

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && !recording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setRecording(true);
      setStatusMessage('Đang ghi âm...');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setIsProcessing(true);
      setStatusMessage('Đang xử lý...');
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const audioFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      setStatusMessage('Đang tìm kiếm bài hát...');
      const res = await axios.post('/api/songs/search-by-audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.results && res.data.results.length > 0) {
        const bestMatch = res.data.results[0];
        const result = {
          name: bestMatch.name,
          similarity: Math.round(bestMatch.similarity * 100),
          id: bestMatch.id 
        };

        onResult(result);
        setStatusMessage('Tìm thấy bài hát!');
        
        // Đóng modal sau 1 giây để người dùng thấy thông báo
        setTimeout(() => {
          onClose();
          
          // Nếu có ID bài hát thì chuyển hướng đến trang chi tiết
          if (bestMatch.id) {
            navigate(`/song/${bestMatch.id}`);
          }
        }, 1000);
        
      } else {
        onResult(null);
        setStatusMessage('Không tìm thấy bài hát');
        alert('Không tìm thấy bài hát phù hợp');
      }
    } catch (err) {
      console.error("Error details:", err);
      onResult(null);
      setStatusMessage('Lỗi khi tìm kiếm');
      alert('Không tìm thấy bài hát hoặc có lỗi xảy ra!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-xl shadow-xl w-80 max-w-full relative transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors text-xl"
        >
          &times;
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {statusMessage}
          </h2>
          
          <div className="relative mb-4">
            <div className={`absolute inset-0 rounded-full ${
              recording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
            }`}></div>
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                recording ? 'bg-red-600' : isProcessing ? 'bg-indigo-400' : 'bg-indigo-600'
              } hover:opacity-90 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isProcessing ? (
                <div className="loading-spinner"></div>
              ) : (
                <i className={`fas fa-microphone text-white text-xl`}></i>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-600 text-center">
            {recording 
              ? 'Nhấn lại để dừng ghi âm' 
              : isProcessing 
                ? 'Vui lòng chờ trong giây lát...' 
                : 'Ghi âm một đoạn nhạc để tìm kiếm'}
          </p>
          
          {isProcessing && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioRecorderModal;