import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCompanyDetails, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { companyDetailsApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

export default function CompanyDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const vendorId = localStorage.getItem("vendorId");

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
    if (!formData.type_of_vendor) newErrors.type_of_vendor = "Select a vendor type";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.company_email.trim()) {
      newErrors.company_email = "Email is required";
    } else if (!emailRegex.test(formData.company_email)) {
      newErrors.company_email = "Invalid email address";
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.company_number.trim()) {
      newErrors.company_number = "Phone number is required";
    } else if (!phoneRegex.test(formData.company_number)) {
      newErrors.company_number = "Enter a valid 10-digit  number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  if (!validate()) return;
  setLoading(true);

  try {
    const res = await companyDetailsApi(formData, vendorId);
    console.log("API response:", res);

    // ✅ Handle duplicate email error if returned as an array
    if (res?.data?.company_email && Array.isArray(res.data.company_email)) {
      const emailError = res.data.company_email[0];
      toast.error(emailError);
      setLoading(false);
      return;
    }

    // ✅ Optionally handle error string message
    if (typeof res?.data?.error === "string" && res.data.error.toLowerCase().includes("email")) {
      toast.error(res.data.error);
      setLoading(false);
      return;
    }

    // ✅ Proceed on success
    toast.success("Company details saved!");
    localStorage.setItem("vendorCompanyDetails", JSON.stringify(formData));
    localStorage.setItem("vendorId", vendorId);
    dispatch(setCompanyDetails(formData));
    dispatch(setCurrentStep(1));

    setTimeout(() => {
      navigate("/vendor-register/contact-details");
    }, 200);
  } catch (err) {
    console.error("API error:", err);

    // ✅ Catch 409 or email conflict
    if (err?.response?.status === 409) {
      toast.error("Email already exists.");
    } else if (
      err?.response?.data?.company_email &&
      Array.isArray(err.response.data.company_email)
    ) {
      toast.error(err.response.data.company_email[0]);
    } else {
      toast.error("Failed to save company details. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-5xl font-bold text-[#232832] mb-6">Company Details</h1>


        <form className="space-y-4 w-[600px] max-w-[550px]" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="company_name"
              placeholder="Company/Business Name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
              required
            />
            {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name}</p>}

          </div>

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

            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7F7F7F]">
              ▼
            </div>
            {errors.type_of_vendor && <p className="text-red-500 text-sm">{errors.type_of_vendor}</p>}
          </div>

         <div>
            <input
              type="email"
              name="company_email"
              placeholder="Email"
              value={formData.company_email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
              required
            />
            {errors.company_email && <p className="text-red-500 text-sm">{errors.company_email}</p>}
         </div>
          <div>
            <input
              type="tel"
              name="company_number"
              placeholder="+91 9876543210"
              value={formData.company_number}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
              required
            />
            {errors.company_number && <p className="text-red-500 text-sm">{errors.company_number}</p>}
          </div>

          <button
            type="submit"
            disabled={!isFormComplete || loading}
            className={`w-full py-3 rounded-3xl text-white transition mt-5 
              ${isFormComplete && !loading
                ? "bg-[#5737B4] hover:bg-[#432a91]"
                : "bg-[#D8D8D8] cursor-not-allowed"
              }`}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
