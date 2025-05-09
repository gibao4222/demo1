import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import { QrCode, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

const ScanQRPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
            return;
        }

        const generatePaymentQR = async () => {
            try {
                const formData = {
                    amount: '100000',
                    order_desc: 'Thanh toán VIP',
                    bank_code: 'NCB',
                    order_info: user.user_id,
                };

                const response = await axios.post(
                    'api/payment/vnpay/create/',
                    formData,
                    {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                if (response.data.payment_url) {
                    const qrData = response.data.payment_url;
                    const qrCode = await QRCode.toDataURL(qrData);
                    setQrCodeUrl(qrCode);
                } else {
                    setError('Không thể tạo URL thanh toán. Vui lòng thử lại.');
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                } else {
                    setError('Có lỗi xảy ra. Vui lòng thử lại.');
                }
            } finally {
                setLoading(false);
            }
        };

        generatePaymentQR();
    }, [token, user, navigate, logout]);

    if (!token || !user) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center text-gray-800">
                    <QrCode className="w-6 h-6 mr-2" />
                    Quét mã QR để thanh toán
                </h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : qrCodeUrl ? (
                    <div className="flex flex-col items-center">
                        <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mb-4" />
                        <p className="text-gray-600 text-center">
                            Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR và hoàn tất thanh toán.
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">Không thể tạo mã QR. Vui lòng thử lại.</p>
                )}

                <button
                    onClick={() => navigate('/premium-options')}
                    className="mt-4 text-blue-600 hover:underline flex items-center text-sm"
                >
                    ← Quay lại lựa chọn thanh toán
                </button>
            </div>
        </div>
    );
};

export default ScanQRPage;