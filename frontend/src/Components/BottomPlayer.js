import React from "react";

function BottomPlayer(){
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black p-2 flex items-center justify-between">
   <div className="flex items-center">
    <img alt="Album Art" className="mr-4 rounded" height="60" src="https://storage.googleapis.com/a1aa/image/aiQnv1Js-FnLIFN8chtTtxqacIq1nVaWV5PdzzgH_Fk.jpg" width="60"/>
    <div>
     <h3 className="font-bold">
      Play It Safe
     </h3>
     <p>
      JAMIE
     </p>
    </div>
   </div>
    <div className="flex flex-column items-center">
        <div className="flex items-center">
            <button className="mr-4 mb-2">
                <img alt="" src="/icon/Shuffle_S.png"/>
            </button>
            <button className="mr-4">
                <img alt="" src="/icon/Component2.png"/>
            </button>
            <button className="mr-4">
                <img alt="" src="/icon/Component1.png"/>
            </button>
            <button className="mr-4">
                <img alt="" src="/icon/Component3.png"/>
            </button>
            <button className="mr-4">
                <img alt="" src="/icon/Repeat_S.png"/>
            </button>
        </div>
        
        <div className="flex items-center">
            <span className="mr-2">
                2:30
            </span>
            <div className="w-96 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{width: '50%'}}>
                </div>
            </div>
            <span className="ml-2">
                4:20
            </span>
        </div>
    </div>
   <div className="flex items-center">
        <div className="flex items-center">
            <button className="mr-1">
                <img alt="" src="/icon/Queue_XS.png"/>
            </button>
            <button className="mr-1">
                <img alt="" src="/icon/Devices_XS.png"/>
            </button>
            <button className="mr-1">
                <img alt="" src="/icon/Volume_XS.png"/>
            </button>
        </div>
        <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="bg-white h-full" style={{width: '50%'}}>
            </div>
        </div>
        <div className="flex items-center">
            <button className="ml-1">
                <img src="/icon/FullScreen_S.png" alt=""/>
            </button>
        </div>
   </div>
  </div>
    );
}

export default BottomPlayer;