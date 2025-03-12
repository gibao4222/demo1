import React from "react";

function Signup (){
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 space-y-6">
   <div class="text-center">
    <img alt="Spotify logo" class="mx-auto mb-6" height="50" src="https://storage.googleapis.com/a1aa/image/z9j--b6dgo87UWtM5xR8RSCvKm2px_ZvDsREnikSdUs.jpg" width="50"/>
    <h1 class="text-3xl font-bold">
     Đăng ký để bắt đầu nghe
    </h1>
   </div>
   <form class="space-y-4">
    <div>
     <label class="sr-only" for="email">
      Địa chỉ email
     </label>
     <input autocomplete="email" class="w-full p-3 border border-gray-700 rounded bg-black text-white placeholder-gray-500" id="email" name="email" placeholder="name@domain.com" required="" type="email"/>
    </div>
    <div class="text-right">
     <a class="text-green-500" href="#">
      Dùng số điện thoại.
     </a>
    </div>
    <div>
     <button class="w-full py-3 bg-green-500 text-black font-bold rounded" type="submit">
      Tiếp theo
     </button>
    </div>
   </form>
   <div class="flex items-center justify-center space-x-2">
    <span class="block w-1/3 h-px bg-gray-700">
    </span>
    <span>
     hoặc
    </span>
    <span class="block w-1/3 h-px bg-gray-700">
    </span>
   </div>
   <div class="space-y-4">
    <button class="w-full py-3 flex items-center justify-center space-x-2 border border-gray-700 rounded">
     <i class="fab fa-google text-xl">
     </i>
     <span>
      Đăng ký bằng Google
     </span>
    </button>
    <button class="w-full py-3 flex items-center justify-center space-x-2 border border-gray-700 rounded">
     <i class="fab fa-facebook text-xl">
     </i>
     <span>
      Đăng ký bằng Facebook
     </span>
    </button>
    <button class="w-full py-3 flex items-center justify-center space-x-2 border border-gray-700 rounded">
     <i class="fab fa-apple text-xl">
     </i>
     <span>
      Đăng ký bằng Apple
     </span>
    </button>
   </div>
   <div class="text-center">
    <p>
     Bạn đã có tài khoản?
     <a class="text-green-500" href="#">
      Đăng nhập tại đây.
     </a>
    </p>
   </div>
   <div class="text-center text-xs text-gray-500">
    <p>
     This site is protected by reCAPTCHA and the Google
     <a class="underline" href="#">
      Privacy Policy
     </a>
     and
     <a class="underline" href="#">
      Terms of Service
     </a>
     apply.
    </p>
   </div>
  </div>
        </div>
    );
}

export default Signup;