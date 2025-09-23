import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { serverurl } from '../../services/serverURL';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import loggo from '../../assets/loggo.png';
import lock from '../../assets/pass.png';
import wrong from '../../assets/WrongPassword.png';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  // ✅ Validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.newPassword || formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const url = `${serverurl}/auth/password/reset-password/${uidb64}/${token}/`;
      await axios.post(url, {
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      setSuccess('Password Changed Successfully');
      setErrorMsg('');
      setSubmitted(true);
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMsg("This password reset link has expired or is invalid. Please request a new one.");
      } else {
        setErrorMsg(error.response?.data?.detail || "Something went wrong. Please try again.");
      }
      setSuccess('');
      setSubmitted(true);
    }
  };

  // ✅ Retry form
  const handleRetry = () => {
    setFormData({ newPassword: '', confirmPassword: '' });
    setErrors({});
    setErrorMsg('');
    setSuccess('');
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Logo Side */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="Logo" className="h-70 w-70" />
      </div>

      {/* Right Side */}
      <div className="w-full md:w-3/5 bg-gray-100 flex flex-col justify-center items-center p-6 relative">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full max-w-[700px]">
            <h1 className="text-4xl font-bold mb-3 text-gray-800">Reset Password</h1>
            <p className="text-gray-600 mb-6">Enter your new password and confirm it.</p>

            {/* New Password */}
            <div className="relative mb-4">
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="New password"
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-6 text-black"
              >
                {showNew ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
              </button>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirm New Password */}
            <div className="relative mb-6">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-6 text-black"
              >
                {showConfirm ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#5737B4] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
            >
              Reset
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* ✅ Success */}
            {success && (
              <>
                <img src={lock} alt="Success" className="h-35 w-30 mb-4" />
                <h2 className="text-black text-3xl font-bold mb-4">{success}</h2>
                <p className="text-gray-800 mb-8">
                  You can click the button below to return to the login page.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-[#5737B4] text-white rounded-xl text-lg font-semibold hover:bg-[#5737B4]/80 transition"
                >
                  Return to Login
                </button>
              </>
            )}

            {/* ✅ Error */}
            {errorMsg && (
              <>
                <img src={wrong} alt="Error" className="h-25 w-45 mb-4" />
                <p className="text-black text-2xl font-bold mb-6">{errorMsg}</p>

                {/* If token expired → show Forgot Password button */}
                {errorMsg.includes("expired") || errorMsg.includes("invalid") ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-[#5737B4] text-white rounded-xl text-lg font-semibold hover:bg-[#5737B4]/80 transition"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-[#5737B4] text-white rounded-xl text-lg font-semibold hover:bg-[#5737B4]/80 transition"
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
  );
};

export default ResetPassword;
