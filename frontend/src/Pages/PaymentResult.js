import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [result, setResult] = useState({
        status: '',
        message: '',
        vnp_Amount: '',
        vnp_BankCode: '',
        vnp_ResponseCode: '',
        vnp_TxnRef: '',
    });

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const vnpResponseCode = query.get('vnp_ResponseCode') || '';
        const status = query.get('status') || (vnpResponseCode === '00' ? 'success' : 'error');
        const message = query.get('message') || (vnpResponseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại');

        setResult({
            status,
            message,
            vnp_Amount: query.get('vnp_Amount') || '',
            vnp_BankCode: query.get('vnp_BankCode') || '',
            vnp_ResponseCode: vnpResponseCode,
            vnp_TxnRef: query.get('vnp_TxnRef') || '',
        });
    }, [location]);

    const mystyle = {
        color: "black",
        backgroundColor: "white",
        fontFamily: "Arial",
        padding: "24px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    };

    const containerStyle = {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center",
    };

    const successStyle = {
        color: "#28a745",
    };

    const errorStyle = {
        color: "#dc3545",
    };

    const linkStyle = {
        color: "#007bff",
        textDecoration: "none",
    };

    return (
        <div style={mystyle}>
            <div style={containerStyle}>
                <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán</h1>
                <p style={result.status === 'success' ? successStyle : errorStyle}>
                    {result.message}
                </p>
                {result.vnp_Amount && (
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold">Chi tiết giao dịch:</h2>
                        <ul className="text-left mt-2">
                            <li><strong>Mã giao dịch:</strong> {result.vnp_TxnRef}</li>
                            <li><strong>Số tiền:</strong> {(parseInt(result.vnp_Amount) / 100).toLocaleString()} VNĐ</li>
                            <li><strong>Ngân hàng:</strong> {result.vnp_BankCode}</li>
                            <li><strong>Mã phản hồi:</strong> {result.vnp_ResponseCode}</li>
                        </ul>
                    </div>
                )}
                <button
                    onClick={() => navigate('/home')}
                    className="mt-4 text-blue-500 underline"
                    style={linkStyle}
                >
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;