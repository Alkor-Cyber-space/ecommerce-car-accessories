import React, { useState } from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import loggo from '../../assets/loggo.png';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Current Password:", currentPassword);
    console.log("New Password:", newPassword);
    // API call or logic here
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side Logo */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="Logo" className="h-70 w-70" />
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-3/5 bg-gray-100 flex flex-col justify-center items-center p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          aria-label="Close"
        >
          <FiX size={24} />
        </button>

        <form onSubmit={handleReset} className="w-full max-w-[700px]">
          <h1 className="text-4xl font-bold mb-8 text-gray-800 text-left">
            Reset Password
          </h1>

          {/* Current Password */}
          <div className="relative mb-4">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-6 text-black"
            >
              {showCurrent ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative mb-6">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-6 text-gray"
            >
              {showNew ? <FaRegEyeSlash size={20} />   : <FaRegEye size={20} />}
            </button>
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            className="w-full bg-[#5737B4] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
