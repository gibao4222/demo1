import React from "react";

function SideBar (){
    return (
        <div className="w-1/5 bg-black p-4 sideBar sticky top-0 h-screen">
    <div className="mb-8">
     <ul className="mt-8">
      <li className="mb-4 li-inline">
       <img alt="" src="/icon/Home_Fill_S.png"/> Home
      </li>
      <li className="mb-4 li-inline">
        <img alt="" src="/icon/Search_S.png"/> Search
      </li>
      <li className="mb-4 li-inline">
        <img alt="" src="/icon/Library_S.png"/>

       Your Library
      </li>
     </ul>
    </div>
    <div className="mb-8">
     <ul>
      <li className="mb-4 li-inline">
        <img alt="" src="/icon/+Library_S.png"/>
       Create Playlist
      </li>
      <li className="mb-4 li-inline">
        <img alt="" src="/icon/LikedSongs_S.png"/>
       Liked Songs
      </li>
      <hr/>
     </ul>
    </div>
    <div>
     <ul>
      <li className="mb-4">
       Chill Mix
      </li>
      <li className="mb-4">
       Hits
      </li>
      <li className="mb-4">
       Daily Mix 1
      </li>
     </ul>
    </div>
   </div>
    );
}

export default SideBar;