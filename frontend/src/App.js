import './App.css';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from "react";
// import PlayListChill from './Pages/PlayListChill';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';









const App = () => {
  return (
    <>
    <GoogleOAuthProvider clientId="660579609549-ek5a4k2fo2tkqf1c99mpqv6dqa13gcf8.apps.googleusercontent.com">
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>

    </>
  );
};

export default App;
