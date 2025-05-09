import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, QrCode } from 'lucide-react';

const PremiumOptionsPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    if (!token) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center text-gray-800">
                    Chọn phương thức thanh toán Premium
                </h2>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/payment')}
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                    >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Thanh toán trực tiếp
                    </button>
                    <button
                        onClick={() => navigate('/scan-qr')}
                        className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition flex items-center justify-center"
                    >
                        <QrCode className="w-5 h-5 mr-2" />
                        Quét mã QR
                    </button>
                </div>

                <button
                    onClick={() => navigate('/home')}
                    className="mt-4 text-blue-600 hover:underline flex items-center text-sm"
                >
                    ← Quay lại trang chủ
                </button>
            </div>
        </div>
    );
};

export default PremiumOptionsPage;