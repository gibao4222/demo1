import React, { useState } from "react";
import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
import MainContentPLChill from '../Components/MainContentPLChill';
import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
import MainSearch from '/var/www/demo1/frontend/src/Components/MainSearch';


function PlayListChill() {

    return (
        <>
            <div className="flex">
                <SideBar />
                <MainContentPLChill />
                <FriendActivity />
            </div>
            <BottomPlayer />
        </>
    );
}
export default PlayListChill;