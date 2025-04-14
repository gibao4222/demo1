import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainFollowSinger() {
  const { id: singerId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Lấy thông tin chi tiết nghệ sĩ
  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await axios.get(`/api/singers/singers/${singerId}/`);
        setArtist(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nghệ sĩ:", error);
        toast.error("Không thể tải thông tin nghệ sĩ!");
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [singerId]);

  // Kiểm tra trạng thái theo dõi khi component được render
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (!token) {
          console.log("Chưa đăng nhập, không kiểm tra trạng thái theo dõi.");
          return;
        }

        console.log("Kiểm tra trạng thái theo dõi cho singerId:", singerId);
        const response = await axios.get(
          `/api/users/theo-doi-nghe-si/?singer_id=${singerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ checkFollowStatus:", response.data);
        setIsFollowing(response.data.is_following || false);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        toast.error("Không thể kiểm tra trạng thái theo dõi!");
      }
    };

    checkFollowStatus();
  }, [singerId, token]);

  const handleFollowToggle = async () => {
    try {
      console.log("Token:", token);
      if (!token) {
        toast.error("Vui lòng đăng nhập để theo dõi!");
        return;
      }

      if (isFollowing) {
        console.log("Gửi yêu cầu DELETE để hủy theo dõi:", singerId);
        const response = await axios.delete(
          `/api/users/theo-doi-nghe-si/?singer_id=${singerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ DELETE:", response.data);
        toast.success(response.data.thông_báo || "Đã xóa khỏi Thư viện.");
        setIsFollowing(false);
      } else {
        console.log("Gửi yêu cầu POST để theo dõi:", singerId);
        const response = await axios.post(
          `/api/users/theo-doi-nghe-si/`,
          { singer_id: singerId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ POST:", response.data);
        toast.success(response.data.thông_báo || "Đã thêm vào Thư viện.");
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện theo dõi/hủy theo dõi:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
      const errorMsg = error.response?.data?.lỗi || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!artist) {
    return <div>Không tìm thấy nghệ sĩ!</div>;
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 p-8">
        <div className="relative">
          <img
            alt={artist.name}
            className="w-full h-64 object-cover rounded-lg"
            height="400"
            src={
              artist.image
                ? artist.image.startsWith('http')
                  ? artist.image
                  : `/media/${artist.image}`
                : "https://storage.googleapis.com/a1aa/image/_CJYsizjY3hL_rf2L0alx_iaUDz0EXttAkg_pl1vBNE.jpg" 
            }
            width="800"
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-blue-500">Nghệ sĩ được xác minh</p>
            <h1 className="text-6xl font-bold">{artist.name}</h1>
            <p className="text-gray-400">{artist.followers} người nghe hàng tháng</p>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <button className="bg-green-500 text-white px-6 py-2 rounded-full text-xl mr-4">
            <i className="fas fa-play"></i>
          </button>
          <button
            onClick={handleFollowToggle}
            className={`${
              isFollowing ? "bg-gray-600" : "bg-gray-800"
            } text-white px-6 py-2 rounded-full text-xl mr-4`}
          >
            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
          </button>
          <i className="fas fa-ellipsis-h text-2xl"></i>
        </div>
        <h2 className="mt-8 text-2xl font-bold">Phổ biến</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <img
                alt="Perfect album cover"
                className="w-10 h-10 mr-4"
                height="40"
                src="https://storage.googleapis.com/a1aa/image/qHjEinP2BZjVW90YIyUCD5vnA6yQCbCN6tj8Pp63Vco.jpg"
                width="40"
              />
              <p>Perfect</p>
            </div>
            <div className="flex items-center">
              <p className="text-gray-400 mr-4">3.366.654.565</p>
              <p className="text-gray-400">4:23</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <img
                alt="Shape of You album cover"
                className="w-10 h-10 mr-4"
                height="40"
                src="https://storage.googleapis.com/a1aa/image/wuzzoUry9JliZwrMuHMZIjIj4CTXlcVWZukIzxuvFMg.jpg"
                width="40"
              />
              <p>Shape of You</p>
            </div>
            <div className="flex items-center">
              <p className="text-gray-400 mr-4">4.290.554.944</p>
              <p className="text-gray-400">3:53</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainFollowSinger;