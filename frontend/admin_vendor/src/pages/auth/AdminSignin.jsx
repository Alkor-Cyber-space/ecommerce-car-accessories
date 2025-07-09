import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === 'admin123') {
      alert('Login successful');
      navigate('/admin');

    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="text-white absolute top-10 text-center">
        <h1 className="text-4xl font-bold tracking-wide mb-2 animate-pulse">CarSpare Admin</h1>
        <p className="text-sm text-gray-400">Secure admin access panel</p>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 text-white p-8 rounded-2xl shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold">Admin Login</h2>
          <p className="text-sm text-gray-300 mt-1">Sign in to manage your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-200 font-medium mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaEnvelope />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-200 font-medium mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} CarSpare Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminSignIn;
