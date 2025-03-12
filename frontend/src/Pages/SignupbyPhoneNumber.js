import React from "react";

function SignupbyPhoneNumber(){
    return (
        <div className="text-center">
        <h1 className="text-white mb-4">Nhập số điện thoại</h1>
        <div className="flex items-center justify-center mb-4">
            <div className="relative">
                <select className="appearance-none bg-transparent border border-gray-500 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-300">
                    <option>+84</option>
                    
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
            <input type="text" placeholder="Số điện thoại" className="ml-2 bg-transparent border border-gray-500 text-white py-2 px-4 rounded leading-tight focus:outline-none focus:border-gray-300"/>
        </div>
        <button className="bg-green-700 text-white py-2 px-6 rounded">Tiếp theo</button>
    </div>
    );
}
export default SignupbyPhoneNumber;