import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function MainSearch({ searchQuery }) {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("recentSearches");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setUsers([]);
        setArtists([]);
        setSongs([]);
        return;
      }

      setLoading(true);
      try {
        // Tìm kiếm user
        const userResponse = await axios.get(`/api/users/users/search/?search=${searchQuery}`);
        if (Array.isArray(userResponse.data)) {
          setUsers(userResponse.data);
          localStorage.setItem("recentSearches", JSON.stringify(userResponse.data));
        } else {
          console.error("Dữ liệu user từ API không phải là mảng:", userResponse.data);
          setUsers([]);
        }

        // Tìm kiếm nghệ sĩ
        const artistResponse = await axios.get(`/api/users/singers/search/?search=${searchQuery}`);
        console.log("Dữ liệu nghệ sĩ từ API:", artistResponse.data);
        if (Array.isArray(artistResponse.data)) {
          setArtists(artistResponse.data);
        } else {
          console.error("Dữ liệu nghệ sĩ từ API không phải là mảng:", artistResponse.data);
          setArtists([]);
        }

        // Tìm kiếm bài hát
        const songResponse = await axios.get(`/api/users/songs/songs/?search=${searchQuery}`); // Giữ đúng endpoint
        console.log("Dữ liệu bài hát từ API:", songResponse.data);
        if (Array.isArray(songResponse.data)) {
          setSongs(songResponse.data);
          console.log("songs state:", songResponse.data); // Debug
        } else {
          console.error("Dữ liệu bài hát từ API không phải là mảng:", songResponse.data);
          setSongs([]);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        setUsers([]);
        setArtists([]);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleRemoveUser = (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem("recentSearches", JSON.stringify(updatedUsers));
  };

  const handleUserClick = (userId) => {
    navigate(`/FollowUser/${userId}`);
  };

  return (
    <div className="w-3/5 flex-1 p-4 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Hồ sơ</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-green-600 p-4 rounded-lg relative min-h-[180px] cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <span>{user.username}</span>
                <button
                  className="absolute top-2 right-2 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUser(user.id);
                  }}
                >
                  X
                </button>
                <img
                  alt={user.username}
                  className="rounded-lg absolute bottom-0 right-0"
                  src={user.avatar || "./img/default-avatar.png"}
                  style={{ height: "140px", width: "125px !important" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy user</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Nghệ sĩ</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : artists.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-green-600 p-4 rounded-lg relative min-h-[180px] cursor-pointer"
                onClick={() => navigate(`/FollowSinger/${artist.id}`)}
              >
                <span>{artist.name}</span>
                <img
                  alt={artist.name}
                  className="rounded-lg absolute bottom-0 right-0"
                  src={artist.avatar || "./img/default-avatar.png"}
                  style={{ height: "140px", width: "125px !important" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy nghệ sĩ</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Bài hát</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-green-600 p-4 rounded-lg relative min-h-[180px] cursor-pointer"
                onClick={() => navigate(`/SongDetail/${song.id}`)}
              >
                <span>{song.name}</span>
                <img
                  alt={song.name}
                  className="rounded-lg absolute bottom-0 right-0"
                  src={song.image || "./img/default-avatar.png"} // Sửa avatar thành image
                  style={{ height: "140px", width: "125px !important" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy bài hát</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Album</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
            <span>Podcasts</span>
            <img
              alt="Podcasts"
              className="rounded-lg absolute bottom-0 right-0"
              src="./img/0a74d96e091a495bb09c0d83210910c3 6.png"
              style={{ height: "140px", width: "125px !important" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainSearch;