import React from 'react';
import { Link } from 'react-router-dom';
import loggo from '../../assets/loggo.png';
export default function VendorRegister() {
  return (
    <div className="min-h-screen flex">
      {/* Left Section: Branding */}
      <div className="hidden md:flex md:w-2/5 bg-[#030130] justify-center items-center">
        <img src={loggo} alt="" className='h-70 w-70' />   
           </div>

      {/* Right Section: Login Form */}
      <div className="w-full md:w-3/5 bg-[#ECECF0] flex flex-col justify-center items-center px-5 py-16">
        <div className="w-full max-w-[600px] space-y-10">
          <h2 className="text-5xl font-bold text-gray-800">Seller Account </h2>

          <form className="space-y-4 w-full">

            <input
              type="email"
              placeholder="Email"
              className="w-full px-5 py-3  rounded-2xl bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-3  rounded-2xl bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-5 py-3  rounded-2xl bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            />

            <div className="flex justify-between items-center px-5 text-sm  text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="scale-175 accent-blue-900 border-0" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5737B4] text-white py-2 rounded-4xl hover:opacity-90 mt-5"
            >
              <h2 className="text-md ">Proceed</h2>
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
