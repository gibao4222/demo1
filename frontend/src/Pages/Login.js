import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useAuth } from '../context/AuthContext';
import LoginStep2 from './LoginStep2';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [step2Data, setStep2Data] = useState(null);
    const { user, token, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && token) {
            console.log('User và token đã sẵn sàng, chuyển hướng đến /home');
            navigate('/home');
        }
    }, [user, token, navigate]);

    const handleManualLogin = async (e) => {
        e.preventDefault();

        try{
            const response = await axios.post('/api/users/login/step1/',{
                email,
                password,
            });
            setStep2Data({
                qrCodeUrl: response.data.qr_code_url,
                userId: response.data.user_id,
            });
            setError('');

        } catch (err) {
            setError(err.response?.data?.error || 'Đăng nhập thất bại');
            setStep2Data(null);
        }
    };

    const handleSocialLoginSuccess = async (response, provider) => {
        try {
            let accessToken;
            if (provider === 'google') {
                accessToken = response.credential;
            } else if (provider === 'facebook') {
                accessToken = response.accessToken;
            }

            const apiResponse = await axios.post(`/api/users/auth/${provider}/`, {
                access_token: accessToken,
            });
            
            localStorage.setItem('access_token', apiResponse.data.access);
            localStorage.setItem('refresh_token', apiResponse.data.refresh);
            // Gọi API kiểm tra VIP
    const vipResponse = await axios.get('/api/users/check-vip/', {
        headers: {
          Authorization: `Bearer ${apiResponse.data.access}`,
        },
      });

            login(
                {
                    username: apiResponse.data.username,
                    role: apiResponse.data.role,
                    vip: vipResponse.data.vip,
                },
                apiResponse.data.access,
                apiResponse.data.refresh
            );
            console.log('Đăng nhập thành công, đang chuyển hướng đến /home');
            navigate('/home');
        } catch (err) {
            console.error(`Error logging in with ${provider}:`, err);
            setError(err.response?.data?.error || 'Đăng nhập bằng ' + provider + ' thất bại.');
        }
    };

    const handleSocialLoginFailure = (provider) => {
        setError('Đăng nhập bằng ${provider} thất bại.');
    };

    if (step2Data) {
        return <LoginStep2 qrCodeUrl={step2Data.qrCodeUrl} userId={step2Data.userId} />
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/img/background_login.png')" }}
        >
            <div className="absolute inset-0 z-0" style={{
                background: 'linear-gradient(to right top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0) 100%)'
            }}></div>
            <div className="relative bg-white backdrop-blur-md transition-all duration-300 bg-opacity-25 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

                {/* Phần đăng nhập bằng mạng xã hội */}
                <div className="space-y-4 mb-6 items-center justify-center">
                    <GoogleLogin
                        onSuccess={(response) => handleSocialLoginSuccess(response, 'google')}
                        onError={() => handleSocialLoginFailure('google')}
                        type="standard"
                        theme="outline"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        logo_alignment="left"
                        width="300"
                        locale="en"
                        className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
                    />
                    <FacebookLogin
                        appId="615395524696516"
                        onSuccess={(response) => handleSocialLoginSuccess(response, 'facebook')}
                        onFail={() => handleSocialLoginFailure('facebook')}
                        className="w-[350px] bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                        Đăng nhập bằng Facebook
                    </FacebookLogin>
                    
                </div>

                {/* Phân cách */}
                <div className="flex items-center justify-center mb-6">
                    <hr className="w-1/3 border-gray-300" />
                    <span className="mx-4 text-white">Hoặc</span>
                    <hr className="w-1/3 border-gray-300" />
                </div>

                {/* Phần đăng nhập thủ công */}
                <form onSubmit={handleManualLogin}>
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
                        Đăng nhập
                    </button>
                </form>

                {/* Hiển thị lỗi nếu có */}
                {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

                {/* Liên kết đến trang đăng ký */}
                <p className="mt-4 text-center">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
}


export default Login;