import React, { useState } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginStep2 = ({ qrCodeUrl, userId }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login/step2/', {
        user_id: userId,
        otp,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      login(
        {
          username: response.data.username,
          role: response.data.role,
          vip: response.data.vip,
        },
        response.data.access,
        response.data.refresh
      );
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Mã OTP không hợp lệ.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Xác thực 2 bước</h2>
        <p className="text-center mb-4">Quét mã QR bằng Google Authenticator:</p>
        <div className="flex justify-center mb-6">
          <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mã OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Xác minh
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LoginStep2;