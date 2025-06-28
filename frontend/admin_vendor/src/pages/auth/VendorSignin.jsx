
import React, { useState } from "react"
import { FaEnvelope, FaLock, FaBuilding, FaEye, FaEyeSlash } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"

export default function VendorSignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    })
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.email === 'vendor@gmail.com' && formData.password === 'vendor123') {
            alert('Welcome Vendor! Redirecting to your dashboard...');
            navigate('/vendor')
        } else {
            alert('Invalid vendor credentials');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black  p-4">
            <div className="w-full max-w-md">
                {/* Welcome Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 rounded-full p-3">
                            <FaBuilding className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2 tracking-wide animate-pulse">Welcome Back, Partner</h1>
                    <p className="text-slate-300">We're glad to see you again. Sign in to access your vendor dashboard.</p>
                </div>

                {/* Sign In Card */}
                <div className="bg-white rounded-xl shadow-lg p-9">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Sign In to Your Account</h2>
                        <p className="text-sm text-gray-500">Enter your credentials to continue</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaEnvelope />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="vendor@company.com"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaLock />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                            Sign In
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-xs text-center text-slate-500">
                    By signing in, you agree to our {" "}
                    <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and {" "}
                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    )
}
