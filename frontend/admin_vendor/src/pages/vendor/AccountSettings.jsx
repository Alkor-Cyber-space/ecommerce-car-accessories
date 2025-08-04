import React from 'react';
import user from "../../assets/user.jpg";

const AccountSettings = () => {
  return (
    <div >
    <div className="bg-[#ECECF0] px-3 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      {/* Header with title and select */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-[#232832] text-xl font-semibold">Account Settings</h1>
        <select className="w-full md:w-auto border border-[#5737B] rounded-md px-3 py-1 text-[#5737B3] focus:outline-none focus:ring-1 focus:ring-[#5737B3] md:mr-50">
          <option hidden disabled selected>Actions</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Returned</option>
          <option>Expired</option>
        </select>
      </div>

      {/* Card with profile and form */}
      <div className="bg-white p-6 pb-16 rounded-xl shadow-md md:mr-55">
        <div className="flex flex-col lg:flex-row justify-between gap-3 items-start lg:items-center ">
          {/* Profile Info */}
          <div className="flex items-center gap-3">
            <img src={user} alt="profile" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sagar Raghav</h2>
              <p className="text-sm text-gray-500">ABC Technologies, Kochi</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-1 border border-[#5737B] text-[#5737B3] rounded-md text-sm hover:bg-[#f3f0ff]">
              Replace Profile Picture
            </button>
            <button className="px-3 py-1 border border-red-300 text-red-500 rounded-md text-sm bg-red-200 hover:bg-red-50">
              Delete
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 ">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          
        </div>
      </div>
      <div className='md:mr-55'>
        <h3 className='font-medium my-2'>Password</h3>
      <div className='bg-white p-6 pb-19 rounded-xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 shadow-md'>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
      </div>
      </div>
      </div>
      <div className="flex gap-2 flex-wrap items-center justify-end mt-6">
            <button className="px-8 py-1 border border-red-500 text-red-500 rounded-md text-sm bg-red-200 hover:bg-red-300">
              Deactivate Account
            </button>
            <button className="px-9 py-1 border border-[#5737B] text-[#5737B3] rounded-md text-sm hover:bg-[#f3f0ff]">
              Reset
            </button>
            <button className="px-9 py-1 border border-gray-200 text-white rounded-md text-sm bg-[#5737B3]/100 hover:bg-[#5737B3]/80">
              Search
            </button>
          </div>
    </div>
  );
};

export default AccountSettings;
