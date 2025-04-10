import React, { useState } from "react";
import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
import CreatePlaylist from '../Components/Playlist/CreatePlaylist';
function PlayListChill() {

    return (
        <>
            <div className="flex">
                <SideBar />
                <CreatePlaylist />
            </div>
            <BottomPlayer />
        </>
    );
}
export default PlayListChill;