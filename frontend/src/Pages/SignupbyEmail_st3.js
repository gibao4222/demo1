import React from "react";

function SignupbyEmail_st3(){
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6">
        <div className="flex justify-center mb-6">
            <i className="fab fa-spotify text-4xl text-white"></i>
        </div>
        <div className="border-t-2 border-green-500 mb-6"></div>
        <div className="text-center mb-6">
            <p className="text-gray-400">Bước 3/3</p>
            <h1 className="text-xl font-bold">Điều khoản & Điều kiện</h1>
        </div>
        <div className="space-y-4 mb-6">
            <div className="bg-gray-800 p-4 rounded">
                <label className="flex items-center space-x-3">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-green-500"/>
                    <span>Tôi không muốn nhận tin nhắn tiếp thị từ Spotify</span>
                </label>
            </div>
            <div className="bg-gray-800 p-4 rounded">
                <label className="flex items-center space-x-3">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-green-500"/>
                    <span>Chia sẻ dữ liệu đăng ký của tôi với các nhà cung cấp nội dung của Spotify cho mục đích tiếp thị.</span>
                </label>
            </div>
        </div>
        <div className="text-gray-400 text-sm mb-6">
            <p>Bằng việc nhấp vào nút Đăng ký, bạn đồng ý với <button className="text-green-500">Điều khoản và điều kiện sử dụng</button> của Spotify.</p>
            <p>Để tìm hiểu thêm về cách thức Spotify thu thập, sử dụng, chia sẻ và bảo vệ dữ liệu cá nhân của bạn, vui lòng xem <button className="text-green-500">Chính sách quyền riêng tư của Spotify</button>.</p>
        </div>
        <div className="flex justify-center mb-6">
            <button className="bg-green-500 text-black font-bold py-2 px-6 rounded-full">Đăng ký</button>
        </div>
        <div className="text-center text-gray-400 text-xs">
            <p>This site is protected by reCAPTCHA and the Google <button className="text-green-500">Privacy Policy</button> and <button className="text-green-500">Terms of Service</button> apply.</p>
        </div>
    </div>
        </div>
    );
}

export default SignupbyEmail_st3;