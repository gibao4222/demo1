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
  const [playlistUpdated, setPlaylistUpdated] = useState(false);

  const login = (userData, access, refresh) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);

    try {
      if (access) {
        localStorage.setItem('accessToken', access);
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

  const fetchUser = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/current/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      console.error('Error fetching user:', err);
      logout();
    }
  };

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('token', newAccessToken);
      } catch (err) {
        console.error('Error refreshing token:', err);
        logout();
      }
    };

    if (refreshToken) {
      const interval = setInterval(refreshAccessToken, 30 * 60 * 1000); // Làm mới mỗi 30 phút
      return () => clearInterval(interval);
    }
  }, [refreshToken]);

  const notifyPlaylistUpdate = () => {
    setPlaylistUpdated(prev => !prev);
  };

  useEffect(() => {
    if (accessToken && !user) {
      fetchUser(accessToken);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, notifyPlaylistUpdate, playlistUpdated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);