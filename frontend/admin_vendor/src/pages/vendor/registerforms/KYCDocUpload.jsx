import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addKycDocument, setCompletedStep, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { uploadKYCDocumentsApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

export default function KYCDocumentsUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load metadata from localStorage
  const [panCard, setPanCard] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vendorKycDocuments"));
    if (saved) {
      if (saved.panCard) setPanCard(saved.panCard);
      if (saved.identityProof) setIdentityProof(saved.identityProof);
    }
  }, []);

  const handleFileChange = (e, setter, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = {
      file, 
      name: file.name,
      size: file.size,
      type: file.type,
    };

    setter(fileData);

    // Save metadata only 
    const current = JSON.parse(localStorage.getItem("vendorKycDocuments")) || {};
    localStorage.setItem(
      "vendorKycDocuments",
      JSON.stringify({
        ...current,
        [key]: { name: file.name, size: file.size, type: file.type },
      })
    );
  };

  const isFormComplete = panCard && identityProof;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) return;
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      toast.error("Vendor ID missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pan_card", panCard?.file);
      formData.append("aadhar_passport_dl", identityProof?.file);
      console.log("pan_card:", panCard?.file);
      console.log("aadhar_passport_dl:", identityProof?.file);

      const response = await uploadKYCDocumentsApi(vendorId, formData);
      console.log(response.data);

      dispatch(addKycDocument({ id: "pan", ...panCard }));
      dispatch(addKycDocument({ id: "identity", ...identityProof }));
      dispatch(setCompletedStep(2));
      dispatch(setCurrentStep(3));

      setTimeout(() => {
        navigate("/vendor-register/business-documents");
      }, 100);
    } catch (error) {
      console.error("Error uploading KYC documents:", error);
      if (error?.response?.data) {
        const errors = error.response.data;
        if (errors.pan_card) {
          toast.error(`PAN Card: ${errors.pan_card[0]}`);
        }
        if (errors.aadhar_passport_dl) {
          toast.error(`Identity: ${errors.aadhar_passport_dl[0]}`);
        }
      } else {
        toast.error("Failed to upload KYC documents. Try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-4xl p-8 mx-auto my-10">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-[#232832]">KYC Documents</h1>
          <span className="block text-sm font-normal text-gray-600 mt-1">
            (Allowed file types: .pdf, .jpg, .jpeg, .png{" "}
            <span className="text-red-900">*</span>)
          </span>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* PAN Card Upload */}
          <div className="relative w-[600px]">
            <label className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg text-gray-500 font-medium cursor-pointer block text-left hover:bg-gray-100 transition">
              {panCard ? panCard.name : "PAN Card"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, setPanCard, "panCard")}
                className="hidden"
              />
            </label>
          </div>

          {/* Aadhar / Passport / Driving License */}
          <div className="relative w-[600px]">
            <label className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg text-gray-500 font-medium cursor-pointer block text-left hover:bg-gray-100 transition">
              {identityProof ? identityProof.name : "Aadhar / Passport / Driving License"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, setIdentityProof, "identityProof")}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormComplete}
            className={`w-full py-3 rounded-3xl text-white transition 
              ${isFormComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"}`}
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
