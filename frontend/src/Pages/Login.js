import React from "react";  

function  Login(){
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
   <div className="text-center mb-6">
    <img alt="Spotify logo" className="mx-auto mb-4" height="50" src="https://storage.googleapis.com/a1aa/image/XOHUTmMeeo3Y4k5n6gR1o_eC5K9Tcb-WB2ebEJFmsTg.jpg" width="50"/>
    <h1 className="text-white text-2xl font-bold">
     Đăng nhập vào Spotify
    </h1>
   </div>
   <div className="space-y-4">
    <button className="w-full flex items-center justify-center bg-white text-black py-2 rounded-full">
     <i className="fab fa-google mr-2">
     </i>
     Tiếp tục bằng Google
    </button>
    <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-full">
     <i className="fab fa-facebook-f mr-2">
     </i>
     Tiếp tục bằng Facebook
    </button>
    <button className="w-full flex items-center justify-center bg-black text-white py-2 rounded-full border border-white">
     <i className="fab fa-apple mr-2">
     </i>
     Tiếp tục bằng Apple
    </button>
    <button className="w-full flex items-center justify-center bg-gray-800 text-white py-2 rounded-full border border-white">
     Tiếp tục bằng số điện thoại
    </button>
   </div>
   <div className="mt-6">
    <div className="mb-4">
     <label className="block text-white mb-2" for="email">
      Email hoặc tên người dùng
     </label>
     <input className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" id="email" placeholder="Email hoặc tên người dùng" type="text"/>
    </div>
    <div className="mb-4">
     <label className="block text-white mb-2" for="password">
      Mật khẩu
     </label>
     <div className="relative">
      <input className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700" id="password" placeholder="Mật khẩu" type="password"/>
      <i className="fas fa-eye absolute right-3 top-3 text-gray-500">
      </i>
     </div>
    </div>
    <button className="w-full bg-green-500 text-white py-2 rounded-full">
     Đăng nhập
    </button>
   </div>
   <div className="mt-4 text-center">
    <a className="text-gray-400 hover:underline" href="#">
     Quên mật khẩu của bạn?
    </a>
   </div>
   <div className="mt-4 text-center">
    <span className="text-gray-400">
     Bạn chưa có tài khoản?
    </span>
    <a className="text-white hover:underline" href="#">
     Đăng ký Spotify
    </a>
   </div>
        </div>
        </div>
    );
}

export default Login;