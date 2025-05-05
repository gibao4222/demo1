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
      // Gọi API kiểm tra VIP
    const vipResponse = await axios.get('/api/users/check-vip/', {
      headers: {
        Authorization: `Bearer ${response.data.access}`,
      },
    });
      login(
        {
          username: response.data.username,
          role: response.data.role,
          vip: vipResponse.data.vip,
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
    <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/img/background_login.png')" }}
    >
      <div className="absolute inset-0 z-0" style={{
                background: 'linear-gradient(to right top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0) 100%)'
            }}></div>
      <div className="relative bg-white backdrop-blur-md transition-all duration-300 bg-opacity-25 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Xác thực 2 bước</h2>
        <p className="text-center mb-4">Quét mã QR bằng Google Authenticator:</p>
        <div className="flex justify-center mb-6">
          <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white mb-2">Mã OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-neutral-700 backdrop-blur-md transition-all duration-300 bg-opacity-25"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
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