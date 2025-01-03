import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import jrLogo from '../assets/jr-logo.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 sm:py-6 md:py-12 flex flex-col justify-center px-4">
      <div className="max-w-md mx-auto w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        {/* Logo和标题 */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src={jrLogo} 
              alt="JR Muay Thai Logo" 
              className="h-24 sm:h-28 md:h-32 w-auto"
            />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
            JR泰拳团课签到
          </h1>
          <h2 className="text-sm sm:text-base text-gray-600">
            JR Muay Thai Group Class Check-in
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* 老会员签到入口 */}
          <Link
            to="/member"
            className="block w-full bg-muaythai-blue text-white py-2.5 sm:py-3 px-4 rounded-lg text-center hover:bg-muaythai-blue-dark transition-colors shadow-sm"
          >
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-base sm:text-lg">老会员签到 Member Check-in</div>
              <div className="text-xs sm:text-sm opacity-75">已注册会员请点击这里 Registered members click here</div>
            </div>
          </Link>

          {/* 新会员签到入口 */}
          <Link
            to="/new-member"
            className="block w-full bg-muaythai-red text-white py-2.5 sm:py-3 px-4 rounded-lg text-center hover:bg-muaythai-red-dark transition-colors shadow-sm"
          >
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-base sm:text-lg">新会员签到 New Member Check-in</div>
              <div className="text-xs sm:text-sm opacity-75">第一次来馆练习请点击这里 First time visitors click here</div>
            </div>
          </Link>
        </div>

        {/* 管理员登录入口 */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>管理员登录 Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}