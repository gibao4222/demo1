import React from "react";

function FriendActivity(){
    return (
        <div className=" bg-neutral-900 p-3 sideBar rounded-lg flex flex-col min-h-[calc(100vh-136px)]">
        <ul className="mt-3">
            <li className="mb-4 li-inline-friend">
                <span>Friend Activity</span>
                <div className="icons">
                    <img src="/icon/UserPlus_S.png" alt="Add Friend"/>
                    <img src="/icon/Close_S.png" alt="Cancel"/>
                </div>
            </li>
            <li className="mb-4">
                <span style={{fontSize: '14px'}}>Let friends and followers on Spotify see what you're listening to</span>
            </li>
            <li className="mb-4 li-inline-friend">
                <div className="icons">
                    <img src="/icon/UserBlue.png" alt="User blue" className="mr-4"/>
                    <img src="/icon/Union.png" alt="Union" />
                </div>

            </li>
            <li className="mb-4 li-inline-friend">
                <div className="icons">
                    <img src="/icon/UserBlue.png" alt="User blue" className="mr-4"/>
                    <img src="/icon/Union.png" alt="Union" />
                </div>

            </li>
            <li className="mb-4 li-inline-friend">
                <div className="icons">
                    <img src="/icon/UserBlue.png" alt="User blue" className="mr-4"/>
                    <img src="/icon/Union.png" alt="Union" />
                </div>

            </li>
            <li className="mb4 li-inline-friend pr-1">
                <span>Go to Settings {'>'} Social and enable “Share my listening activity on Spotify." You can turn this off at any time.</span>
            </li>
        </ul>
   </div>
    );
}

export default FriendActivity;