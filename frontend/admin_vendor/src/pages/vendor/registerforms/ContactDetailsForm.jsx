import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCompletedStep, setContactDetails, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { contactDetailsApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

export default function ContactDetailsForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("vendorContactDetails");
    return saved
      ? JSON.parse(saved)
      : {
        contact_name: "",
        contact_email: "",
        contact_number: "",
        designation: "",
      };
  });

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Email is required";
    } else if (!emailRegex.test(formData.contact_email)) {
      newErrors.contact_email = "Invalid email address";
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Phone number is required";
    } else if (!phoneRegex.test(formData.contact_number)) {
      newErrors.contact_number = "Enter a valid 10-digit  number";
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
    if (!isFormComplete || !validate()) return;
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      toast.error("Vendor ID missing");
      return;
    }
    setLoading(true);
    toast._shown = false;

    try {
      const response = await contactDetailsApi(vendorId, formData);
      console.log(response);
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

        dispatch(setContactDetails(formData));
        dispatch(setCompletedStep(1));
        dispatch(setCurrentStep(2));
        localStorage.setItem("vendorContactDetails", JSON.stringify(formData));

        setTimeout(() => {
          navigate("/vendor-register/kyc-documents");
        }, 200);
      } else {
        console.error("Unexpected response:", response.data);
      }
    } catch (error) {
      const serverData = error.response?.data;

      if (serverData && typeof serverData === "object") {
        const formattedErrors = {};

        Object.keys(serverData).forEach((field) => {
          if (Array.isArray(serverData[field])) {
            formattedErrors[field] = serverData[field][0]; 
            toast.error(`${serverData[field][0]}`);
          }
        });

        setErrors((prev) => ({
          ...prev,
          ...formattedErrors,
        }));
      }
    } finally {
      {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-5xl font-bold text-[#232832] mb-6">Contact Details</h1>

        <form className="space-y-4 w-[600px] max-w-[550px]" onSubmit={handleSubmit}>
          <input
            type="text"
            name="contact_name"
            placeholder="Contact Person Name"
            value={formData.contact_name}
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
              ${formData.designation ? "text-black" : "text-[#7F7F7F]"}`}
              required
            >
              <option value="">Select Designation</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="sales_head">Sales Head</option>
              <option value="marketing_exec">Marketing Executive</option>
            </select>

            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7F7F7F]">
              ▼
            </div>

          </div>

          <div>
            <input
              type="tel"
              name="contact_number"
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
              required
            />
            {errors.contact_number && <p className="text-red-500 text-sm">{errors.contact_number}</p>}
          </div>

          <div>
            <input
              type="email"
              name="contact_email"
              placeholder="Email"
              value={formData.contact_email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold focus:ring-2"
              required
            />
            {errors.contact_email && (
              <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormComplete || loading}
            className={`w-full py-3 rounded-3xl text-white transition mt-5
    ${isFormComplete && !loading ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"}`}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>

        </form>
      </div>
    </div>
  );
}
