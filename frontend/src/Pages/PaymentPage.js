import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import { CreditCard, Banknote, Landmark } from 'lucide-react';

const PaymentPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: '100000',
        order_desc: 'Thanh toán VIP',
        bank_code: 'NCB',
        order_info: user ? user.user_id : '', 
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
        } else {
            setFormData(prev => ({ ...prev, order_info: user.user_id }));
        }
    }, [token, user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);


    try {
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
            setSuccess('Đang chuyển hướng đến cổng thanh toán VNPay...');
            setTimeout(() => {
                window.location.href = response.data.payment_url;
            }, 1000);
        } else {
            setError('Không thể tạo URL thanh toán. Vui lòng thử lại.');
        }
    } catch (err) {
        if (err.response?.status === 401) {
            logout();
            navigate('/login');
        } else if (err.response?.data?.error) {
            // Hiển thị thông báo lỗi từ backend (ví dụ: "Thông tin VIP không hợp lệ...")
            setError(err.response.data.error);
        } else {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    } finally {
        setLoading(false);
    }
};

    if (!token || !user) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center text-gray-800">
                    <div className="mr-2" /> Thanh toán hóa đơn
                </h2>

                {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-1">
                            <Banknote className="w-5 h-5 mr-2" />
                            Số tiền:
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            readOnly
                            className="w-full px-4 py-2 border rounded-md bg-white text-gray-800 read-only:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-1">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Mô tả:
                        </label>
                        <input
                            type="text"
                            name="order_desc"
                            value={formData.order_desc}
                            readOnly
                            className="w-full px-4 py-2 border rounded-md bg-white text-gray-800 read-only:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-1">
                            <Landmark className="w-5 h-5 mr-2" />
                            Ngân hàng:
                        </label>
                        <select
                            name="bank_code"
                            value={formData.bank_code}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-md bg-white text-gray-800"
                        >
                            <option value="NCB">NCB</option>
                            <option value="VNPAYQR">VNPAYQR</option>
                            <option value="VPBANK">VPBank</option>
                            <option value="VIETCOMBANK">Vietcombank</option>
                            <option value="">Không chọn (Hiển thị tất cả)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                    </button>
                </form>

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

export default PaymentPage;