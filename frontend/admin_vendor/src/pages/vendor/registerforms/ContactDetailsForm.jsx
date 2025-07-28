import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setContactDetails, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { contactDetailsApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

export default function ContactDetailsForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🔁 Load from localStorage on init
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("vendorContactDetails");
    return saved
      ? JSON.parse(saved)
      : {
        contactPersonName: "",
        designation: "",
        contactNumber: "",
        contactEmail: "",
      };
  });

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

    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      toast.error("Vendor ID missing");
      return;
    }
    setLoading(true);

    try {
      const response = await contactDetailsApi(vendorId, formData);
      console.log(response);
      // if (response?.data?.email && Array.isArray(response.data.email)) {
      //         const emailError = response.data.email[0];
      //         toast.error(` ${emailError}`);
      //         setLoading(false);
      //         return;
      //       }

      if (response?.status === 200 || response?.status === 201) {

        dispatch(setContactDetails(formData));
        dispatch(setCurrentStep(2));
        localStorage.setItem("vendorContactDetails", JSON.stringify(formData));

        setTimeout(() => {
          navigate("/vendor-register/kyc-documents");
        }, 200);
      } else {
        toast.error("Failed to save contact details. Try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-5xl font-bold text-[#232832] mb-6">Contact Details</h1>

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
