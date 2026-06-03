import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import loggo from '../../assets/loggo.png';
import mail from '../../assets/email.png';
import lnk from '../../assets/WrongLink.png';
import { forgotPasswordApi } from '../../services/allAPI';
import forgot from '../../assets/forgot.png'
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (email.trim() === '') {
      setError('Email is required');
      setLoading(false);
      setSubmitted(true);
      return;
    }

    try {
      await forgotPasswordApi(email);
      // Show custom success message like the image
      setSuccess('EMAIL_SENT');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link could not be sent. Ensure the provided email is registered.');
    } finally {
      setEmail('');
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setError('');
    setSuccess('');
    setButtonVisible(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="" className="h-70 w-70" />
      </div>

      {/* Right Side */}
      <div className="w-full md:w-3/5 bg-gray-100 flex flex-col justify-center items-center p-6 relative">


        <div className="w-full max-w-[700px]">
          {!submitted ? (
            <>
              <h2 className="text-4xl font-bold mb-4 text-gray-800">Forgot Password</h2>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />

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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {success === 'EMAIL_SENT' && (
                <>
                  <img src={mail} className="h-50 w-50 py-3" />
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">Check your email</h2>
                  <p className="text-gray-600 mb-6">
                    We have sent a password recover instructions to your email
                  </p>

                </>
              )}
              {error && (
                <>
                  <img
                    src={forgot}
                    className="h-72 w-68   object-contain"
                  />
                  <p className="text-black text-xl mb-6">{error}</p>
                  {buttonVisible && (
                    <button
                      onClick={() => {
                        setButtonVisible(false);
                        setTimeout(() => handleRetry(), 300);
                      }}
                      className="px-6 py-3 bg-[#5737B4] text-white rounded-xl text-lg font-medium hover:bg-[#5737B4]/80 transition"
                    >
                      Try Again
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
