import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

function MainSearch({ searchQuery }) {
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setUsers([]);
        setArtists([]);
        setSongs([]);
        setPlaylists([]);
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
        const songResponse = await axios.get(`/api/songs/songs/?search=${searchQuery}`);
        console.log("Dữ liệu bài hát từ API:", songResponse.data);
        if (Array.isArray(songResponse.data)) {
          setSongs(songResponse.data);
          console.log("songs state:", songResponse.data);
        } else {
          console.error("Dữ liệu bài hát từ API không phải là mảng:", songResponse.data);
          setSongs([]);
        }
        
        //Tìm kiếm Playlist
        const playlistResponse = await axios.get(`/api/playlists/playlists/?search=${searchQuery}`);
        console.log("Dữ liệu playlist từ API:", playlistResponse.data);
        if (Array.isArray(playlistResponse.data)) {
          setPlaylists(playlistResponse.data);
          console.log("playlists state:", playlistResponse.data);
        } else {
          console.error("Dữ liệu playlist từ API không phải là mảng:", playlistResponse.data);
          setPlaylists([]);
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
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <div className="z-0 bg-neutral-900 rounded-lg flex flex-col h-[calc(100vh-136px)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto overlay-scroll">
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Bài hát</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : songs.length > 0 ? (
          <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {songs.map((song) => (
              <div
                key={song.id}
                className="px-2.5 pt-2.5 pb-3 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer "
                onClick={() => navigate(`/SongDetail/{song.id}`)}
              >
                <div className="relative">
                  <img
                    alt={song.name}
                    className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                    src={song.image || "./img/default-avatar.jpg"}
                    loading="lazy"
                  />

                  < img
                    src="/icon/Play_GreemHover.png"
                    alt="Play"
                    className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                  />
                </div>
                <div className="truncate">
                  <h3 className="text-base font-bold">{song.name}</h3>
                </div>
                <div className="truncate">
                <p className="text-sm text-gray-400">
                  {song.artists && song.artists.length > 0
                    ? song.artists.map(artist => artist.name).join(", ")
                    : "Không có nghệ sĩ"}
                </p>
                </div>
                
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
          <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="px-2.5 pt-2.5 pb-3 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer "
                onClick={() => navigate(`/FollowSinger/${artist.id}`)}
              >
                <div className="relative">
                  <img
                    alt={artist.name}
                    className="mb-2 rounded-full w-[170px] h-[170px] object-cover"
                    src={artist.image && artist.image !== "" ? artist.image : "/img/default-avatar.jpg"}
                    // style={{ height: "180px", width: "180px !important" }}
                    loading="lazy"
                  />

                  < img
                    src="/icon/Play_GreemHover.png"
                    alt="Play"
                    className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                  />

                </div>
                <div className="truncate">
                  <h3 className="text-base font-bold">{artist.name}</h3>
                </div>
                <p className="text-sm text-gray-400">Artist</p>

              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy nghệ sĩ</p>
        )}
      </div>


      




      <div className="mb-8">
        <h2 className="text-2xl mb-4">Album</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : albums.length > 0 ? (
          <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {albums.map((album) => (
              <div
                key={album.id}
                className="px-2.5 pt-2.5 pb-3 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer"
                onClick={() => navigate(`/AlbumDetail/${album.id}`)}
              >
                <div className="relative">
                  <img
                    alt={album.name}
                    className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                    src={album.image || "./img/default-avatar.jpg"}
                    // style={{ height: "140px", width: "125px !important" }}
                  />
                  < img
                    src="/icon/Play_GreemHover.png"
                    alt="Play"
                    className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                  />
                </div>
                <div className="truncate">
                  <h3 className="text-base font-bold">{album.name}</h3>
                </div>
                
                <p className="text-sm text-gray-400">Album</p>

              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy album</p>
        )}
      </div>

      
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Playlist</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : playlists.length > 0 ? (
          <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="px-2.5 pt-2.5 pb-3 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer"
                onClick={() => navigate(`/PlaylistDetail/${playlist.id}`)}
              >
                <div className="relative">
                  <img
                    alt={playlist.name}
                    className="mb-2 rounded-lg w-[180px] h-[180px] object-cover"
                    src={playlist.image || "./img/default-avatar.jpg"}
                    // style={{ height: "140px", width: "125px !important" }}
                  />
                  < img
                    src="/icon/Play_GreemHover.png"
                    alt="Play"
                    className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                  />
                </div>
                <div className="truncate">
                  <h3 className="text-base font-bold">{playlist.name}</h3>
                </div>
                
                <p className="text-sm text-gray-400">Playlist</p>

              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy playlist</p>
        )}
      </div>


      <div className="mb-8">
        <h2 className="text-2xl mb-4">Hồ sơ</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : users.length > 0 ? (
          <div className="flex flex-row overflow-x-auto space-x-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="px-2.5 pt-2.5 pb-3 rounded-lg flex-shrink-0 w-[190px] hover:bg-neutral-400 hover:bg-opacity-35 group cursor-pointer "
                onClick={() => navigate(`/FollowUser/${user.id}`)}
              >
                <div className="relative">
                  <img
                    alt={user.username}
                    className="mb-2 rounded-full w-[170px] h-[170px] object-cover"
                    src={user.avatar || "./img/default-avatar.jpg"}
                    // style={{ height: "140px", width: "125px !important" }}
                    loading="lazy"
                  />
                  {/* < img
                    src="/icon/Play_GreemHover.png"
                    alt="Play"
                    className="absolute bottom-0.5 right-0.5 hidden group-hover:block h-16 w-16 hover:brightness-75 transition-all duration-300"
                  /> */}

                </div>
                <div className="truncate">
                  <h3 className="text-base font-bold">{user.username}</h3>
                </div>
                <p className="text-sm text-gray-400">Profile</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Không tìm thấy user</p>
        )}
      </div>


    </div>
    </div>
  );
}

export default MainSearch;