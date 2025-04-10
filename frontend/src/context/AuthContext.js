// import React, { createContext, useState, useContext } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('access_token'));

//   const login = (userData, accessToken, refreshToken) => {
//     setUser(userData);
//     setToken(accessToken);
//     localStorage.setItem('access_token', accessToken);
//     localStorage.setItem('refresh_token', refreshToken);
//   };

//   const logout = async () => {
//     try {
//       const refreshToken = localStorage.getItem('refresh_token');
//       const accessToken = localStorage.getItem('access_token');
//       if (refreshToken) {
//         await axios.post(
//           'http://localhost:8000/api/users/logout/',
//           { refresh: refreshToken },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );
//       }
//     } catch (err) {
//       console.error('Đăng xuất thất bại:', err);
//     }
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//   };

//   const refreshToken = async () => {
//     try {
//       const refresh = localStorage.getItem('refresh_token');
//       const response = await axios.post('http://localhost:8000/api/users/token/refresh/', { refresh });
//       const newAccessToken = response.data.access;
//       setToken(newAccessToken);
//       localStorage.setItem('access_token', newAccessToken);
//       return newAccessToken;
//     } catch (err) {
//       console.error('Làm mới token thất bại:', err);
//       logout();
//       return null;
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);



import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);

  const login = (userData, access, refresh) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);

    // Lưu token và thông tin người dùng vào localStorage
    try {
      if (access) {
        localStorage.setItem('accessToken', access);
        // Lưu với key "token" để MainFollowSinger.js có thể lấy
        localStorage.setItem('token', access);
      }
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      console.log('Tokens saved to localStorage:', { accessToken: access, refreshToken: refresh, userData });
    } catch (error) {
      console.error('Error saving tokens to localStorage:', error);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/users/logout/', {
        refresh_token: refreshToken,
      });
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);

      // Xóa token khỏi localStorage
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Tokens cleared from localStorage');
      } catch (error) {
        console.error('Error clearing tokens from localStorage:', error);
      }
    }
  };

  // Tự động làm mới token
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);
        // Cập nhật token trong localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('token', newAccessToken);
      } catch (err) {
        console.error('Error refreshing token:', err);
        logout();
      }
    };

    if (refreshToken) {
      const interval = setInterval(refreshAccessToken, 30 * 60 * 1000); // Làm mới mỗi 15 phút
      return () => clearInterval(interval);
    }
  }, [refreshToken]);

  const notifyPlaylistUpdate = () => {
    setPlaylistUpdated(prev => !prev);
  };

  useEffect(() => {
    if (token && !user) {
      fetchUser(token);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);