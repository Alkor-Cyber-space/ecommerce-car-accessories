import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCompanyDetails, setCompletedStep, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { companyDetailsApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

export default function CompanyDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
    if (!formData.type_of_vendor) newErrors.type_of_vendor = "Select a vendor type";
    if (!formData.company_email.trim()) {
      newErrors.company_email = "Email is required";
    } else if (!emailRegex.test(formData.company_email)) {
      newErrors.company_email = "Invalid email address";
    }

    if (!formData.company_number.trim()) {
      newErrors.company_number = "Phone number is required";
    } else if (!phoneRegex.test(formData.company_number)) {
      newErrors.company_number = "Enter a valid 10-digit number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = Object.values(formData).every((val) => val.trim() !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      toast.error("Vendor ID is missing");
      return;
    }
    setLoading(true);
    toast._shown = false;

    try {
      const response = await companyDetailsApi(formData, vendorId);
      console.log("API response:", response);

      if (response?.status === 400 && response?.data) {
        const serverErrors = response.data;
        const newErrors = {};

        Object.keys(serverErrors).forEach((field) => {
          const message = Array.isArray(serverErrors[field])
            ? serverErrors[field][0]
            : serverErrors[field];
          newErrors[field] = message;

          if (!toast._shown) {
            toast.error(message);
            toast._shown = true;
          }
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
        setLoading(false);
        return;
      }

      if (response?.status === 200 || response?.status === 201) {
        dispatch(setCompanyDetails(formData));
        dispatch(setCompletedStep(0));
        dispatch(setCurrentStep(1));
        localStorage.setItem("vendorCompanyDetails", JSON.stringify(formData));

        setTimeout(() => {
          navigate("/vendor-register/contact-details");
        }, 200);
      } else {
        toast.error("Unexpected response");
      }
    } catch (err) {
      const serverData = err.response?.data;
      const formattedErrors = {};

      if (serverData && typeof serverData === "object") {
        Object.keys(serverData).forEach((field) => {
          if (Array.isArray(serverData[field])) {
            formattedErrors[field] = serverData[field][0];
            if (!toast._shown) {
              toast.error(serverData[field][0]);
              toast._shown = true;
            }
          }
        });
        setErrors((prev) => ({ ...prev, ...formattedErrors }));
      } else {
        toast.error("Failed to save company details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const isVerified = localStorage.getItem("vendorOtpVerified") === "true";
    if (!isVerified) {
      navigate("/vendor-register/verify", { replace: true });
    }

    const handlePopState = () => {
      const isVerified = localStorage.getItem("vendorOtpVerified") === "true";
      if (isVerified) {
        navigate("/vendor-register/company-details", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);


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
              className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg bg-white font-semibold focus:ring-2 ${formData.type_of_vendor ? "text-black" : "text-[#7F7F7F]"
                }`}
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
            className={`w-full py-3 rounded-3xl text-white transition mt-5 ${isFormComplete && !loading
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
