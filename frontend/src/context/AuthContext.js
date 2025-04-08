import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [playlistUpdated, setPlaylistUpdated] = useState(false);

  const fetchUser = async (accessToken) => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(response.data);
    } catch (err) {
      console.error('Lấy thông tin người dùng thất bại:', err);
      logout();
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    if (!userData || !userData.id) {
      console.error('Invalid user data:', userData);
      return;
    }
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    console.log('User saved in context:', userData);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      if (refreshToken) {
        await axios.post(
          'http://localhost:8000/api/users/logout/',
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Đăng xuất thất bại:', err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      const response = await axios.post('http://localhost:8000/api/users/token/refresh/', { refresh });
      const newAccessToken = response.data.access;
      setToken(newAccessToken);
      localStorage.setItem('access_token', newAccessToken);
      await fetchUser(newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error('Làm mới token thất bại:', err);
      logout();
      return null;
    }
  };

  const notifyPlaylistUpdate = () => {
    setPlaylistUpdated(prev => !prev);
  };

  useEffect(() => {
    if (token && !user) {
      fetchUser(token);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken, playlistUpdated, notifyPlaylistUpdate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);