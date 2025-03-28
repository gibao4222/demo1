import React, { useState } from "react";  
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { GoogleLogin } from '@react-oauth/google';
// import { FacebookLogin } from '@greatsumini/react-facebook-login';
// import { useAuth } from '../context/AuthContext';
import LoginStep2 from './LoginStep2';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [step2Data, setStep2Data] = useState(null);
    // const { login } = useAuth();
    // const navigate = useNavigate();

    const handleManualLogin = async (e) => {
        e.preventDefault();
        try{
            const response = await axios.post('http://localhost:8000/api/users/login/step1/',{
                email,
                password,
            });
            setStep2Data({
                qrCodeUrl: response.data.qr_code_url,
                userId: response.data.user_id,
            });
            setError('');

        } catch (err){
            setError(err.response?.data?.error || 'Đăng nhập thất bại');
            setStep2Data(null);
        }
    };

    // const handleSocialLoginSuccess = async (response, provider) => {
    //     try {
    //         let accessToken;
    //         if (provider === 'google') {
    //             accessToken = response.credential;
    //         } else if (provider === 'facebook') {
    //             accessToken = response.accessToken;
    //         }

    //         const apiResponse = await axios.post('http://localhost:8000/api/auth/${provider}/', {
    //             accessToken: accessToken,
    //         });

    //         login(
    //             {
    //                 username: apiResponse.data.username,
    //                 role: apiResponse.data.role,
    //                 vip: apiResponse.data.vip,
    //             },
    //             apiResponse.data.access,
    //             apiResponse.data.refresh
    //         );
    //         navigate('/dashboard');
    //     } catch (err) {
    //         setError(err.response?.data?.error || 'Đăng nhập bằng ' + provider + ' thất bại.');
    //     }
    // };

    // const handleSocialLoginFailure = (provider) => {
    //     setError('Đăng nhập bằng ${provider} thất bại.');
    // };

    if (step2Data) {
        return <LoginStep2 qrCodeUrl={step2Data.qrCodeUrl} userId={step2Data.userId} />
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

                {/* Phần đăng nhập bằng mạng xã hội */}
                <div className="space-y-4 mb-6">
                    {/* <GoogleLogin
                        onSuccess={(response) => handleSocialLoginSuccess(response, 'google')}
                        onError={() => handleSocialLoginFailure('google')}
                        className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
                    />
                    <FacebookLogin
                        appId="615395524696516" // Thay bằng App ID của bạn
                        onSuccess={(response) => handleSocialLoginSuccess(response, 'facebook')}
                        onFail={() => handleSocialLoginFailure('facebook')}
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                        Đăng nhập bằng Facebook
                    </FacebookLogin> */}
                    {/* Giữ nguyên nút Apple và Số điện thoại */}
                    <button
                        className="w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800 flex items-center justify-center"
                        disabled
                    >
                        Đăng nhập bằng Apple
                    </button>
                    <button
                        className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 flex items-center justify-center"
                        disabled
                    >
                        Đăng nhập bằng Số điện thoại
                    </button>
                </div>

                {/* Phân cách */}
                <div className="flex items-center justify-center mb-6">
                    <hr className="w-1/3 border-gray-300" />
                    <span className="mx-4 text-gray-500">Hoặc</span>
                    <hr className="w-1/3 border-gray-300" />
                </div>

                {/* Phần đăng nhập thủ công */}
                <form onSubmit={handleManualLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email:</label>
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Mật khẩu:</label>
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
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