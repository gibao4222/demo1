import React from "react";

function SignupbyEmail_st2(){
    return(
        <div class="flex items-center justify-center min-h-screen">
        <div class="w-full max-w-md p-8">
        <div class="flex justify-center mb-4">
         <img alt="Spotify logo" class="h-10" height="40" src="https://storage.googleapis.com/a1aa/image/whRMXJvUXS0FvFqUCeFr3FS_D9ANDd2LOG220E8dtjc.jpg" width="40"/>
        </div>
        <div class="border-t border-gray-600 mb-4">
        </div>
        <h2 class="text-center text-lg font-semibold mb-6">
         Bước 2/3
        </h2>
        <h1 class="text-center text-2xl font-bold mb-6">
         Giới thiệu thông tin về bản thân bạn
        </h1>
        <form>
         <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="name">
           Tên
          </label>
          <input class="w-full p-2 bg-gray-800 border border-gray-600 rounded" id="name" placeholder="Tên này sẽ xuất hiện trên hồ sơ của bạn" type="text"/>
         </div>
         <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="dob">
           Ngày sinh
          </label>
          <p class="text-xs text-gray-400 mb-2">
           Tại sao chúng tôi cần biết ngày sinh của bạn?
           <a class="text-blue-500" href="#">
            Tìm hiểu thêm.
           </a>
          </p>
          <div class="flex space-x-2">
           <input class="w-1/3 p-2 bg-gray-800 border border-gray-600 rounded" id="day" placeholder="dd" type="text"/>
           <select class="w-1/3 p-2 bg-gray-800 border border-gray-600 rounded" id="month">
            <option>
             Tháng
            </option>
           </select>
           <input class="w-1/3 p-2 bg-gray-800 border border-gray-600 rounded" id="year" placeholder="YYYY" type="text"/>
          </div>
         </div>
         <div class="mb-4">
          <label class="block text-sm font-medium mb-1">
           Giới tính
          </label>
          <p class="text-xs text-gray-400 mb-2">
           Giới tính của bạn giúp chúng tôi cung cấp nội dung đề xuất và quảng cáo phù hợp với bạn.
          </p>
          <div class="space-y-2">
           <div>
            <input class="mr-2" id="male" name="gender" type="radio"/>
            <label for="male">
             Nam
            </label>
           </div>
           <div>
            <input class="mr-2" id="female" name="gender" type="radio"/>
            <label for="female">
             Nữ
            </label>
           </div>
           <div>
            <input class="mr-2" id="nonbinary" name="gender" type="radio"/>
            <label for="nonbinary">
             Phi nhị giới
            </label>
           </div>
           <div>
            <input class="mr-2" id="other" name="gender" type="radio"/>
            <label for="other">
             Giới tính khác
            </label>
           </div>
           <div>
            <input class="mr-2" id="nospecify" name="gender" type="radio"/>
            <label for="nospecify">
             Không muốn nêu cụ thể
            </label>
           </div>
          </div>
         </div>
         <div class="flex justify-center">
          <button class="w-full py-2 bg-green-500 text-black font-bold rounded" type="submit">
           Tiếp theo
          </button>
         </div>
        </form>
        <div class="text-center text-xs text-gray-400 mt-6">
         This site is protected by reCAPTCHA and the Google
         <a class="text-blue-500" href="#">
          Privacy Policy
         </a>
         and
         <a class="text-blue-500" href="#">
          Terms of Service
         </a>
         apply.
        </div>
       </div>
        </div>
    );
}
export default SignupbyEmail_st2;