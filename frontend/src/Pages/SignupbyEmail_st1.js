import React from "react";

function SignupbyEmail_st1(){
    return(
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md mx-auto p-6">
   <div className="flex justify-center mb-6">
    <img alt="Spotify logo" className="h-10" height="40" src="https://storage.googleapis.com/a1aa/image/d2i81mu4od-bD0s7tW4FdoN9L4TWLmszxDi1MnKts6I.jpg" width="40"/>
   </div>
   <div className="border-b border-gray-700 mb-6">
   </div>
   <div className="text-center mb-6">
    <div className="text-sm text-gray-400">
     Bước 1/3
    </div>
    <h1 className="text-2xl font-bold">
     Tạo mật khẩu
    </h1>
   </div>
   <form>
    <div className="mb-4">
     <label className="block text-sm font-medium mb-2" for="password">
      Mật khẩu
     </label>
     <div className="relative">
      <input className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white" id="password" placeholder="Mật khẩu" type="password"/>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
       <i className="fas fa-eye-slash text-gray-400">
       </i>
      </div>
     </div>
    </div>
    <div className="mb-6">
     <p className="text-sm text-gray-400 mb-2">
      Mật khẩu của bạn phải có ít nhất
     </p>
     <ul className="text-sm text-gray-400 space-y-2">
      <li>
       <input className="mr-2" id="requirement1" name="password-requirement" type="radio"/>
       1 chữ cái
      </li>
      <li>
       <input className="mr-2" id="requirement2" name="password-requirement" type="radio"/>
       1 chữ số hoặc ký tự đặc biệt (ví dụ: # ? ! &amp;)
      </li>
      <li>
       <input className="mr-2" id="requirement3" name="password-requirement" type="radio"/>
       10 ký tự
      </li>
     </ul>
    </div>
    <button className="w-full py-3 bg-green-500 text-black font-bold rounded" type="submit">
     Tiếp theo
    </button>
   </form>
   <div className="mt-6 text-center text-xs text-gray-400">
    <p>
     This site is protected by reCAPTCHA and the Google
     <a className="underline" href="#">
      Privacy Policy
     </a>
     and
     <a className="underline" href="#">
      Terms of Service
     </a>
     apply.
    </p>
   </div>
  </div>
        </div>
    );
}

export default SignupbyEmail_st1;