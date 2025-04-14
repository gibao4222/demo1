// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// function MainSinger() {
//   const [artists, setArtists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAll, setShowAll] = useState(false);

//   useEffect(() => {
//     const fetchArtists = async () => {
//       try {
//         // Sửa URL thành /api/singers/singers/
//         const response = await axios.get("http://localhost:8000/api/singers/singers/");
//         if (Array.isArray(response.data)) {
//           setArtists(response.data);
//         } else {
//           console.error("Dữ liệu từ API không phải là mảng:", response.data);
//           setArtists([]);
//           toast.error("Dữ liệu nghệ sĩ không đúng định dạng!");
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Lỗi khi lấy danh sách nghệ sĩ:", error);
//         toast.error("Không thể tải danh sách nghệ sĩ!");
//         setArtists([]);
//         setLoading(false);
//       }
//     };

//     fetchArtists();
//   }, []);

//   if (loading) {
//     return <div>Đang tải...</div>;
//   }

//   return (
//     <div className="bg-black text-white font-sans">
//       <div className="flex h-screen">
//         <div className="flex-1 p-4">
//           <div className="flex items-center space-x-4 mb-6">
//             <button className="bg-gray-800 px-4 py-2 rounded-full">
//               Tất cả
//             </button>
//             <button className="bg-gray-800 px-4 py-2 rounded-full">
//               Âm nhạc
//             </button>
//             <button className="bg-gray-800 px-4 py-2 rounded-full">
//               Podcasts
//             </button>
//           </div>

//           <h2 className="text-2xl font-bold mb-4">Nghệ sĩ yêu thích của bạn</h2>
//           <div className="flex space-x-4">
//             {(showAll ? artists : artists.slice(0, 4)).map((artist) => (
//               <div key={artist.id} className="text-center">
//                 <img
//                   alt={artist.name}
//                   className="w-24 h-24 rounded-full"
//                   height="100"
//                   src={
//                     artist.image
//                       ? `http://localhost:8000/media/${artist.image}`
//                       : "https://storage.googleapis.com/a1aa/image/_CJYsizjY3hL_rf2L0alx_iaUDz0EXttAkg_pl1vBNE.jpg"
//                   }
//                   width="100"
//                 />
//                 <p className="font-bold">{artist.name}</p>
//                 <p className="text-sm text-gray-500">Nghệ sĩ</p>
//               </div>
//             ))}
//             <div className="text-center">
//               <p
//                 className="font-bold text-gray-500 cursor-pointer"
//                 onClick={() => setShowAll(!showAll)}
//               >
//                 {showAll ? "Thu gọn" : "Hiện tất cả"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MainSinger;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // Thêm Link để điều hướng

function MainSinger() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get("https://localhost/api/singers/singers/");
        if (Array.isArray(response.data)) {
          setArtists(response.data);
        } else {
          console.error("Dữ liệu từ API không phải là mảng:", response.data);
          setArtists([]);
          toast.error("Dữ liệu nghệ sĩ không đúng định dạng!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nghệ sĩ:", error);
        toast.error("Không thể tải danh sách nghệ sĩ!");
        setArtists([]);
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="bg-black text-white font-sans">
      <div className="flex h-screen">
        <div className="flex-1 p-4">
          <div className="flex items-center space-x-4 mb-6">
            <button className="bg-gray-800 px-4 py-2 rounded-full">
              Tất cả
            </button>
            <button className="bg-gray-800 px-4 py-2 rounded-full">
              Âm nhạc
            </button>
            <button className="bg-gray-800 px-4 py-2 rounded-full">
              Podcasts
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-4">Nghệ sĩ yêu thích của bạn</h2>
          <div className="flex space-x-4">
            {(showAll ? artists : artists.slice(0, 4)).map((artist) => (
              <Link to={`/FollowSinger/${artist.id}`} key={artist.id} className="text-center">
                <img
                  alt={artist.name}
                  className="w-24 h-24 rounded-full"
                  height="100"
                  src={
                    artist.image
                      ? artist.image.startsWith('http')
                        ? artist.image
                        : `/media/${artist.image}`
                      : "https://storage.googleapis.com/a1aa/image/_CJYsizjY3hL_rf2L0alx_iaUDz0EXttAkg_pl1vBNE.jpg" 
                  }
                  width="100"
                />
                <p className="font-bold">{artist.name}</p>
                <p className="text-sm text-gray-500">Nghệ sĩ</p>
              </Link>
            ))}
            <div className="text-center">
              <p
                className="font-bold text-gray-500 cursor-pointer"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Thu gọn" : "Hiện tất cả"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainSinger;