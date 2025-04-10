
import react from "react";
import SideBar from "../Components/SideBar";
import SongList from "../Components/SongList";
const SongPage=()=>{
  return (
     <div className="flex">
        <SideBar/>
        <SongList/>
     </div>
  )
}
export default SongPage