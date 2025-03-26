import React, { useEffect, useState } from "react";
import SideBar from '/var/www/demo1/frontend/src/Components/SideBar';
import MainContent from '/var/www/demo1/frontend/src/Components/MainCotent';
import FriendActivity from '/var/www/demo1/frontend/src/Components/FriendActivity';
import BottomPlayer from '/var/www/demo1/frontend/src/Components/BottomPlayer';




function Home(){
    
    return (
        <>
            <div className="flex">
                <SideBar/>
                <MainContent/>
                <FriendActivity/>
            </div>
            <BottomPlayer/>
        </>
    );
}
export default Home;