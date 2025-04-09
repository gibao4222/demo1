import React, {  useState } from "react";
import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
import MainContentPLChill from '../Components/MainContentPLChill';
import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';
import MainSearch from '/var/www/demo1/frontend/src/Components/MainSearch';
import MainFollowSinger from '/var/www/demo1/frontend/src/Components/MainFollowSinger';
import MainContent from '/var/www/demo1/frontend/src/Components/MainCotent';
import MainSinger from '/var/www/demo1/frontend/src/Components/MainSinger';
function FollowSinger(){
    
    return (
        <>
            <div className="flex">
                <SideBar/>
                <MainFollowSinger/>
                <FriendActivity/>
            </div>
            <BottomPlayer/>
        </>
    );
}
export default FollowSinger;