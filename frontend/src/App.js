import './App.css';
import { Routes, Route , Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState, useEffect } from "react";
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
import { useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import Chatbot from './Components/Chatbot';
import FullScreenPlayer from './Components/FullScreenPlayer';

// import Profile from './Pages/Profile';
import MainProfile from './Components/MainProfile';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Đợi một chút để đảm bảo trạng thái user và token được cập nhật
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100); // Đợi 100ms để trạng thái được đồng bộ
    return () => clearTimeout(timer);
  }, []);

  if (isCheckingAuth) {
    return null; // Không render gì trong khi kiểm tra
  }

  if (!user || !token) {
    console.log('Chưa đăng nhập, chuyển hướng về /login');
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const { user, token } = useAuth();

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
          <Route path="/chatbot" element={<Chatbot />} />
          {/* <Route path="/" render={() => <div><a href="/chatbot">Go to Chatbot</a></div>} /> */}


          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/home" element={<MainContent />}/>
            <Route path="/search" element={<MainSearch/>}/>
            <Route path="/user/:id" element={<MainFollowUser />}/>
            <Route path="/singer/:id" element={<MainFollowSinger />}/>
            <Route path="/PlaylistDetail/:id" element={<PlaylistDetail />}/>
            <Route path="/AlbumDetail/:id" element={<AlbumDetail />}/>
            <Route path="/song" element={<SongList />} />
            <Route path="/song/:id" element={<SongDetail />} />
            <Route path='/fullscreen' element={<FullScreenPlayer/>}/>
            <Route path="/profile/" element={<MainProfile />} />


          </Route>
        </Routes>

      </div>
      </PlayerProvider>
    </GoogleOAuthProvider>



  );
};

export default App;
