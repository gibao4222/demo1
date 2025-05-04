import React, { useState } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register/', {
        email,
        username,
        user: {
          email,
          password,
          username,
        },
      });
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Đăng ký thất bại. Vui lòng kiểm tra dữ liệu.'
      );
      setSuccess('');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/img/background_login.png')" }}
    >
      <div className="absolute inset-0 z-0" style={{
                background: 'linear-gradient(to right top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0) 100%)'
            }}></div>
      <div className="relative bg-white backdrop-blur-md transition-all duration-300 bg-opacity-25 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-neutral-700 backdrop-blur-md transition-all duration-300 bg-opacity-25"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-neutral-700 backdrop-blur-md transition-all duration-300 bg-opacity-25"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-neutral-700 backdrop-blur-md transition-all duration-300 bg-opacity-25"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            Đăng ký
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {success && <p className="mt-4 text-green-500 text-center">{success}</p>}
        <p className="mt-4 text-center">
          Đã có tài khoản? <Link to="/login" className="text-blue-500 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;