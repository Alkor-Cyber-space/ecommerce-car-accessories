import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // useEffect(() => {
    //     const resetToken = searchParams.get('token');
    //     if (!resetToken) {
    //         alert("Invalid or missing token");
    //         navigate('/forgot-password');
    //     } else {
    //         setToken(resetToken);
    //     }
    // }, [navigate, searchParams]);

    const validate = () => {
        const newErrors = {};
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };
    // const handleReset = async () => {
    //     if (newPassword !== confirmPassword) {
    //         return setError('Passwords do not match.');
    //     }

    //     try {
    //         const res = await axios.post('/api/auth/reset-password', {
    //             token,
    //             newPassword,
    //         });
    //         setSuccess(res.data.message || 'Password reset successful!');
    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Password Reset!',
    //             text: 'You can now log in with your new password.',
    //             background: '#1f2937',
    //             color: '#fff',
    //             confirmButtonColor: '#10b981'
    //         });
    //         setTimeout(() => navigate('/login'), 3000);
    //     } catch (err) {
    //         setError(err.response?.data?.message || 'Reset failed');
    //     }
    // };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            // Simulate API call (Replace with actual request)
            console.log("Token:", token);
            console.log("New Password:", formData.password);
            Swal.fire({
                icon: 'success',
                title: 'Password Reset!',
                text: 'You can now log in with your new password.',
                background: '#1f2937',
                color: '#fff',
                confirmButtonColor: '#10b981'
            });

            navigate('/login');
        } catch (error) {
            alert("Something went wrong. Try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl border border-gray-700 w-full max-w-md">
                <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-6">
                    Reset Your Password
                </h2>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full p-3 bg-black/40 border border-gray-600 text-white rounded-md placeholder-gray-400 pr-12 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <span
                            className="absolute top-3 right-3 text-gray-300 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "hide" : "show"}
                        </span>
                        {errors.password && (
                            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            className="w-full p-3 bg-black/40 border border-gray-600 text-white rounded-md placeholder-gray-400 pr-12 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <span
                            className="absolute top-3 right-3 text-gray-300 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? "hide" : "show"}
                        </span>
                        {errors.confirmPassword && (
                            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-white/20 text-white font-semibold rounded-md hover:bg-white/30 transition-all duration-300"
                    >
                        Set New Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
