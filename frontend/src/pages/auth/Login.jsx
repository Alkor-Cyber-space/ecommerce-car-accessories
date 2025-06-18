import React, { useState } from 'react';
import background from '../../assets/backg.png';
import google from '../../assets/google.png';
import { FaApple } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleLogin = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Simulated login check (replace with actual logic if needed)
        if (formData.email === 'test@example.com' && formData.password === 'password123') {
            alert('Login successful!');
        } else {
            alert('Invalid email or password');
        }
    };

    return (
        <div
            className="flex items-center justify-center h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl space-y-6 w-[90%] max-w-md border border-gray-700">
                <h1 className="text-white text-4xl font-bold mb-2">LOGO</h1>
                <div className="text-center">
                    <p className="text-gray-300 text-4xl font-semibold leading-snug">Drive. Upgrade.</p>
                    <p className="text-gray-300 text-4xl font-semibold leading-snug">Repeat.</p>
                </div>

                <div className="w-full space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white pr-12"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-300 cursor-pointer"
                            >
                                {showPassword ? 'hide' : 'show'}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-gray-300 hover:underline hover:text-white">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-white/20 text-white font-semibold rounded-md hover:bg-white/30 transition-all duration-300"
                >
                    Login
                </button>

                <div className="flex items-center w-full">
                    <hr className="flex-grow border-gray-200" />
                    <span className="mx-4 text-white text-sm">or continue with</span>
                    <hr className="flex-grow border-gray-200" />
                </div>

                <div className="flex items-center justify-center w-full space-x-4 gap-2">
                    <button className="flex items-center justify-center w-full py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition">
                        <img src={google} alt="Google" style={{ width: '24px', height: '24px' }} />
                    </button>
                    <button className="flex items-center justify-center w-full py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition">
                        <FaApple style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>

                <p className="text-sm text-gray-300">
                    Don't have an account?
                    <Link to="/register" className="underline cursor-pointer hover:text-white ml-1">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
