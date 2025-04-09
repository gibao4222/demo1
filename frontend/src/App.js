import './App.css';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from "react";
// import PlayListChill from './Pages/PlayListChill';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import PlayListChill from './Pages/PlayListChill';
import FollowSinger from './Pages/FollowSinger';
import FollowUser from './Pages/FollowUser';
import LikeSong from './Pages/LikeSong';








const App = () => {
  return (
    <>
    <GoogleOAuthProvider clientId="660579609549-kogcos0i04ldpherele2li974f9ulm01.apps.googleusercontent.com">
      <div className="App">
        
   
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Login />} />
          <Route path="/playlist" element={<PlayListChill />} />
          <Route path= "/FollowSinger/:id" element={<FollowSinger/>} /> 
          <Route path= "/FollowUser/:id" element={<FollowUser/>} /> 
          <Route path= "/SongDetail/:id" element={<LikeSong/>} /> 
          
        </Routes>
       
      </div>
    </GoogleOAuthProvider>

    </>
  );
};

export default App;
