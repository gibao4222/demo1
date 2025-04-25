import React, { useState } from "react";
// import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
// import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
// import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
// import MainSearch from '/var/www/demo1/frontend/src/Components/MainSearch';
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import FriendActivity from "../Components/FriendActivity";
import BottomPlayer from "../Components/BottomPlayer";
import MainSearch from "../Components/MainSearch";

function PlayListChill() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar onSearch={handleSearch} />
      <div className="flex flex-1">
        <SideBar />
        <MainSearch searchQuery={searchQuery} />
        <FriendActivity />
      </div>
      <BottomPlayer />
    </div>
  );
}

export default PlayListChill;