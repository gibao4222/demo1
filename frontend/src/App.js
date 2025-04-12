import './App.css';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from "react";
// import PlayListChill from './Pages/PlayListChill';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ChatPage from './Pages/ChatPage';









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
        </Routes>
      </div>
    </GoogleOAuthProvider>

    
  );
};

export default App;
