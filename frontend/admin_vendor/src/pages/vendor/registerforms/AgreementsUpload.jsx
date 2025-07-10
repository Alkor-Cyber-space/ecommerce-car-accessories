import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAgreements, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { SlCloudUpload } from "react-icons/sl";
import { RiDeleteBinLine } from "react-icons/ri";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

export default function AgreementsUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [docs, setDocs] = useState({
    vendorForm: { file: null, progress: 0, status: "idle" },
    ndaOrAgreement: { file: null, progress: 0, status: "idle" },
    authorizationLetter: { file: null, progress: 0, status: "idle" },
    signatoryLetter: { file: null, progress: 0, status: "idle" },
  });

  const uploadIntervals = useRef({});

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocs(prev => ({
      ...prev,
      [key]: { file, progress: 0, status: "uploading" }
    }));

    simulateUpload(file, key);
  };

  const simulateUpload = (file, key) => {
    const isInvalid = !allowedTypes.includes(file.type);
    let progress = 0;

    const intervalId = setInterval(() => {
      progress += 10;

      if (progress <= 50) {
        setDocs(prev => ({
          ...prev,
          [key]: { ...prev[key], progress, status: "uploading" }
        }));
      }

      if (isInvalid && progress >= 50) {
        clearInterval(uploadIntervals.current[key]);
        setDocs(prev => ({
          ...prev,
          [key]: { ...prev[key], progress: 50, status: "failed" }
        }));
        return;
      }

      if (!isInvalid && progress >= 100) {
        clearInterval(uploadIntervals.current[key]);
        setDocs(prev => ({
          ...prev,
          [key]: { ...prev[key], progress: 100, status: "success" }
        }));
      }
    }, 150);

    uploadIntervals.current[key] = intervalId;
  };

  const isComplete = Object.values(docs).every(doc => doc.status === "success");

  const handleSubmit = () => {
    const uploadedDocs = {};
    Object.entries(docs).forEach(([key, doc]) => {
      if (doc.file) {
        uploadedDocs[key] = {
          name: doc.file.name,
          size: doc.file.size,
          type: doc.file.type,
        };
      }
    });

    dispatch(setAgreements(uploadedDocs));
    dispatch(setCurrentStep(7));
    navigate("/vendor-register/summary");
  };

  const renderUploader = (label, key) => {
    const doc = docs[key];

    return (
      <div className="w-full lg:w-[300px] mb-6">
        <label className="block h-13 w-65 font-semibold text-[#232832]">{label}</label>
        <div className={`relative w-[300px] h-44 border-2 rounded-lg flex flex-col justify-center items-center text-center bg-white transition
          ${doc.status === "uploading" ? "border-green-500 bg-green-50 border-dashed"
              : doc.status === "failed" ? "border-red-300 bg-[#FAEAE5]"
                : "border-dashed border-gray-300"}`}>

          {!doc.file ? (
            <label className="cursor-pointer flex flex-col items-center justify-center">
              <SlCloudUpload className="text-4xl mb-2" />
              <span className="text-sm text-gray-500">Drag and drop here</span>
              <span className="text-[#5737B4] font-semibold">Browse Files</span>
              <input
                type="file"
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={(e) => handleFileChange(e, key)}
                className="hidden"
              />
            </label>
          ) : doc.status === "failed" ? (
            <div className="text-center py-4">
              <SlCloudUpload className="text-3xl text-red-500 mx-auto" />
              <p className="text-red-500 font-medium mt-2">Upload Failed</p>
              <button
                className="text-[#5737B4] underline text-sm"
                onClick={() => {
                  setDocs(prev => ({
                    ...prev,
                    [key]: { file: null, progress: 0, status: "idle" }
                  }));
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center w-[90%] mb-2">
                <div className="text-sm truncate max-w-[180px]">
                  <p className="text-[#232832] font-medium">{doc.file.name}</p>
                  <p className="text-xs text-gray-500">{(doc.file.size / 1024).toFixed(0)}kb</p>
                </div>
                <RiDeleteBinLine
                  className="text-red-500 cursor-pointer text-xl"
                  onClick={() =>
                    setDocs(prev => ({
                      ...prev,
                      [key]: { file: null, progress: 0, status: "idle" }
                    }))
                  }
                />
              </div>
              <div className="w-[90%]">
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className={`h-full rounded ${doc.status === "success" ? "bg-[#5737B4]" : "bg-red-500"}`}
                    style={{ width: `${doc.progress}%` }}
                  />
                </div>
                <div className="text-right text-xs text-green-600 font-semibold mt-1">
                  {doc.progress}%
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#ECECF0] py-10 px-4 sm:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-bold text-[#232832] mb-10">Agreements & Supporting Documents</h1>

        <div className="flex flex-col sm:flex-row gap-6 flex-wrap mb-10">
          {renderUploader("Filled Vendor Registration Form", "vendorForm")}
          {renderUploader("Signed NDA / Supply Agreement / Terms & Conditions", "ndaOrAgreement")}
          {renderUploader("Authorization Letter / Dealership Certificate", "authorizationLetter")}
          {renderUploader("Authorized Signatory Letter (with seal)", "signatoryLetter")}
        </div>

        <button
          disabled={!isComplete}
          onClick={handleSubmit}
          className={`px-12 py-2 rounded-3xl text-white transition ${isComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"}`}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
