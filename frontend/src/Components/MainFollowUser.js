import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainFollowUser() {
  const { id: userId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);
  const { token } = useAuth();

  // Lấy thông tin chi tiết của người dùng
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/api/users/users/${userId}/`);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error("Không thể tải thông tin người dùng!");
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Lấy thông tin người dùng hiện tại để lấy currentUserId
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`/api/users/current-user/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.id) {
          setCurrentUserId(response.data.id);
          console.log("ID người dùng hiện tại:", response.data.id);
        } else {
          console.error("Không tìm thấy ID người dùng hiện tại trong phản hồi:", response.data);
          toast.error("Không thể xác định người dùng hiện tại!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        toast.error("Không thể lấy thông tin người dùng hiện tại!");
      } finally {
        setCurrentUserLoading(false);
      }
    };

    if (token) {
      fetchCurrentUser();
    } else {
      setCurrentUserLoading(false);
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
    }
  }, [token]);

  // Kiểm tra trạng thái theo dõi
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (!token) {
          console.log("Chưa đăng nhập, không kiểm tra trạng thái theo dõi.");
          return;
        }

        console.log("Kiểm tra trạng thái theo dõi cho userId:", userId);
        const response = await axios.get(
          `/api/users/theo-doi-nguoi-dung/?user_id=${userId}`,
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

    if (!currentUserLoading && currentUserId) {
      checkFollowStatus();
    }
  }, [userId, token, currentUserLoading, currentUserId]);

  // Hàm xử lý theo dõi/hủy theo dõi
  const handleFollowToggle = async () => {
    if (currentUserLoading) {
      toast.info("Đang tải thông tin người dùng, vui lòng đợi...");
      return;
    }

    if (!currentUserId) {
      toast.error("Không thể xác định người dùng hiện tại, vui lòng đăng nhập lại!");
      return;
    }

    // Kiểm tra xem userId có hợp lệ không
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      toast.error("ID người dùng không hợp lệ!");
      return;
    }

    // Kiểm tra tự theo dõi phía client
    if (currentUserId === parsedUserId) {
      toast.error("Bạn không thể tự theo dõi chính mình!");
      return;
    }

    try {
      console.log("Token:", token);
      if (!token) {
        toast.error("Vui lòng đăng nhập để theo dõi!");
        return;
      }

      if (isFollowing) {
        console.log("Gửi yêu cầu DELETE để hủy theo dõi:", userId);
        const response = await axios.delete(
          `/api/users/theo-doi-nguoi-dung/?following_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ DELETE:", response.data);
        toast.success(response.data.thông_báo || "Đã xóa khỏi danh sách theo dõi.");
        setIsFollowing(false);
      } else {
        console.log("Gửi yêu cầu POST để theo dõi:", userId);
        const response = await axios.post(
          `/api/users/theo-doi-nguoi-dung/`,
          { following_id: parsedUserId }, // Gửi parsedUserId đã kiểm tra
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Phản hồi từ POST:", response.data);
        toast.success(response.data.thông_báo || "Đã thêm vào danh sách theo dõi.");
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện theo dõi/hủy theo dõi:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
      const errorMsg = error.response?.data?.lỗi || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    }
  };

  if (loading || currentUserLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <div>Không tìm thấy người dùng!</div>;
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 p-8">
        <div className="relative">
          <img
            alt={user.username || user.email}
            className="w-full h-64 object-cover rounded-lg"
            height="400"
            src={
              user.avatar
                ? user.avatar.startWith('http')
                  ? user.avatar
                  : `/media/${user.avatar}`
                : "https://storage.googleapis.com/a1aa/image/N5Ae48WVgHcJ7vgKi6lA3tz5FvQ3gwiFky_1XteLMpY.jpg"
            }
            width="800"
          />
          <div className="absolute bottom-4 left-4">
            <p className="text-blue-500">Người dùng được xác minh</p>
            <h1 className="text-6xl font-bold">{user.username || user.email}</h1>
            <p className="text-gray-400">{user.followers || 0} người theo dõi</p>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <button className="bg-green-500 text-white px-6 py-2 rounded-full text-xl mr-4">
            <i className="fas fa-play"></i>
          </button>
          <button
            onClick={handleFollowToggle}
            disabled={currentUserLoading || !currentUserId || isNaN(parseInt(userId))}
            className={`${
              isFollowing ? "bg-gray-600" : "bg-gray-800"
            } text-white px-6 py-2 rounded-full text-xl mr-4 ${
              currentUserLoading || !currentUserId || isNaN(parseInt(userId)) ? "opacity-50 cursor-not-allowed" : ""
            }`}
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

export default MainFollowUser;


