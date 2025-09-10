import React from 'react';
import { Link } from 'react-router-dom';

const CreateTicket = () => {
  return (
    <div className="bg-[#ECECF0] min-h-screen py-6 px-4 md:px-6 rounded-2xl w-full">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <h1 className="text-[#232832] text-lg md:text-xl font-semibold">
          <span className="text-[#5737B4]">Support or Help</span> / Create a Ticket
        </h1>
      </div>

      {/* Form container */}
      <div className="bg-white w-full md:w-3/4 p-6 rounded-xl shadow-md">
        
        {/* Row 1: Subject + Category */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Subject */}
          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4] text-[#5737B4]"
            />
          </div>

          {/* Category */}
          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4]">
              <option value="" disabled hidden></option>
              <option value="Order Issue">Order Issue</option>
              <option value="Product Listing">Product Listing</option>
              <option value="Payment & Earnings">Payment & Earnings</option>
              <option value="Account / KYC">Account / KYC</option>
              <option value="Technical Problem">Technical Problem</option>
              <option value="App Feedback / Suggestions">App Feedback / Suggestions</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 2: Priority Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
          <select className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4]">
            <option value="" disabled hidden></option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Row 3: Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4]"
            rows="5"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Link to="/vendor/support-help">
            <button className="w-full sm:w-auto border border-[#5737B4] text-[#5737B4] px-6 py-2 rounded-md text-sm hover:bg-[#5737B4] hover:text-white transition">
              Cancel
            </button>
          </Link>
          <button className="w-full sm:w-auto bg-[#5737B4] text-white px-6 py-2 rounded-md text-sm hover:bg-[#432d9c] transition">
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
