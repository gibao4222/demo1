import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function MainSearch({ searchQuery }) {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setUsers([]);
        setArtists([]);
        setSongs([]);
        setAlbums([]);
        return;
      }

      setLoading(true);
      try {
        // Tìm kiếm user
        const userResponse = await axios.get(`/api/users/users/search/?search=${searchQuery}`);
        console.log("Dữ liệu user từ API:", userResponse.data);
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
        const songResponse = await axios.get(`/api/users/songs/songs/?search=${searchQuery}`); 
        console.log("Dữ liệu bài hát từ API:", songResponse.data);
        if (Array.isArray(songResponse.data)) {
          setSongs(songResponse.data);
          console.log("songs state:", songResponse.data); 
        } else {
          console.error("Dữ liệu bài hát từ API không phải là mảng:", songResponse.data);
          setSongs([]);
        }

        // Tìm kiếm albums
        const albumResponse = await axios.get(`/api/users/albums/search/?search=${searchQuery}`);
        console.log("Dữ liệu album từ API:", albumResponse.data);
        if (Array.isArray(albumResponse.data)) {
          setAlbums(albumResponse.data);
          console.log("albums state:", albumResponse.data);
        } else {
          console.error("Dữ liệu albums từ API không phải là mảng:", albumResponse.data);
          setAlbums([]);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        setUsers([]);
        setArtists([]);
        setSongs([]);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <div className="w-3/5 flex-1 p-4 overflow-y-auto">


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
                  src={song.image || "./img/default-avatar.png"} 
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
        <h2 className="text-2xl mb-4">Hồ sơ</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-green-600 p-4 rounded-lg relative min-h-[180px] cursor-pointer"
                onClick={() => navigate(`/FollowUser/${user.id}`)}
              >
                <span>{user.username}</span>
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
        <h2 className="text-2xl mb-4">Album</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-green-600 p-4 rounded-lg relative min-h-[180px] cursor-pointer"
                onClick={() => navigate(`/AlbumDetail`)}
              >
                <span>{album.name}</span>
                <img
                  alt={album.name}
                  className="rounded-lg absolute bottom-0 right-0"
                  src={album.image || "./img/default-avatar.png"}
                  style={{ height: "140px", width: "125px !important" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy album</p>
        )}
      </div>
    </div>
  );
}

export default MainSearch;