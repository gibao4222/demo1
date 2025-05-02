import './App.css';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from "react";
import Login from './Pages/Login';
import Register from './Pages/Register';
import PaymentPage from './Pages/PaymentPage';
import PaymentResult from './Pages/PaymentResult';
import MainContent from './Components/MainContent';
import MainLayout from './Pages/MainLayout';
import MainFollowSinger from './Components/MainFollowSinger';
import MainSearch from './Components/MainSearch';
import MainFollowUser from './Components/MainFollowUser';
import AlbumDetail from './Components/Album/AlbumDetail';
import PlaylistDetail from './Components/Playlist/PlaylistDetail';
import SongList from './Components/SongList';
import SongDetail from './Components/SongDetail';

import Followers from './Pages/Followers';  
import { PlayerProvider } from './context/PlayerContext';

const App = () => {
  return (

    <GoogleOAuthProvider clientId="660579609549-kogcos0i04ldpherele2li974f9ulm01.apps.googleusercontent.com">
    <PlayerProvider>
      <div className="App">


        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/FollowUser/:id/followers" element={<Followers/>} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/result" element={<PaymentResult />} />

          <Route element={<MainLayout />}>
            <Route path="/home" element={<MainContent />}/>
            <Route path="/search" element={<MainSearch/>}/>
            <Route path="/user/:id" element={<MainFollowUser />}/>
            <Route path="/singer/:id" element={<MainFollowSinger />}/>
            <Route path="/PlaylistDetail/:id" element={<PlaylistDetail />}/>
            <Route path="/AlbumDetail/:id" element={<AlbumDetail />}/>
            <Route path="/song" element={<SongList />} />
            <Route path="/song/:id" element={<SongDetail />} />
          </Route>
        </Routes>

      </div>
      </PlayerProvider>
    </GoogleOAuthProvider>



  );
};

export default App;
