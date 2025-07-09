import React from "react";

export default function KYCDocumentsUpload() {
  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      {/* Form Card */}
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-4xl font-bold text-[#232832] mb-6">KYC Documents</h1>

        <form className="space-y-6">
          {/* PAN Card Upload */}
          <div>
            <label className="block text-[#232832] font-semibold mb-2">
              Upload PAN Card
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold border border-gray-300"
            />
          </div>

          {/* Aadhar / Passport / Driving License Upload */}
          <div>
            <label className="block text-[#232832] font-semibold mb-2">
              Upload Aadhar / Passport / Driving License
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold border border-gray-300"
            />
          </div>

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
