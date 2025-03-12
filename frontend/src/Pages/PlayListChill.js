import React, { useEffect, useState } from "react";
import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
import MainContent_PLChill from '/var/www/demo1/frontend/src/Components/MainContent_PLChill';
import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
import Main_Search from '/var/www/demo1/frontend/src/Components/Main_Search';


function PlayListChill(){
    
    return (
        <>
            <div className="flex">
                <SideBar/>
                <MainContent_PLChill/>
                <FriendActivity/>
            </div>
            <BottomPlayer/>
        </>
    );
}
export default PlayListChill;