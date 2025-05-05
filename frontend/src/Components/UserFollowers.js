import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

function UserFollowers() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [followersInfo, setFollowersInfo] = useState({ followers_count: 0, followers: [] });
  const [loading, setLoading] = useState(true);

  // Lấy danh sách người theo dõi
  useEffect(() => {
    const fetchFollowersInfo = async () => {
      try {
        console.log(`Gọi API: /api/users/users/${userId}/followers-info/`);
        const response = await axios.get(`/api/users/users/${userId}/followers-info/`);
        console.log("Dữ liệu từ API followers-info:", response.data);
        setFollowersInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người theo dõi:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        toast.error("Không thể tải thông tin người theo dõi!");
        setLoading(false);
      }
    };

    fetchFollowersInfo();
  }, [userId]);

  // Hàm quay lại trang chi tiết user
  const handleBack = () => {
    navigate(`/FollowUser/${userId}`);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="text-gray-400 hover:text-white mr-4"
        >
          <i className="fas fa-arrow-left text-2xl"></i>
        </button>
        <h1 className="text-3xl font-bold text-white">
          Người theo dõi ({followersInfo.followers_count})
        </h1>
      </div>
      {followersInfo.followers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {followersInfo.followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition cursor-pointer"
              onClick={() => navigate(`/User/${follower.id}`)}
            >
              <img
                src="https://storage.googleapis.com/a1aa/image/N5Ae48WVgHcJ7vgKi6lA3tz5FvQ3gwiFky_1XteLMpY.jpg"
                alt={`${follower.username}'s avatar`}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="text-white font-semibold">{follower.username}</p>
                <p className="text-gray-400 text-sm">{follower.email}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Chưa có người theo dõi nào.</p>
      )}
    </div>
  );
}

export default UserFollowers;