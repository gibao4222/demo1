import React from "react";

function Main_Search(){
    return (
        <div className="w-3/5 flex-1 p-4 overflow-y-auto">
        <div className="flex items-center mb-8">
          <img
            className="text-xl mr-4"
            src="./icon/Back.png"
            alt="Search icon"
            width="30.5"
            style={{height: "30px !important"}}
          />
          <input
            className="flex-1 p-2 rounded-full bg-gray-800 text-white"
            placeholder="Artists, songs, or podcasts"
            type="text"
          />
          <div className="ml-4 flex items-center">
            <img
              alt="User avatar"
              className="rounded-full"
              height="30"
              src="./img/AlbumCover4.png"
              width="30"
            />
            <span className="ml-2"> davedirect3 </span>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Recent searches</h2>
          <div className="flex space-x-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <img
                alt="The Chainsmokers"
                className="rounded-full mb-2"
                height="100"
                src="./img/AlbumCover.png"
                width="100"
              />
              <div className="flex justify-between items-center">
                <span> The Chainsmokers </span>
                <img
                  src="./icon/Close_S.png"
                  alt="Your libraby"
                  width="22.5"
                  className="ml-2"
                  style={{height: "22px !important"}}
                />
              </div>
              <span className="text-gray-400"> Artist </span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <img
                alt="Ed Sheeran"
                className="rounded-full mb-2"
                height="100"
                src="./img/AlbumCover1.png"
                width="100"
              />
              <div className="flex justify-between items-center">
                <span> Ed Sheeran </span>
                <img
                  src="./icon/Close_S.png"
                  alt="Your libraby"
                  width="22.5"
                  className="ml-2"
                  style={{height: "22px !important"}}
                />
              </div>
              <span className="text-gray-400"> Artist </span>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Your top genres</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Pop </span>
              <img
                alt="Pop genre image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumCover2.png"
              />
            </div>
            <div className="bg-orange-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Hip-Hop </span>
              <img
                alt="Hip-Hop genre image"
                className="rounded-lg absolute bottom-0 right-0"
                src="./img/AlbumCover3.png"
                style={{height: "140px", width: "125px !important"}}
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl mb-4">Browse all</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Podcasts </span>
              <img
                alt="Podcasts image"
                className="rounded-lg absolute bottom-0 right-0"
                src="./img/0a74d96e091a495bb09c0d83210910c3 6.png"
                style={{height: "140px", width: "125px !important"}}
              />
            </div>
            <div className="bg-blue-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Made For You </span>
              <img
                alt="Made For You image"
                className="rounded-lg absolute bottom-0 right-0"
                src="./img/AlbumArt.png"
                style={{height: "140px", width: "125px !important"}}
              />
            </div>
            <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Charts </span>
              <img
                alt="Charts image"
                className="rounded-lg absolute bottom-0 right-0"
                src="./img/AlbumArt1.png"
                style={{height: "140px", width: "125px !important"}}
              />
            </div>
            <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
              <span> New Releases </span>
              <img
                alt="New Releases image"
                className="rounded-lg absolute bottom-0 right-0"
                src="./img/AlbumArt10.png"
                style={{height: "140px", width: "125px !important"}}
              />
            </div>
            <div className="bg-purple-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Discover </span>
              <img
                alt="Discover image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt11.png"
              />
            </div>
            <div className="bg-blue-800 p-4 rounded-lg relative min-h-[180px]">
              <span> Concerts </span>
              <img
                alt="Concerts image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt12.png"
              />
            </div>
            <div className="bg-pink-800 p-4 rounded-lg relative min-h-[180px]">
              <span> R&amp;B </span>
              <img
                alt="R&amp;B image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt13.png"
              />
            </div>
            <div className="bg-gray-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Frequency </span>
              <img
                alt="Frequency image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt14.png"
              />
            </div>
            <div className="bg-blue-400 p-4 rounded-lg relative min-h-[180px]">
              <span> Christian &amp; Gospel </span>
              <img
                alt="Christian &amp; Gospel image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt15.png"
              />
            </div>
            <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Soul </span>
              <img
                alt="Soul image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt16.png"
              />
            </div>
            <div className="bg-blue-300 p-4 rounded-lg relative min-h-[180px]">
              <span> Chill </span>
              <img
                alt="Chill image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt2.png"
              />
            </div>
            <div className="bg-purple-400 p-4 rounded-lg relative min-h-[180px]">
              <span> Mood </span>
              <img
                alt="Mood image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt3.png"
              />
            </div>
            <div className="bg-green-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Equal </span>
              <img
                alt="Equal image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt4.png"
              />
            </div>
            <div className="bg-teal-400 p-4 rounded-lg relative min-h-[180px]">
              <span> Alternative </span>
              <img
                alt="Alternative image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt5.png"
              />
            </div>
            <div className="bg-gray-700 p-4 rounded-lg relative min-h-[180px]">
              <span> Workout </span>
              <img
                alt="Workout image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt6.png"
              />
            </div>
            <div className="bg-pink-700 p-4 rounded-lg relative min-h-[180px]">
              <span> Party </span>
              <img
                alt="Party image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt7.png"
              />
            </div>
            <div className="bg-purple-400 p-4 rounded-lg relative min-h-[180px]">
              <span> Pop </span>
              <img
                alt="Pop image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt8.png"
              />
            </div>
            <div className="bg-orange-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Hip-Hop </span>
              <img
                alt="Hip-Hop image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt9.png"
              />
            </div>
            <div className="bg-pink-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Afro </span>
              <img
                alt="Afro image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/0a74d96e091a495bb09c0d83210910c3 5.png"
              />
            </div>
            <div className="bg-blue-600 p-4 rounded-lg relative min-h-[180px]">
              <span> Rewind </span>
              <img
                alt="Rewind image"
                className="rounded-lg absolute bottom-0 right-0"
                style={{height: "140px", width: "125px !important"}}
                src="./img/AlbumArt16.png"
              />
            </div>
          </div>
        </div>
      </div>
    );
}
export default Main_Search;