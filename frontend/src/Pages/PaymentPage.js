import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';

const PaymentPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: '100000',
        order_desc: 'Thanh toan VIP',
        bank_code: 'NCB',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Kiểm tra nếu chưa đăng nhập, chuyển hướng về trang login
    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
                // Chuyển hướng đến URL thanh toán của VNPay
                window.location.href = response.data.payment_url;
            } else {
                setError('Không thể tạo URL thanh toán');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError(err.response?.data?.error || 'Lỗi khi tạo thanh toán');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token || !user) {
        return null; // Hoặc hiển thị loading
    }

    const mystyle = {
        color: "black",
        backgroundColor: "white",
        fontFamily: "Arial",
        padding: "24px",
        minHeight: "100vh",
    };

    return (
        <div className="payment-page" style={mystyle}>
            <h1 className="text-2xl font-bold mb-6">Thanh toán VIP</h1>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Số tiền (VNĐ):</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded"
                        required
                        min="10000"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Mô tả đơn hàng:</label>
                    <input
                        type="text"
                        name="order_desc"
                        value={formData.order_desc}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Chọn ngân hàng:</label>
                    <select
                        name="bank_code"
                        value={formData.bank_code}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="NCB">NCB</option>
                        <option value="VNPAYQR">VNPAYQR</option>
                        <option value="VPBANK">VPBank</option>
                        <option value="VIETCOMBANK">Vietcombank</option>
                        <option value="">Không chọn (Hiển thị tất cả)</option>
                    </select>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    type="submit"
                    className={`w-full bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
            </form>
            <button
                onClick={() => navigate('/home')}
                className="mt-4 text-blue-500 underline"
            >
                Quay lại trang chủ
            </button>
        </div>
    );
};

export default PaymentPage;