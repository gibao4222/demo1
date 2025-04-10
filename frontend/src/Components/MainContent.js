import React, { useState } from "react";

const MainContent = ({ user, onLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    return (
        <div className="w-3/5 pb-20 bg-black">
            <div className="bg-gradient-to-b from-blue-900 to-gray  p-4 flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center pt-2">
                        <button className="mr-4">
                            <img alt="" src="./icon/Back.png" />
                        </button>
                        <button>
                            <img alt="" src="/icon/Forward.png" />
                        </button>
                    </div>

                    <div className="relative flex items-center space-x-3">
                        {/* Thông tin người dùng */}
                        <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
                            <img
                                alt="Ảnh đại diện người dùng"
                                className="rounded-full mr-2"
                                height="34"
                                src="https://storage.googleapis.com/a1aa/image/6sVoYM2pamiUdQsWFX8T8LQS67Jh6kXukrbBfDdK9Wg.jpg"
                                width="34"
                            />
                            <div className="text-white">
                                <span className="font-semibold">{user.username || "Guest"}</span>
                                <div className="text-sm text-gray-400">
                                    {user?.role || "User"} {user.vip && <span className="text-yellow-400">• VIP</span>}
                                </div>
                            </div>
                            <img
                                alt="Menu thả xuống"
                                src="./icon/Polygon3.png"
                                className={`rounded-full mr-2 ml-1 pt-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                height="20"
                                width="20"
                            />
                        </div>

                        {/* Menu thả xuống */}
                        {isDropdownOpen && (
                            <div className="absolute top-12 right-0 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                                <ul className="py-2">
                                    <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer">
                                        Tài khoản
                                    </li>
                                    <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer">
                                        Hồ sơ
                                    </li>
                                    <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer">
                                        Nâng cấp lên Premium
                                    </li>
                                    <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer">
                                        Hỗ trợ
                                    </li>
                                    <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer">
                                        Tải xuống
                                    </li>
                                    <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer">
                                        Cài đặt
                                    </li>
                                    <li className="border-t border-gray-600 px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                                        onClick={() => {
                                            onLogout();
                                            setIsDropdownOpen(false); // Đóng menu sau khi đăng xuất
                                        }}
                                    >
                                        Đăng xuất
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-8">
                    Good afternoon
                </h1>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                        <img alt="" src="./img/AlbumCover.png" className=" object-cover mr-4" />
                        Chill Mix
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                        <img alt="" src="./img/AlbumCover1.png" className=" object-cover mr-4" />
                        Pop Mix
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                        <img alt="" src="./img/AlbumCover2.png" className=" object-cover mr-4" />
                        Daily Mix 1
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                        <img alt="" src="./img/AlbumCover3.png" className=" object-cover mr-4" />
                        Daily Mix 5
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                        <img alt="" src="./img/AlbumCover4.png" className=" object-cover mr-4" />
                        Folk &amp; Acoustic Mix
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg rounded-lg flex items-center">
                        <img alt="" src="./img/AlbumCover5.png" className=" object-cover mr-4" />
                        Daily Mix 4
                    </div>
                </div>
            </div>
            <div className="mb-8 pl-6 pr-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Your top mixes
                    </h2>
                    <button className="text-gray-400" >
                        SEE ALL
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Chill Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/7yje2Ka-mi-swAHWXz4IBZxyVgaUG4b88X9_OuueHAg.jpg" width="150" />
                        <h3 className="font-bold">
                            Chill Mix
                        </h3>
                        <p>
                            Julia Wolf, VÉRITÉ, ayokay and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pop Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/KRZdw9jVBRlVCkwretdJ_rPYTgPN2FbUMzdJSLYwQew.jpg" width="150" />
                        <h3 className="font-bold">
                            Pop Mix
                        </h3>
                        <p>
                            Hey Violet, VÉRITÉ, TimAtlas and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pheelz Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/2AWg7ppU5y0Wamk9zbPIitFcHDQwebUTTeqxJohgrsU.jpg" width="150" />
                        <h3 className="font-bold">
                            Pheelz Mix
                        </h3>
                        <p>
                            Pheelz, Maxo, Tinashe and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Indie Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/2BwW-EiDdFhQ_oxzRfKeNNsMcGnL2olgEZYg597t2Fc.jpg" width="150" />
                        <h3 className="font-bold">
                            Indie Mix
                        </h3>
                        <p>
                            Vance Joy, The Neighbourhood and more
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-8 pl-6 pr-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Made for you
                    </h2>
                    <button className="text-gray-400">
                        SEE ALL
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Folk &amp; Acoustic Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/gE0F6dqPgLoWpc9zXgrnkemzzIQGv_Z_3gEhnyrqqkE.jpg" width="150" />
                        <h3 className="font-bold">
                            Folk &amp; Acoustic Mix
                        </h3>
                        <p>
                            Caamp, City, Clockwork, Sufl, Gregory Alan
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Daily Mix 1" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/tEIQP60xiYvlOSKa3ad31rzlRf5T1lHZuPHfW2mrKjA.jpg" width="150" />
                        <h3 className="font-bold">
                            Daily Mix 1
                        </h3>
                        <p>
                            Amy Shark, Lil Nas X, Ed Sheeran and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Daily Mix 5" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/kay7A1G5_FwrM4uPPXVj-Hy7aBHbHeUR97CDgx8m5_c.jpg" width="150" />
                        <h3 className="font-bold">
                            Daily Mix 5
                        </h3>
                        <p>
                            FRENSHIP, Brook Sienna, Julia Wolf and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pop Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/KRZdw9jVBRlVCkwretdJ_rPYTgPN2FbUMzdJSLYwQew.jpg" width="150" />
                        <h3 className="font-bold">
                            Pop Mix
                        </h3>
                        <p>
                            Hey Violet, VÉRITÉ, TimAtlas and more
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-8 pl-6 pr-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Recently played
                    </h2>
                    <button className="text-gray-400">
                        SEE ALL
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Chill Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/7yje2Ka-mi-swAHWXz4IBZxyVgaUG4b88X9_OuueHAg.jpg" width="150" />
                        <h3 className="font-bold">
                            Chill Mix
                        </h3>
                        <p>
                            Julia Wolf, VÉRITÉ, ayokay and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pop Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/KRZdw9jVBRlVCkwretdJ_rPYTgPN2FbUMzdJSLYwQew.jpg" width="150" />
                        <h3 className="font-bold">
                            Pop Mix
                        </h3>
                        <p>
                            Hey Violet, VÉRITÉ, TimAtlas and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pheelz Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/2AWg7ppU5y0Wamk9zbPIitFcHDQwebUTTeqxJohgrsU.jpg" width="150" />
                        <h3 className="font-bold">
                            Pheelz Mix
                        </h3>
                        <p>
                            Pheelz, Maxo, Tinashe and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Indie Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/2BwW-EiDdFhQ_oxzRfKeNNsMcGnL2olgEZYg597t2Fc.jpg" width="150" />
                        <h3 className="font-bold">
                            Indie Mix
                        </h3>
                        <p>
                            Vance Joy, The Neighbourhood and more
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-8 pl-6 pr-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Jump back in
                    </h2>
                    <button className="text-gray-400">
                        SEE ALL
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Folk &amp; Acoustic Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/gE0F6dqPgLoWpc9zXgrnkemzzIQGv_Z_3gEhnyrqqkE.jpg" width="150" />
                        <h3 className="font-bold">
                            Folk &amp; Acoustic Mix
                        </h3>
                        <p>
                            Caamp, City, Clockwork, Sufl, Gregory Alan
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Daily Mix 1" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/tEIQP60xiYvlOSKa3ad31rzlRf5T1lHZuPHfW2mrKjA.jpg" width="150" />
                        <h3 className="font-bold">
                            Daily Mix 1
                        </h3>
                        <p>
                            Amy Shark, Lil Nas X, Ed Sheeran and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Daily Mix 5" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/kay7A1G5_FwrM4uPPXVj-Hy7aBHbHeUR97CDgx8m5_c.jpg" width="150" />
                        <h3 className="font-bold">
                            Daily Mix 5
                        </h3>
                        <p>
                            FRENSHIP, Brook Sienna, Julia Wolf and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pop Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/KRZdw9jVBRlVCkwretdJ_rPYTgPN2FbUMzdJSLYwQew.jpg" width="150" />
                        <h3 className="font-bold">
                            Pop Mix
                        </h3>
                        <p>
                            Hey Violet, VÉRITÉ, TimAtlas and more
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-8 pl-6 pr-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Uniquely yours
                    </h2>
                    <button className="text-gray-400">
                        SEE ALL
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Chill Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/7yje2Ka-mi-swAHWXz4IBZxyVgaUG4b88X9_OuueHAg.jpg" width="150" />
                        <h3 className="font-bold">
                            Chill Mix
                        </h3>
                        <p>
                            Julia Wolf, VÉRITÉ, ayokay and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pop Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/KRZdw9jVBRlVCkwretdJ_rPYTgPN2FbUMzdJSLYwQew.jpg" width="150" />
                        <h3 className="font-bold">
                            Pop Mix
                        </h3>
                        <p>
                            Hey Violet, VÉRITÉ, TimAtlas and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pheelz Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/2AWg7ppU5y0Wamk9zbPIitFcHDQwebUTTeqxJohgrsU.jpg" width="150" />
                        <h3 className="font-bold">
                            Pheelz Mix
                        </h3>
                        <p>
                            Pheelz, Maxo, Tinashe and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Indie Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/2BwW-EiDdFhQ_oxzRfKeNNsMcGnL2olgEZYg597t2Fc.jpg" width="150" />
                        <h3 className="font-bold">
                            Indie Mix
                        </h3>
                        <p>
                            Vance Joy, The Neighbourhood and more
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-8 pl-6 pr-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Just the hits
                    </h2>
                    <button className="text-gray-400">
                        SEE ALL
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Folk &amp; Acoustic Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/gE0F6dqPgLoWpc9zXgrnkemzzIQGv_Z_3gEhnyrqqkE.jpg" width="150" />
                        <h3 className="font-bold">
                            Folk &amp; Acoustic Mix
                        </h3>
                        <p>
                            Caamp, City, Clockwork, Sufl, Gregory Alan
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Daily Mix 1" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/tEIQP60xiYvlOSKa3ad31rzlRf5T1lHZuPHfW2mrKjA.jpg" width="150" />
                        <h3 className="font-bold">
                            Daily Mix 1
                        </h3>
                        <p>
                            Amy Shark, Lil Nas X, Ed Sheeran and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Daily Mix 5" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/kay7A1G5_FwrM4uPPXVj-Hy7aBHbHeUR97CDgx8m5_c.jpg" width="150" />
                        <h3 className="font-bold">
                            Daily Mix 5
                        </h3>
                        <p>
                            FRENSHIP, Brook Sienna, Julia Wolf and more
                        </p>
                    </div>
                    <div className="bg-gray-500 bg-opacity-30 backdrop-blur-lg p-4 rounded-lg">
                        <img alt="Pop Mix" className="mb-2" height="150" src="https://storage.googleapis.com/a1aa/image/KRZdw9jVBRlVCkwretdJ_rPYTgPN2FbUMzdJSLYwQew.jpg" width="150" />
                        <h3 className="font-bold">
                            Pop Mix
                        </h3>
                        <p>
                            Hey Violet, VÉRITÉ, TimAtlas and more
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainContent;