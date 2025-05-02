
import React, { useState, useEffect, useRef } from "react";

import axios from "../axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainFollowUser() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [followersInfo, setFollowersInfo] = useState({ followers_count: 0, followers: [] });
  const [followersLoading, setFollowersLoading] = useState(true);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const optionRef = useRef(null);
  const scrollRef = useRef(null);
  const { token } = useAuth();

  // Lấy thông tin người theo dõi
  useEffect(() => {
    const fetchFollowersInfo = async () => {
      try {
        setFollowersLoading(true);
        const response = await axios.get(`/api/users/users/${userId}/followers-info/`);
        setFollowersInfo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người theo dõi:", error);
        toast.error("Không thể tải thông tin người theo dõi!");
      } finally {
        setFollowersLoading(false);
      }
    };
    fetchFollowersInfo();
  }, [userId]);

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

  // Lấy danh sách playlist của người dùng
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`/api/playlists/users/${userId}/playlists/`);
        setPlaylists(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách playlist:", error);
        if (error.response && error.response.status === 404) {
          setPlaylists([]);
          toast.info("Người dùng này chưa có playlist công khai.");
        } else {
          toast.error("Không thể tải danh sách playlist!");
        }
      }
    };
    fetchPlaylists();
  }, [userId]);

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`/api/users/current-user/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.id) {
          setCurrentUserId(response.data.id);
        } else {
          console.error("Không tìm thấy ID người dùng hiện tại:", response.data);
          toast.error("Không thể xác định người dùng hiện tại!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
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

  // Theo dõi vị trí cuộn để hiển thị/ẩn sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && optionRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        const scrollContainerRect = scrollRef.current.getBoundingClientRect();
        const optionRect = optionRef.current.getBoundingClientRect();
        const optionTopRelativeToScroll = optionRect.top - scrollContainerRect.top + scrollTop;
        const optionHeight = optionRef.current.offsetHeight;
        setShowStickyHeader(scrollTop > optionTopRelativeToScroll + optionHeight);
      }
    };
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [user]);

  // Kiểm tra trạng thái theo dõi
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (!token) {
          console.log("Chưa đăng nhập, không kiểm tra trạng thái theo dõi.");
          return;
        }
        const response = await axios.get(`/api/users/theo-doi-nguoi-dung/?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(response.data.is_following || false);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error);
        toast.error("Không thể kiểm tra trạng thái theo dõi!");
      }
    };
    if (!currentUserLoading && currentUserId) {
      checkFollowStatus();
    }
  }, [userId, token, currentUserLoading, currentUserId]);

  // Xử lý theo dõi/hủy theo dõi
  const handleFollowToggle = async () => {
    if (currentUserLoading) {
      toast.info("Đang tải thông tin người dùng, vui lòng đợi...");
      return;
    }
    if (!currentUserId) {
      toast.error("Không thể xác định người dùng hiện tại, vui lòng đăng nhập lại!");
      return;
    }
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      toast.error("ID người dùng không hợp lệ!");
      return;
    }
    if (currentUserId === parsedUserId) {
      toast.error("Bạn không thể tự theo dõi chính mình!");
      return;
    }
    try {
      if (!token) {
        toast.error("Vui lòng đăng nhập để theo dõi!");
        return;
      }
      if (isFollowing) {
        const response = await axios.delete(`/api/users/theo-doi-nguoi-dung/?following_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(response.data.thông_báo || "Đã xóa khỏi danh sách theo dõi.");
        setIsFollowing(false);
      } else {
        const response = await axios.post(
          `/api/users/theo-doi-nguoi-dung/`,
          { following_id: parsedUserId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.thông_báo || "Đã thêm vào danh sách theo dõi.");
        setIsFollowing(true);
      }
      // Cập nhật thông tin người theo dõi
      const fetchUpdatedFollowersInfo = async () => {
        try {
          setFollowersLoading(true);
          const response = await axios.get(`/api/users/users/${userId}/followers-info/`);
          setFollowersInfo(response.data);
        } catch (error) {
          console.error("Lỗi khi cập nhật thông tin người theo dõi:", error);
          toast.error("Không thể cập nhật thông tin người theo dõi!");
        } finally {
          setFollowersLoading(false);
        }
      };
      fetchUpdatedFollowersInfo();
    } catch (error) {
      console.error("Lỗi khi thực hiện theo dõi/hủy theo dõi:", error);
      const errorMsg = error.response?.data?.lỗi || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    }
  };

  // Xử lý chuyển hướng khi nhấn vào số người theo dõi
  const handleViewFollowers = () => {
    navigate(`/FollowUser/${userId}/followers`);
  };

  if (loading || currentUserLoading) {
    return <div className="text-center text-white">Đang tải...</div>;
  }

  if (!user) {
    return <div className="text-center text-white">Không tìm thấy người dùng!</div>;
  }

  return (
    <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden relative">
      {/* Sticky Header */}
      {showStickyHeader && (
        <div className="absolute top-0 left-0 right-0 bg-[#072447] z-50 flex items-center px-2 py-0.5">
          <button>
            <img
              className="w-16 h mül h-16 hover:brightness-75 transition-all duration-200"
              src="/icon/Play_GreemHover.png"
              alt="Play button"
            />
          </button>
          <h1 className="text-3xl font-bold text-white ml-1 tracking-wider">{user.username}</h1>
        </div>
      )}
      <div className="overflow-y-auto overlay-scroll pb-20" ref={scrollRef}>
        <div className="flex-1 flex">
          <div className="flex-1">
            <div className="relative">
              <img
                alt={user.username || user.email}
                className="w-full h-[300px] object-cover object-top"
                src={
                  user.avatar
                    ? user.avatar.startsWith("http")
                      ? user.avatar
                      : `https://localhost:3000${user.avatar}`
                    : "https://storage.googleapis.com/a1aa/image/N5Ae48WVgHcJ7vgKi6lA3tz5FvQ3gwiFky_1XteLMpY.jpg"
                }
              />
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="absolute bottom-7 left-5 space-y-3">
                <div className="flex items-center">
                  <img src="/icon/Verification.png" className="w-7 h-7 mr-1" alt="Verified" />
                  <p className="drop-shadow-xl text-white">Người dùng được xác minh</p>
                </div>
                <h1 className="text-6xl font-bold drop-shadow-xl tracking-wider text-white">
                  {user.username || user.email}
                </h1>
                {followersLoading ? (
                  <p className="text-gray-400 drop-shadow-xl">Đang tải số người theo dõi...</p>
                ) : (
                  <p
                    className="text-gray-400 drop-shadow-xl cursor-pointer hover:underline"
                    onClick={handleViewFollowers}
                  >
                    {followersInfo.followers_count} người theo dõi
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-b from-[#072447] to-neutral-900 relative">
              <div ref={optionRef} className="flex items-center px-2 py-4">
                <button
                  onClick={handleFollowToggle}
                  disabled={currentUserLoading || !currentUserId || isNaN(parseInt(userId))}
                  className={`text-white px-6 py-2 ml-2 rounded-full bg-opacity-0 bg-neutral-900 border-[1px] border-neutral-500 hover:border-[1.5px] hover:border-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </div>
              <h2 className="text-2xl font-bold px-6 pt-2 pb-2 text-white">Playlist công khai</h2>
            </div>
            <div className="mb-8 px-3">
              {loading ? (
                <p className="text-white">Đang tải...</p>
              ) : playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="px-2.5 pt-2.5 pb-3 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer"
                      onClick={() => navigate(`/PlaylistDetail/${playlist.id}`, { state: { playlist } })}
                    >
                      <div className="relative">
                        <img
                          alt={playlist.name}
                          className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                          src={playlist.image || "./img/default-avatar.jpg"}
                        />
                        <img
                          src="/icon/Play_GreemHover.png"
                          alt="Play"
                          className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                        />
                      </div>
                      <div className="truncate">
                        <h3 className="text-base font-bold text-white">{playlist.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400">Playlist</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white">Không tìm thấy playlist</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainFollowUser;