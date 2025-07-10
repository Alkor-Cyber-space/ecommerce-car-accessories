// src/pages/vendor-register/steps/KYCDocumentsUpload.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addKycDocument, setCurrentStep } from "../../../store/vendorRegisterSlice";

export default function KYCDocumentsUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [panCard, setPanCard] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const isFormComplete = panCard && identityProof;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;

    // Dispatch each document to Redux
    dispatch(addKycDocument({
      id: "pan",
      name: panCard.name,
      size: panCard.size,
      type: panCard.type,
    }));

    dispatch(addKycDocument({
      id: "identity",
      name: identityProof.name,
      size: identityProof.size,
      type: identityProof.type,
    }));

    dispatch(setCurrentStep(3));

    setTimeout(() => {
      navigate("/vendor-register/business-documents");
    }, 100);
  };

  // preview 
  // const previewUrl = URL.createObjectURL(file);


  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-2xl p-8 mx-auto my-10">
        <h1 className="text-4xl font-bold text-[#232832] mb-6">KYC Documents</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* PAN Card Upload */}
          <div>
            <label className="block text-[#232832] font-semibold mb-2">
              Upload PAN Card
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, setPanCard)}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold border border-gray-300"
              required
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
              onChange={(e) => handleFileChange(e, setIdentityProof)}
              className="w-full px-4 py-3 rounded-lg bg-white font-semibold border border-gray-300"
              required
            />
          </div>

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
