import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setCurrentStep } from '../../store/vendorRegisterSlice';
import { useNavigate, Link } from 'react-router-dom';
import loggo from '../../assets/loggo.png';
import { vendorRegisterApi } from '../../services/allAPI';
import { toast } from 'react-toastify';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

export default function VendorRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    username = "",
    email = "",
    password = ""
  } = useSelector((state) => state.vendorRegister);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedData = JSON.parse(localStorage.getItem('vendorRegister'));
      if (
        savedData &&
        typeof savedData.username === 'string' &&
        typeof savedData.email === 'string' &&
        typeof savedData.password === 'string'
      ) {
        dispatch(setCredentials({
          username: savedData.username,
          email: savedData.email,
          password: savedData.password
        }));
        setRememberMe(!!savedData.rememberMe);
      }
    } catch (err) {
      console.error("Failed to parse vendorRegister from localStorage", err);
    }
  }, [dispatch]);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+(?:\.[a-zA-Z]{2,})+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!username.trim()) newErrors.username = 'Username is required';
    else if (!usernameRegex.test(username)) newErrors.username = 'Username must not contain special characters';

    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) newErrors.password = 'Password must contain at least one special character';

    if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    else if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match';

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!validate()) {
      setLoading(false);
      return;
    }
    try {
      const vendorData = { username, email, password };
      const result = await vendorRegisterApi(vendorData);
      console.log("Step 1 success:", result);

      if (result.status === 201) {
        toast.success(" Registration successful! Proceeding to OTP verification.");
        dispatch(setCredentials({ username, email, password }));
        const userId = result?.data?.user_id
          || result?.data?.user?.id;
        if (userId) {
          localStorage.setItem('vendorId', userId);
          localStorage.setItem('vendorEmail', email);
        }

        if (rememberMe) {
          localStorage.setItem('vendorRegister', JSON.stringify({ username, email, password, rememberMe: true }));
        } else {
          localStorage.removeItem('vendorRegister');
        }

        dispatch(setCurrentStep(2));
        setTimeout(() => {
          navigate('/register/verifyOtp');
        }, 3000);
      } else {
        console.log("error :", result.data);
        toast.error(result.data?.error)
      }

    } catch (err) {
      console.error(err);
      const errorMsg = err?.detail || err?.message || "Something went wrong.";
      toast.error(` Registration failed: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="Logo" className='h-70 w-70' />
      </div>

      <div className="w-full md:w-3/5 bg-[#ECECF0] flex flex-col justify-center items-center px-5 py-16">
        <div className="w-full max-w-[600px] space-y-10">
          <h2 className="text-5xl font-bold text-gray-800">Seller Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                  dispatch(setCredentials({ username: e.target.value, email, password }))
                }
                className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none"
              />
              {fieldErrors.username && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.username}</p>
              )}
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => dispatch(setCredentials({ username, email: e.target.value, password }))}
                className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none"
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => dispatch(setCredentials({ username, email, password: e.target.value }))}
                className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none pr-12"
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/*  Open eye when visible |  Slash when hidden */}
                {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
              </span>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none pr-12"
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {/*  Open eye when visible |  Slash when hidden */}
                {showConfirmPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
              </span>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-between items-center px-1 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="scale-125 accent-blue-900 border-0"
                />
                Remember me
              </label>
            </div>

            {error && (
              <p className="text-red-600 text-center text-sm font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 rounded-4xl hover:opacity-90 mt-5 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5737B4]'
                }`}
            >
              {loading ? 'Processing...' : 'Proceed'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>{' '}
          
          </p>
        </div>
      </div>
    </div>
  );
}
