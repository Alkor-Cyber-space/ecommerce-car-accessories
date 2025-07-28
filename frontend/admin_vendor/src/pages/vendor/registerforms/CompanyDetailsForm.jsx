import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCompanyDetails, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { companyDetailsApi } from "../../../services/allAPI";


export default function CompanyDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔁 Load saved data from localStorage (if exists)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("vendorCompanyDetails");
    return saved
      ? JSON.parse(saved)
      : {
          company_name: "",
          type_of_vendor: "",
          company_email: "",
          company_number: "",
        };
  });
 
 const vendorId = localStorage.getItem("vendorId"); // adjust source if needed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormComplete = Object.values(formData).every((val) => val.trim() !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) return;

    try {
      const res = await companyDetailsApi(formData, vendorId);
      console.log("API response:", res);

      toast.success("✅ Company details saved!");

      // Save locally
      localStorage.setItem("vendorCompanyDetails", JSON.stringify(formData));

      // Save to Redux
      dispatch(setCompanyDetails(formData));
      dispatch(setCurrentStep(1));

      setTimeout(() => {
        navigate("/vendor-register/contact-details");
      }, 200);
    } catch (err) {
      console.error("API error:", err);
      toast.error(`❌ Failed to save company details: ${err?.message || "Try again"}`);
    }
  };
  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
  
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-5xl font-bold text-[#232832] mb-6">Company Details</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="company_name"
            placeholder="Company/Business Name"
            value={formData.company_name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />
          <div className="relative">
            <select
              name="type_of_vendor"
              value={formData.type_of_vendor}
              onChange={handleChange}
              className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg bg-white font-semibold focus:ring-2
              ${formData.type_of_vendor ? "text-black" : "text-[#7F7F7F]"}`}
              required
            >
              <option value="">Type of Vendor</option>
              <option value="business">Business</option>
              <option value="wholesale">Wholesaler</option>
            </select>

            {/* Dropdown Icon */}
            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7F7F7F]">
              ▼
            </div>
          </div>

          <input
            type="email"
            name="company_email"
            placeholder="Email"
            value={formData.company_email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
            required
          />
          <input
            type="tel"
            name="company_number"
            placeholder="+91 9876543210"
            value={formData.company_number}
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
