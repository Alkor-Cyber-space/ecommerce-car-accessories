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
      <div className="w-full max-w-4xl p-8 mx-auto my-10">
        <h1 className="text-5xl font-bold text-[#232832] mb-6">KYC Documents</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* PAN Card Upload */}
          <div className="relative w-[600px]">

            <label className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg text-gray-500 font-medium cursor-pointer block text-left hover:bg-gray-100 transition">
              {panCard ? panCard.name : "PAN Card"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, setPanCard)}
                className="hidden"
              />
            </label>
          </div>


          {/* Aadhar / Passport / Driving License Upload */}
          <div className="relative w-full">
            <label className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg text-gray-500 font-medium cursor-pointer block text-left hover:bg-gray-100 transition">
              {identityProof ? identityProof.name : "Aadhar / Passport / Driving License"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, setIdentityProof)}
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
