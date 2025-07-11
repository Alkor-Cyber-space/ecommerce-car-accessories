import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import loggo from '../../assets/loggo.png'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      if (email.trim() === '') {
        setError('Email is required');
      } else {
        setSuccess('Reset link has been sent to your email.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side Section */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="" className='h-70 w-70' />   
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-3/5 bg-gray-100 flex flex-col justify-center items-center p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          aria-label="Close"
        >
          <FiX size={24} />
        </button>

        <div className="w-full max-w-[700px] ">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 text-left">Forgot Password</h2>
          <p className="text-gray-600 mb-6 text-left">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#5737B4] text-white mt-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition"
          >
            {loading ? 'Sending...' : 'Proceed'}
          </button>

          <p className="mt-6 text-xs text-center text-slate-500">
            Remember your password?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-900 cursor-pointer hover:underline"
            >
              Go back to Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
