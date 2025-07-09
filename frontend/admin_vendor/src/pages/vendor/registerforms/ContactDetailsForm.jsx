import React from "react";

export default function ContactDetailsForm() {
  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      {/* Form Card */}
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-4xl font-bold text-[#232832] mb-6">Contact Details</h1>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Contact Person Name"
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
          />

          <select
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold text-[#7F7F7F] focus:ring-2"
          >
            <option value="">Select Designation</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="sales_head">Sales Head</option>
            <option value="marketing_exec">Marketing Executive</option>
          </select>

          <input
            type="tel"
            placeholder="Contact Number"
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-3xl text-white bg-[#5737B4] hover:bg-[#432a91] transition"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
