import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios'; // 👈 Make sure axios is installed
import { forgotPasswordApi } from '../../services/allAPI';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPasswordApi(email);

            setSuccess('Reset link sent!');
            Swal.fire({
                title: 'Email Sent!',
                text: 'A reset link has been sent to your email address.',
                icon: 'success',
                confirmButtonColor: '#4ade80',
            }).then(() => {
                setEmail('');
            });
        } catch (err) {
            if (err.response?.data?.email) {
                setError(err.response.data.email[0]); 
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white relative px-4">
            <div className="bg-white/10 p-8 pt-12 rounded-2xl backdrop-blur-md w-full max-w-md border border-gray-700 relative">
                <button 
                    onClick={() => navigate('/login')} 
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-3xl font-bold mb-4 text-center">Forgot Password</h2>
                <p className="text-gray-300 mb-6 text-center">
                    Enter your email to receive password reset instructions.
                </p>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 rounded-md bg-black/40 border border-gray-600 text-white placeholder-gray-400 mb-2 focus:outline-none focus:ring-2 focus:ring-white"
                />

                {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
                {success && <p className="text-green-400 text-sm mb-2">{success}</p>}

                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-white/20 text-white font-semibold rounded-md hover:bg-white/30 transition"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;
