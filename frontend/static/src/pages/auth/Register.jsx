import React, { useEffect, useState } from 'react';
import background from '../../assets/backg.png';
import { FaGoogle, FaApple, FaRegEyeSlash, FaRegEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import google from '../../assets/google.png';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { registerApi } from '../../services/allAPI';
import { serverUrl } from '../../services/serverURL';

const Register = () => {
    const [showOTP, setShowOTP] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [otpError, setOtpError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerified, setIsVerified] = useState(false);


    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'User'
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+(?:\.[a-zA-Z]{2,})+$/;

        if (!formData.username.trim()) newErrors.username = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter';
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = 'Password must contain at least one special character';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
        else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
        return newErrors;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email: formData.email,
                username: formData.username,
                password: formData.password,
                phone_number: formData.phone,
                role: formData.role,
            };

            const response = await registerApi(payload);
            console.log("Registration Response:", response);

            setErrors({});
            setShowOTP(true);
            setFormData({
                username: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            });
            setTimer(60);
            setCanResend(false);
            setIsVerified(false);

        } catch (error) {
            console.error("Registration error:", error);
            if (error.response?.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ general: "Something went wrong. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        let interval;

        if (timer > 0 && !isVerified) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        if (timer === 0 && !isVerified) {
            setCanResend(true);
        }

        return () => clearInterval(interval);
    }, [timer, isVerified]);

    const handleResendOTP = () => {
        setOtp('');
        setTimer(60);
        setCanResend(false);
        // Call API to resend OTP here
        alert('OTP resent!');
    };



    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };
    const handleVerifyOTP = async () => {
        try {
            const payload = {
                email: formData.email,  // or phone if using that
                otp: otpInput,
            };

            const response = await axios.post('/api/auth/verify-otp/', payload);
            console.log("OTP Verification Response:", response);

            alert("OTP verified successfully!");
            navigate("/login");
        } catch (error) {
            console.error("OTP Verification Failed", error);
            setErrors({ otp: "Invalid or expired OTP" });
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${serverUrl}/otp/verify_otp/`,
                {
                    phone_number: formData.phone,
                    otp: formData.otp,
                }
            );
            console.log("OTP Verification Response:", response.data);

            // Handle success (e.g., navigate, show message)
            setOtpError('');
            Swal.fire({
                position: "center",
                icon: "success",
                title: "OTP verified successfully",
                showConfirmButton: false,
                timer: 2500,
                iconColor: '#00ff99',
                background: '#1a1a1a',
                color: '#ffffff',
                width: '400px',
                //   customClass: {
                //     popup: 'custom-swal-popup',
                //     title: 'custom-swal-title',
                //   }
            });
            setIsVerified(true);

            setShowOTP(false);
        } catch (error) {
            console.log(error.response?.data?.error);

            setOtpError(error.response?.data?.error || "OTP verification failed");
        }


    };


    return (
        <div
            className="flex items-center justify-center min-h-screen w-full bg-cover bg-center relative px-4"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-lg p-6 md:p-10 rounded-2xl shadow-2xl space-y-4 w-full max-w-md border border-gray-700 z-10">
                <h1 className="text-white text-3xl md:text-4xl font-semibold">Logo</h1>
                <p className="text-gray-300 text-xl md:text-2xl font-bold text-center">Create Your Garage Account</p>

                {/* Full Name */}
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                />
                {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}

                {/* Email */}
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                {/* Phone */}
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                />
                {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}


                {/* Password */}
                <div className="relative w-full">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full p-3 pr-10 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-300 cursor-pointer text-lg"
                    >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </span>
                </div>
                {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}

                {/* Confirm Password */}
                <div className="relative w-full">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full p-3 pr-10 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-300 cursor-pointer text-lg"
                    >
                        {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </span>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}

                {/* role field */}
                {/* <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Vendor</option>
                </select> */}

                <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-white/20 text-white font-semibold rounded-md hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending OTP...' : 'Register'}
                </button>


                <div className="flex items-center w-full">
                    <hr className="flex-grow border-gray-300 h-2/4" />
                    <span className="mx-4 text-white text-sm">or continue with</span>
                    <hr className="flex-grow border-gray-300 h-5/6" />
                </div>

                <div className="flex items-center justify-center w-full space-x-4 gap-2">
                    <button className="flex items-center justify-center w-full py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition">
                        <img src={google} alt="Google" className="w-6 h-6" />
                    </button>
                    <button className="flex items-center justify-center w-full py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition">
                        <FaApple className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-sm text-gray-300 text-center">
                    Already have an account?
                    <Link to="/login" className="underline cursor-pointer hover:text-white ml-1">Login</Link>
                </p>
            </div>

            {/* OTP Popup */}
            <AnimatePresence>
                {showOTP && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/70 z-50 px-4"
                    >
                        <div className="bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-xl border border-gray-600 w-full max-w-md shadow-2xl space-y-5">
                            <h2 className="text-white text-2xl md:text-3xl font-semibold text-center">OTP Verification</h2>
                            <p className="text-gray-300 text-center text-sm md:text-base">
                                Enter the 6-digit code sent to <br />
                                <span className="font-semibold text-white">{formData.email}</span>
                            </p>

                            <div className="flex justify-center space-x-2">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        maxLength="1"
                                        value={otp[idx] || ""}
                                        onChange={(e) => handleOTPChange(idx, e.target.value)}
                                        className="w-10 h-12 text-center text-white bg-black/40 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-xl"
                                    />
                                ))}
                            </div>

                            {otpError && (
                                <p className="text-red-400 text-sm text-center">{otpError}</p>
                            )}

                            <button
                                onClick={handleOTPSubmit}
                                className="w-full py-2 bg-white/20 text-white font-semibold rounded-md hover:bg-white/30 transition"
                            >
                                Verify OTP
                            </button>

                            {!isVerified && (
                                <p className="text-sm text-gray-300 text-center mt-2">
                                    {timer > 0 ? (
                                        <>Resend OTP in <span className="text-white font-semibold">{`00:${timer.toString().padStart(2, '0')}`}</span></>
                                    ) : (
                                        <span
                                            className="underline ml-1 cursor-pointer hover:text-white"
                                            onClick={handleResendOTP}
                                        >
                                            Resend OTP
                                        </span>
                                    )}
                                </p>
                            )}

                            <button
                                onClick={() => setShowOTP(false)}
                                className="text-sm text-red-400 underline hover:text-white block mx-auto"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default Register;
