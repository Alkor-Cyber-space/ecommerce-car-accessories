import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setCurrentStep } from '../../store/vendorRegisterSlice';
import { useNavigate, Link } from 'react-router-dom';
import loggo from '../../assets/loggo.png';

export default function VendorRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { email, phone, password } = useSelector((state) => state.vendorRegister);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // 🔁 Load from localStorage on mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('vendorRegister'));
    if (savedData) {
      const { email, phone, password, rememberMe } = savedData;
      dispatch(setCredentials({ email, phone, password }));
      setRememberMe(rememberMe);
    }
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !phone || !password || !confirmPassword) {
      return setError('All fields are required.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    // ✅ Dispatch to Redux
    dispatch(setCredentials({ email, phone, password }));

    // ✅ Save to localStorage if Remember Me is checked
    if (rememberMe) {
      localStorage.setItem(
        'vendorRegister',
        JSON.stringify({ email, phone, password, rememberMe: true })
      );
    } else {
      localStorage.removeItem('vendorRegister');
    }

    // ✅ Go to next step
    dispatch(setCurrentStep(2));
    navigate('/register/verifyOtp');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section: Branding */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="Logo" className='h-70 w-70' />
      </div>

      {/* Right Section: Register Form */}
      <div className="w-full md:w-3/5 bg-[#ECECF0] flex flex-col justify-center items-center px-5 py-16">
        <div className="w-full max-w-[600px] space-y-10">
          <h2 className="text-5xl font-bold text-gray-800">Seller Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => dispatch(setCredentials({ email: e.target.value, phone, password }))}
              className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none focus:ring-0"
            />

            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => dispatch(setCredentials({ email, phone: e.target.value, password }))}
              className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none focus:ring-2 "
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => dispatch(setCredentials({ email, phone, password: e.target.value }))}
              className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none focus:ring-2 "
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-white text-lg focus:outline-none focus:ring-2 "
            />

            <div className="flex justify-between items-center px-1 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="scale-175 accent-blue-900 border-0"
                />
                Remember me
              </label>
            </div>

            {error && (
              <p className="text-red-600 text-center text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#5737B4] text-white py-2 rounded-4xl hover:opacity-90 mt-5"
            >
              <h2 className="text-md">Proceed</h2>
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
