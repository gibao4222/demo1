import './App.css';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from "react";
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';

import PlayListChill from './Pages/PlayListChill';
import FollowSinger from './Pages/FollowSinger';
import FollowUser from './Pages/FollowUser';
import LikeSong from './Pages/LikeSong';
import SongList from './Components/SongList';
import SongPage from './Pages/SongPage';

import ChatPage from './Pages/ChatPage';
import PaymentPage from './Pages/PaymentPage';
import PaymentResult from './Pages/PaymentResult';

import DetailSongPage from './Pages/DetailSongPage';
import PlaylistPage from './Pages/PlaylistPage';

const App = () => {
  return (

      <GoogleOAuthProvider clientId="660579609549-kogcos0i04ldpherele2li974f9ulm01.apps.googleusercontent.com">
        <div className="App">


          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Login />} />
            <Route path='/chat' element={<ChatPage />}/>
            <Route path="/PlaylistDetail" element={<PlaylistPage />} />

            <Route path="/playlist" element={<PlayListChill />} />
            <Route path="/FollowSinger/:id" element={<FollowSinger />} />
            <Route path="/FollowUser/:id" element={<FollowUser />} />
            <Route path="/SongDetail/:id" element={<LikeSong />} />


            <Route path="/song" element={<SongPage />} />
            <Route path="/song/:id" element={<DetailSongPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/result" element={<PaymentResult />} />

          </Routes>

        </div>
      </GoogleOAuthProvider>


    
  );
};

export default App;
