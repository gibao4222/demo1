
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function MainSearch() {
//   const [users, setUsers] = useState(() => {
//     const savedUsers = localStorage.getItem("recentSearches");
//     return savedUsers ? JSON.parse(savedUsers) : [];
//   });
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8001/api/users/users/");
//         setUsers(response.data);
//         localStorage.setItem("recentSearches", JSON.stringify(response.data));
//         setLoading(false);
//       } catch (error) {
//         console.error("Lỗi khi lấy danh sách user:", error);
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const handleRemoveUser = (userId) => {
//     const updatedUsers = users.filter((user) => user.id !== userId);
//     setUsers(updatedUsers);
//     localStorage.setItem("recentSearches", JSON.stringify(updatedUsers));
//   };

//   const handleUserClick = (userId) => {
//     navigate(`/FollowUser/${userId}`);
//   };

//   return (
//     <div className="w-3/5 flex-1 p-4 overflow-y-auto">
//       <div className="flex items-center mb-8">
//         <img
//           className="text-xl mr-4"
//           src="./icon/Back.png"
//           alt="Search icon"
//           width="30.5"
//           style={{ height: "30px !important" }}
//         />
//         <input
//           className="flex-1 p-2 rounded-full bg-gray-800 text-white"
//           placeholder="Artists, songs, or podcasts"
//           type="text"
//         />
//         <div className="ml-4 flex items-center">
//           <img
//             alt="User avatar"
//             className="rounded-full"
//             height="30"
//             src="./img/AlbumCover4.png"
//             width="30"
//           />
//           <span className="ml-2"> davedirect3 </span>
//         </div>
//       </div>

//       <div className="mb-8">
//         <h2 className="text-2xl mb-4">Recent searches</h2>
//         {loading ? (
//           <div>Đang tải...</div>
//         ) : users.length === 0 ? (
//           <div>Không có user nào trong danh sách.</div>
//         ) : (
//           <div className="flex space-x-4 overflow-x-auto">
//             {users.map((user) => (
//               <div
//                 key={user.id}
//                 className="bg-gray-800 p-4 rounded-lg cursor-pointer"
//                 onClick={() => handleUserClick(user.id)}
//               >
//                 <img
//                   alt={user.username || user.email}
//                   className="rounded-full mb-2"
//                   height="100"
//                   src={
//                     user.avatar
//                       ? user.avatar
//                       : "https://via.placeholder.com/100"
//                   }
//                   width="100"
//                 />
//                 <div className="flex justify-between items-center">
//                   <span>{user.username || user.email}</span>
//                   <img
//                     src="./icon/Close_S.png"
//                     alt="Remove user"
//                     width="22.5"
//                     className="ml-2 cursor-pointer"
//                     style={{ height: "22px !important" }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleRemoveUser(user.id);
//                     }}
//                   />
//                 </div>
//                 <span className="text-gray-400">User</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Phần còn lại của giao diện giữ nguyên */}
//       <div className="mb-8">
//         <h2 className="text-2xl mb-4">Your top genres</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Pop </span>
//             <img
//               alt="Pop genre"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumCover2.png"
//             />
//           </div>
//           <div className="bg-orange-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Hip-Hop </span>
//             <img
//               alt="Hip-Hop genre"
//               className="rounded-lg absolute bottom-0 right-0"
//               src="./img/AlbumCover3.png"
//               style={{ height: "140px", width: "125px !important" }}
//             />
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-2xl mb-4">Browse all</h2>
//         <div className="grid grid-cols-4 gap-4">
//           <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Podcasts </span>
//             <img
//               alt="Podcasts"
//               className="rounded-lg absolute bottom-0 right-0"
//               src="./img/0a74d96e091a495bb09c0d83210910c3 6.png"
//               style={{ height: "140px", width: "125px !important" }}
//             />
//           </div>
//           <div className="bg-blue-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Made For You </span>
//             <img
//               alt="Made For You"
//               className="rounded-lg absolute bottom-0 right-0"
//               src="./img/AlbumArt.png"
//               style={{ height: "140px", width: "125px !important" }}
//             />
//           </div>
//           <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Charts </span>
//             <img
//               alt="Charts"
//               className="rounded-lg absolute bottom-0 right-0"
//               src="./img/AlbumArt1.png"
//               style={{ height: "140px", width: "125px !important" }}
//             />
//           </div>
//           <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> New Releases </span>
//             <img
//               alt="New Releases"
//               className="rounded-lg absolute bottom-0 right-0"
//               src="./img/AlbumArt10.png"
//               style={{ height: "140px", width: "125px !important" }}
//             />
//           </div>
//           <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Discover </span>
//             <img
//               alt="Discover"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt11.png"
//             />
//           </div>
//           <div className="bg-blue-800 p-4 rounded-lg relative min-h-[180px]">
//             <span> Concerts </span>
//             <img
//               alt="Concerts"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt12.png"
//             />
//           </div>
//           <div className="bg-pink-800 p-4 rounded-lg relative min-h-[180px]">
//             <span> R&B </span>
//             <img
//               alt="R&B"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt13.png"
//             />
//           </div>
//           <div className="bg-gray-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Frequency </span>
//             <img
//               alt="Frequency"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt14.png"
//             />
//           </div>
//           <div className="bg-blue-400 p-4 rounded-lg relative min-h-[180px]">
//             <span> Christian & Gospel </span>
//             <img
//               alt="Christian & Gospel"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt15.png"
//             />
//           </div>
//           <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Soul </span>
//             <img
//               alt="Soul"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt16.png"
//             />
//           </div>
//           <div className="bg-blue-300 p-4 rounded-lg relative min-h-[180px]">
//             <span> Chill </span>
//             <img
//               alt="Chill"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt2.png"
//             />
//           </div>
//           <div className="bg-purple-400 p-4 rounded-lg relative min-h-[180px]">
//             <span> Mood </span>
//             <img
//               alt="Mood"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt3.png"
//             />
//           </div>
//           <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Equal </span>
//             <img
//               alt="Equal"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt4.png"
//             />
//           </div>
//           <div className="bg-teal-400 p-4 rounded-lg relative min-h-[180px]">
//             <span> Alternative </span>
//             <img
//               alt="Alternative"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt5.png"
//             />
//           </div>
//           <div className="bg-gray-700 p-4 rounded-lg relative min-h-[180px]">
//             <span> Workout </span>
//             <img
//               alt="Workout"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt6.png"
//             />
//           </div>
//           <div className="bg-pink-700 p-4 rounded-lg relative min-h-[180px]">
//             <span> Party </span>
//             <img
//               alt="Party"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt7.png"
//             />
//           </div>
//           <div className="bg-purple-400 p-4 rounded-lg relative min-h-[180px]">
//             <span> Pop </span>
//             <img
//               alt="Pop"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt8.png"
//             />
//           </div>
//           <div className="bg-orange-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Hip-Hop </span>
//             <img
//               alt="Hip-Hop"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt9.png"
//             />
//           </div>
//           <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Afro </span>
//             <img
//               alt="Afro"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/0a74d96e091a495bb09c0d83210910c3 5.png"
//             />
//           </div>
//           <div className="bg-blue-600 p-4 rounded-lg relative min-h-[180px]">
//             <span> Rewind </span>
//             <img
//               alt="Rewind"
//               className="rounded-lg absolute bottom-0 right-0"
//               style={{ height: "140px", width: "125px !important" }}
//               src="./img/AlbumArt16.png"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MainSearch;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MainSearch() {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("recentSearches");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/api/users/users/");
        if (Array.isArray(response.data)) {
          setUsers(response.data);
          localStorage.setItem("recentSearches", JSON.stringify(response.data));
        } else {
          console.error("Dữ liệu từ API không phải là mảng:", response.data);
          setUsers([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
        setUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
      <div className="flex items-center mb-8">
        <img
          className="text-xl mr-4"
          src="./icon/Back.png"
          alt="Search icon"
          width="30.5"
          style={{ height: "30px !important" }}
        />
        <input
          className="flex-1 p-2 rounded-full bg-gray-800 text-white"
          placeholder="Users, songs, or podcasts"
          type="text"
        />
        <div className="ml-4 flex items-center">
          <img
            alt="User avatar"
            className="rounded-full"
            height="30"
            src="./img/AlbumCover4.png"
            width="30"
          />
          <span className="ml-2"> davedirect3 </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Recent searches</h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : users.length === 0 ? (
          <div>Không có user nào trong danh sách.</div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <img
                  alt={user.username || user.email}
                  className="rounded-full mb-2"
                  height="100"
                  src={
                    user.avatar
                      ? user.avatar
                      : "https://via.placeholder.com/100"
                  }
                  width="100"
                />
                <div className="flex justify-between items-center">
                  <span>{user.username || user.email}</span>
                  <img
                    src="./icon/Close_S.png"
                    alt="Remove user"
                    width="22.5"
                    className="ml-2 cursor-pointer"
                    style={{ height: "22px !important" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUser(user.id);
                    }}
                  />
                </div>
                <span className="text-gray-400">User</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl mb-4">Your top genres</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Pop </span>
            <img
              alt="Pop genre"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumCover2.png"
            />
          </div>
          <div className="bg-orange-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Hip-Hop </span>
            <img
              alt="Hip-Hop genre"
              className="rounded-lg absolute bottom-0 right-0"
              src="./img/AlbumCover3.png"
              style={{ height: "140px", width: "125px !important" }}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl mb-4">Browse all</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Podcasts </span>
            <img
              alt="Podcasts"
              className="rounded-lg absolute bottom-0 right-0"
              src="./img/0a74d96e091a495bb09c0d83210910c3 6.png"
              style={{ height: "140px", width: "125px !important" }}
            />
          </div>
          <div className="bg-blue-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Made For You </span>
            <img
              alt="Made For You"
              className="rounded-lg absolute bottom-0 right-0"
              src="./img/AlbumArt.png"
              style={{ height: "140px", width: "125px !important" }}
            />
          </div>
          <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Charts </span>
            <img
              alt="Charts"
              className="rounded-lg absolute bottom-0 right-0"
              src="./img/AlbumArt1.png"
              style={{ height: "140px", width: "125px !important" }}
            />
          </div>
          <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
            <span> New Releases </span>
            <img
              alt="New Releases"
              className="rounded-lg absolute bottom-0 right-0"
              src="./img/AlbumArt10.png"
              style={{ height: "140px", width: "125px !important" }}
            />
          </div>
          <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Discover </span>
            <img
              alt="Discover"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt11.png"
            />
          </div>
          <div className="bg-blue-800 p-4 rounded-lg relative min-h-[180px]">
            <span> Concerts </span>
            <img
              alt="Concerts"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt12.png"
            />
          </div>
          <div className="bg-pink-800 p-4 rounded-lg relative min-h-[180px]">
            <span> R&B </span>
            <img
              alt="R&B"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt13.png"
            />
          </div>
          <div className="bg-gray-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Frequency </span>
            <img
              alt="Frequency"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt14.png"
            />
          </div>
          <div className="bg-blue-400 p-4 rounded-lg relative min-h-[180px]">
            <span> Christian & Gospel </span>
            <img
              alt="Christian & Gospel"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt15.png"
            />
          </div>
          <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Soul </span>
            <img
              alt="Soul"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt16.png"
            />
          </div>
          <div className="bg-blue-300 p-4 rounded-lg relative min-h-[180px]">
            <span> Chill </span>
            <img
              alt="Chill"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt2.png"
            />
          </div>
          <div className="bg-purple-400 p-4 rounded-lg relative min-h-[180px]">
            <span> Mood </span>
            <img
              alt="Mood"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt3.png"
            />
          </div>
          <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Equal </span>
            <img
              alt="Equal"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt4.png"
            />
          </div>
          <div className="bg-teal-400 p-4 rounded-lg relative min-h-[180px]">
            <span> Alternative </span>
            <img
              alt="Alternative"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt5.png"
            />
          </div>
          <div className="bg-gray-700 p-4 rounded-lg relative min-h-[180px]">
            <span> Workout </span>
            <img
              alt="Workout"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt6.png"
            />
          </div>
          <div className="bg-pink-700 p-4 rounded-lg relative min-h-[180px]">
            <span> Party </span>
            <img
              alt="Party"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt7.png"
            />
          </div>
          <div className="bg-purple-400 p-4 rounded-lg relative min-h-[180px]">
            <span> Pop </span>
            <img
              alt="Pop"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt8.png"
            />
          </div>
          <div className="bg-orange-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Hip-Hop </span>
            <img
              alt="Hip-Hop"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt9.png"
            />
          </div>
          <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Afro </span>
            <img
              alt="Afro"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/0a74d96e091a495bb09c0d83210910c3 5.png"
            />
          </div>
          <div className="bg-blue-600 p-4 rounded-lg relative min-h-[180px]">
            <span> Rewind </span>
            <img
              alt="Rewind"
              className="rounded-lg absolute bottom-0 right-0"
              style={{ height: "140px", width: "125px !important" }}
              src="./img/AlbumArt16.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainSearch;






