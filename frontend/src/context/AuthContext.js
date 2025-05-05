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

  const login = async (userData, accessToken, refreshToken, callback) => {
    try {
      const response = await axios.get('/api/users/users/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const currentUser = response.data.find(u => u.username === userData.username);
      if (currentUser) {
        userData.user_id = currentUser.user.id;
        userData.id_spotify_user = currentUser.id;
      } else {
        console.error('Không tìm thấy người dùng trong danh sách trả về từ API');
        if (!userData.user_id) {
          throw new Error('Không thể xác định user_id cho người dùng');
        }
      }
      console.log('Login thành công, user:', userData, 'token:', accessToken);
    } catch (err) {
      console.error('Lỗi khi lấy user_id:', err);
      throw err;
    }
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (callback) callback();
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
      console.log('Token làm mới thành công:', newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error('Làm mới token thất bại:', err);
      logout();
      return null;
    }
  };

  const refreshUser = async () => {
    if (!user || !token) {
        console.error('Không thể làm mới user: user hoặc token không tồn tại');
        return false;
    }
    try {
        const response = await axios.get('/api/users/users/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = response.data.find(u => u.username === user.username);
        if (currentUser) {
            setUser({ ...user, ...currentUser });
            console.log('Làm mới user thành công:', currentUser);
            return true;
        } else {
            console.error('Không tìm thấy user trong dữ liệu API:', user.username);
            return false;
        }
    } catch (err) {
        console.error('Lỗi khi làm mới user:', err.message);
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
                        console.log('Làm mới user thành công sau khi làm mới token:', currentUser);
                        return true;
                    } else {
                        console.error('Không tìm thấy user sau khi làm mới token:', user.username);
                        return false;
                    }
                } catch (retryErr) {
                    console.error('Lỗi khi thử lại với token mới:', retryErr.message);
                    return false;
                }
            }
        }
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);