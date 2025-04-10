import React, {  useState } from "react";
import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
import MainContentPLChill from '../Components/MainContentPLChill';
import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';

import MainFollowUser from '/var/www/demo1/frontend/src/Components/MainFollowUser';
function FollowSinger(){
    
    return (
        <>
            <div className="flex">
                <SideBar/>
                <MainFollowUser/>
                <FriendActivity/>
            </div>
            <BottomPlayer/>
        </>
    );
}
export default FollowSinger;