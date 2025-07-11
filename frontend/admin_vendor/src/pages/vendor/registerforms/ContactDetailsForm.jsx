// src/pages/vendor-register/steps/ContactDetailsForm.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setContactDetails, setCurrentStep } from "../../../store/vendorRegisterSlice";

export default function ContactDetailsForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    contactPersonName: "",
    designation: "",
    contactNumber: "",
    contactEmail: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormComplete = Object.values(formData).every((val) => val.trim() !== "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;

    dispatch(setContactDetails(formData));
    dispatch(setCurrentStep(2));

    setTimeout(() => {
      navigate("/vendor-register/kyc-documents");
    }, 100);
  };

  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-4xl font-bold text-[#232832] mb-6">Contact Details</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="contactPersonName"
            placeholder="Contact Person Name"
            value={formData.contactPersonName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />

          <div className="relative">
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg bg-white font-semibold focus:ring-2 
      ${formData.designation ? 'text-black' : 'text-[#7F7F7F]'}`}
              required
            >
              <option value="">Select Designation</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="sales_head">Sales Head</option>
              <option value="marketing_exec">Marketing Executive</option>
            </select>

            {/* Custom arrow icon */}
            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7F7F7F]">
              ▼
            </div>
          </div>

          <input
            type="tel"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />

          <input
            type="email"
            name="contactEmail"
            placeholder="Email"
            value={formData.contactEmail}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />

          <button
            type="submit"
            disabled={!isFormComplete}
            className={`w-full py-3 rounded-3xl text-white transition mt-5
              ${isFormComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"}`}
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
