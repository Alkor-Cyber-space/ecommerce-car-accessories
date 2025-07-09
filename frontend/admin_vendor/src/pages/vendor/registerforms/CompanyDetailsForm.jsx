import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCompanyDetails, setCurrentStep } from "../../../store/vendorRegisterSlice";

export default function CompanyDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    vendorType: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormComplete = Object.values(formData).every((value) => value.trim() !== "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormComplete) return;

    dispatch(setCompanyDetails(formData));
    dispatch(setCurrentStep(1));
    navigate("/vendor-register/contact-details");
  };

  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-4xl font-bold text-[#232832] mb-6">Company Details</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="companyName"
            placeholder="Company/Business Name"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />
          <select
            name="vendorType"
            value={formData.vendorType}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold text-[#7F7F7F] focus:ring-2"
            required
          >
            <option value="">Type of Vendor</option>
            <option value="retail">Retailer</option>
            <option value="wholesale">Wholesaler</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />

          <button
            type="submit"
            disabled={!isFormComplete}
            className={`w-full py-3 rounded-3xl text-white transition 
              ${isFormComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
