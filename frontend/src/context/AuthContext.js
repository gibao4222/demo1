import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (userData, accessToken, refreshToken) => {
    try {
      const response = await axios.get('/api/users/users/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const currentUser = response.data.find(u => u.username === userData.username);
      if (currentUser) {
        userData.user_id = currentUser.user.id;
      } else {
        console.error('Không tìm thấy người dùng trong danh sách trả về từ API');
        if (!userData.user_id) {
          throw new Error('Không thể xác định user_id cho người dùng');
        }
      }
    } catch (err) {
      console.error('Lỗi khi lấy user_id:', err);
      throw err;
    }
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      if (refreshToken) {
        await axios.post(
          '/api/users/logout/',
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
    localStorage.removeItem('user');
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      const response = await axios.post('/api/users/token/refresh/', { refresh });
      const newAccessToken = response.data.access;
      setToken(newAccessToken);
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error('Làm mới token thất bại:', err);
      logout();
      return null;
    }
  };


  const refreshUser = async () => {
    if (!user || !token) return;
    try {
        const response = await axios.get('/api/users/users/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = response.data.find(u => u.username === user.username);
        if (currentUser) {
            setUser({ ...user, ...currentUser });
        }
    } catch (err) {
        console.error('Lỗi khi làm mới người dùng:', err);
        if (err.response?.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
                try {
                    const response = await axios.get('/api/users/users/', {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                    const currentUser = response.data.find(u => u.username === user.username);
                    if (currentUser) {
                        setUser({ ...user, ...currentUser });
                    }
                } catch (retryErr) {
                    console.error('Lỗi khi thử lại:', retryErr);
                }
            }
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

