import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLikeSong() {
  const { id: songId } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  

  // Lấy thông tin chi tiết bài hát
  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const response = await axios.get(`/api/songs/songs/${songId}/`);
        setSong(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bài hát:", error);
        toast.error("Không thể tải thông tin bài hát!");
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [songId]);

  // Kiểm tra trạng thái thích khi component được render
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        if (!token) {
          console.log("Chưa đăng nhập, không kiểm tra trạng thái thích.");
          return;
        }

        console.log("Kiểm tra trạng thái thích cho songId:", songId);
        const response = await axios.get(
          `/api/users/thich-bai-hat/?song_id=${songId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ checkLikeStatus:", response.data);
        setIsLiked(response.data.is_liked || false);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái thích:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        toast.error("Không thể kiểm tra trạng thái thích!");
      }
    };

    checkLikeStatus();
  }, [songId, token]);

  const handleLikeToggle = async () => {
    try {
      console.log("Token:", token);
      if (!token) {
        toast.error("Vui lòng đăng nhập để thích bài hát!");
        return;
      }

      if (isLiked) {
        console.log("Gửi yêu cầu DELETE để bỏ thích:", songId);
        const response = await axios.delete(
          `/api/users/thich-bai-hat/?song_id=${songId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ DELETE:", response.data);
        toast.success(response.data.thông_báo || "Đã xóa khỏi bài hát yêu thích.");
        setIsLiked(false);
      } else {
        console.log("Gửi yêu cầu POST để thích:", songId);
        const response = await axios.post(
          `/api/users/thich-bai-hat/`,
          { song_id: songId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ POST:", response.data);
        toast.success(response.data.thông_báo || "Đã thêm vào bài hát yêu thích.");
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện thích/bỏ thích:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
      const errorMsg = error.response?.data?.lỗi || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!song) {
    return <div>Không tìm thấy bài hát!</div>;
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 p-8">
        <div className="relative">
          <img
            alt={song.title}
            className="w-full h-64 object-cover rounded-lg"
            height="400"
            src={
              song.image
                ? song.image.startsWith('http') // Kiểm tra nếu là URL đầy đủ
                  ? song.image
                  : `/media/${song.image}`
                : "https://storage.googleapis.com/a1aa/image/..."
            }
            width="800"
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-blue-500">Bài hát</p>
            <h1 className="text-6xl font-bold">{song.title}</h1>
            <p className="text-gray-400">{song.artist_name} • {song.plays} lượt nghe</p>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <button className="bg-green-500 text-white px-6 py-2 rounded-full text-xl mr-4">
            <i className="fas fa-play"></i>
          </button>
          <button
            onClick={handleLikeToggle}
            className={`${
              isLiked ? "bg-gray-600" : "bg-gray-800"
            } text-white px-6 py-2 rounded-full text-xl mr-4`}
          >
            {isLiked ? "Đã thích" : "Thích"}
          </button>
          <i className="fas fa-ellipsis-h text-2xl"></i>
        </div>
        <h2 className="mt-8 text-2xl font-bold">Thông tin bài hát</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <img
                alt={`${song.title} cover`}
                className="w-10 h-10 mr-4"
                height="40"
                src={
                  song.image
                    ? song.image.startsWith('http') // Kiểm tra nếu là URL đầy đủ
                      ? song.image
                      : `/media/${song.image}`
                    : "https://storage.googleapis.com/a1aa/image/..."
                }
                width="40"
              />
              <p>{song.title}</p>
            </div>
            <div className="flex items-center">
              <p className="text-gray-400 mr-4">{song.plays}</p>
              <p className="text-gray-400">{song.duration}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLikeSong;