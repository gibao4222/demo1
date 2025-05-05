import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainProfile() {
  const { token, user, refreshToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    id: "",
    email: "",
    username: "",
    is_active: false,
    vip: false,
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lấy thông tin hồ sơ người dùng hiện tại
  useEffect(() => {
    console.log("Token:", token);
    console.log("User from AuthContext (auth_user.id):", user);
    const fetchUserProfile = async () => {
      try {
        console.log("Gửi yêu cầu tới /api/users/profile/ với token:", token);
        const response = await axios.get("/api/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile Response:", response.data);
        setProfile({
          id: response.data.id_spotify_user || "",
          email: response.data.email || "",
          username: response.data.username || "",
          is_active: response.data.is_active || false,
          vip: response.data.vip || false,
          role: response.data.role || ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ sơ:", error.response || error);
        console.error("Mã lỗi:", error.response?.status);
        console.error("Chi tiết lỗi:", error.response?.data);
        if (error.response?.status === 401) {
          console.log("Token không hợp lệ, thử làm mới token...");
          const newToken = await refreshToken();
          if (newToken) {
            try {
              console.log("Thử lại với token mới:", newToken);
              const retryResponse = await axios.get("/api/users/profile/", {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              console.log("Retry Profile Response:", retryResponse.data);
              setProfile({
                id: retryResponse.data.id || "",
                email: retryResponse.data.email || "",
                username: retryResponse.data.username || "",
                is_active: retryResponse.data.is_active || false,
                vip: retryResponse.data.vip || false,
                role: retryResponse.data.role || ""
              });
              setLoading(false);
              return;
            } catch (retryError) {
              console.error("Retry failed:", retryError.response || retryError);
              toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
              navigate("/login");
            }
          } else {
            console.error("Không thể làm mới token");
            toast.error("Không thể làm mới token, vui lòng đăng nhập lại!");
            navigate("/login");
          }
        } else {
          toast.error(error.response?.data?.lỗi || "Không thể tải thông tin hồ sơ!");
          setLoading(false);
        }
      }
    };
    if (token) {
      fetchUserProfile();
    } else {
      console.error("Không có token, chuyển hướng về trang đăng nhập");
      toast.error("Vui lòng đăng nhập để chỉnh sửa hồ sơ!");
      navigate("/login");
    }
  }, [token, navigate, user, refreshToken]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý gửi form cập nhật hồ sơ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.email || !profile.username) {
      toast.error("Vui lòng điền đầy đủ email và username!");
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.put(
        "/api/users/profile/",
        { email: profile.email, username: profile.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.thông_báo || "Cập nhật hồ sơ thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate(`/User/${response.data.dữ_liệu.id}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error.response || error);
      const errorMsg = error.response?.data?.lỗi || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý hủy bỏ
  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center text-white">Đang tải...</div>;
  }

  return (
    <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden relative">
      <div className="overflow-y-auto overlay-scroll pb-20">
        <div className="flex-1 flex">
          <div className="flex-1">
            <div className="relative">
              <div className="px-6 py-4">
                {/* Tiêu đề chỉ giữ chữ, bỏ khung */}
                <div className="mb-6">
                  <h1 className="text-3xl font-extrabold drop-shadow-2xl tracking-widest text-white text-center">
                    Chỉnh sửa hồ sơ
                  </h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                  {/* <div>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-300">
                      ID
                    </label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={profile.id}
                      disabled
                      className="mt-1 w-full px-3 py-2 bg-neutral-800 border border-neutral-500 rounded-md text-gray-400 focus:outline-none"
                    />
                  </div> */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profile.username}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 bg-neutral-800 border border-neutral-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Nhập tên người dùng"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 bg-neutral-800 border border-neutral-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Nhập email"
                    />
                  </div>
                  {/* <div>
                    <label htmlFor="is_active" className="block text-sm font-medium text-gray-300">
                      Trạng thái hoạt động
                    </label>
                    <input
                      type="text"
                      id="is_active"
                      value={profile.is_active ? "Hoạt động" : "Không hoạt động"}
                      disabled
                      className="mt-1 w-full px-3 py-2 bg-neutral-800 border border-neutral-500 rounded-md text-gray-400 focus:outline-none"
                    />
                  </div> */}
                  {/* <div>
                    <label htmlFor="vip" className="block text-sm font-medium text-gray-300">
                      VIP
                    </label>
                    <input
                      type="text"
                      id="vip"
                      value={profile.vip ? "Có" : "Không"}
                      disabled
                      className="mt-1 w-full px-3 py-2 bg-neutral-800 border border-neutral-500 rounded-md text-gray-400 focus:outline-none"
                    />
                  </div> */}
                  {/* <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                      Vai trò
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={profile.role}
                      disabled
                      className="mt-1 w-full px-3 py-2 bg-neutral-800 border border-neutral-500 rounded-md text-gray-400 focus:outline-none"
                    />
                  </div> */}
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 px-6 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-6 py-2 rounded-full bg-neutral-800 border border-neutral-500 text-white hover:border-white"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainProfile;