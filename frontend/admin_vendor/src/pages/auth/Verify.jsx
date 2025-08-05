import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOtpVerified, setCurrentStep, resetVendorRegistration } from '../../store/vendorRegisterSlice';
import loggo from '../../assets/loggo.png';
import { verifyVendorOtpApi } from '../../services/allAPI';

export default function Verify() {
  const dispatch = useDispatch(); 
  const navigate = useNavigate(); 

  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== "");

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isOtpComplete) {
    alert("Please enter the complete OTP");
    return;
  }

  const code = otp.join("");
  const vendorId = localStorage.getItem("vendorId");

  if (!vendorId) {
    alert("User not found. Please re-register.");
    return;
  }

  try {
    const payload = {
      user_id: vendorId,
      otp: code,
    };

    const response = await verifyVendorOtpApi(payload);

    console.log("✅ OTP verified via backend:", response.data);

    dispatch(setOtpVerified(true));
    dispatch(setCurrentStep(0));
    localStorage.setItem("vendorOtpVerified", "true");
    dispatch(resetVendorRegistration());
    navigate("/vendor-register/company-details");

  } catch (error) {
    console.error("❌ OTP verification failed:", error);
    const msg = error?.response?.data?.error || "Invalid OTP. Please try again.";
    alert(msg);
  }
};




  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="Logo" className="h-70 w-70" />
      </div>

      {/* Right Section */}
      <div className="w-full md:w-3/5 bg-[#ECECF0] flex flex-col justify-center items-center px-5 py-16">
        <div className="w-full max-w-[600px] space-y-6">
          <h1 className="text-4xl font-bold text-[#232832] tracking-wide">
            Verify Your Contact Details
          </h1>
          <p className="text-[#505050] text-sm">
            We've sent a 4-digit code to your email. Enter it below to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="flex gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  className="w-12 h-12 text-center text-xl text-[#7F7F7F] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isOtpComplete}
              className={`w-full text-white py-3 rounded-3xl mt-4 transition duration-200 ${isOtpComplete
                  ? "bg-[#5737B4] hover:bg-[#3e2991] cursor-pointer"
                  : "bg-[#D8D8D8] cursor-not-allowed"
                }`}
            >
              <h2 className="text-md">Verify</h2>
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Didn't receive the code?{" "}
            <Link to="#" className="text-blue-600 hover:underline">
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
