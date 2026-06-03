import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import loggo from '../../assets/loggo.png';
import { vendorLoginApi } from '../../services/allAPI';
import { toast } from 'react-toastify';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

export default function VendorSignIn() {
  const navigate = useNavigate();

  // 🔐 Form state
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🎯 Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await vendorLoginApi(formData);
    console.log(response.data);
    if (response.status === 200) {
  toast.success('Login successful');
  const { access, refresh } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);

  setTimeout(() => {
    navigate('/vendor/dashboard', { replace: true }); // ⬅ replace removes /login from history
  }, 2000);
}
else{
      toast.error(response.data.error || 'Login failed' );
      console.error('Login failed:', response.data);
    }
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Login failed'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="Logo" className="h-70 w-70" />
      </div>

      {/* Right Section: Login Form */}
      <div className="w-full md:w-3/5 bg-gray-100 flex flex-col justify-center items-center px-5 py-16">
        <div className="w-full max-w-[600px] space-y-10">
          <h2 className="text-5xl font-bold text-gray-800">Login</h2>

          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            <input
              type="text"
              name="email_or_username"
              placeholder="Email or Username"
              value={formData.email_or_username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              required
            />
            <div className="relative">
              <input
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900 pr-12"
                required
                type={showPassword ? "text" : "password"}
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaRegEyeSlash size={20} />   : <FaRegEye size={20} />}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-900" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-900 hover:underline">
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5737B4] text-white py-3 rounded-2xl hover:opacity-90"
              disabled={loading}
            >
              <h2 className="text-lg font-semibold">
                {loading ? 'Logging in...' : 'Login'}
              </h2>
            </button>
            <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">Register</Link>{' '}
                      
                      </p>
          </form>
          
        </div>
      </div>
    </div>
  );
}