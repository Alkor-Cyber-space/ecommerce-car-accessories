import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SlCloudUpload } from "react-icons/sl";
import { RiDeleteBinLine } from "react-icons/ri";
import { setAgreements, setCurrentStep, setCompletedStep } from "../../../store/vendorRegisterSlice";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

export default function AgreementsUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    dispatch(setCompletedStep(5));
    setLoading(true);

    setTimeout(() => {
      dispatch(setCurrentStep(6)); 
      setLoading(false);
      navigate("/login");
    }, 1500);
  };


  const renderUploader = (label, id) => {
    const doc = docs[id];

    return (
      <div className="flex-1 min-w-[250px] max-w-[400px]">
        <label className="block font-semibold text-[#232832] mb-3">{label}</label>
        <div
          className={`relative w-full h-45 border-2 rounded-lg flex flex-col justify-center items-center text-center bg-white transition
        ${doc.status === "uploading"
              ? "border-green-500 bg-green-50 border-dashed"
              : doc.status === "failed"
                ? "border-red-300 bg-[#FAEAE5] border-dashed"
                : "border-dashed border-gray-500"}`}
        >
          {!doc.file ? (
            <label className="cursor-pointer flex flex-col items-center justify-center">
              <SlCloudUpload className="text-4xl mb-2" />
              <span className="text-sm text-gray-500">Drag and drop here</span>
              <span className="text-sm text-[#5737B4] font-semibold">Browse Files</span>
              <input
                type="file"
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={(e) => handleFileChange(e, id)}
                className="hidden"
              />
            </label>
          ) : doc.status === "failed" ? (
            <div className="text-center py-4">
              <SlCloudUpload className="text-3xl text-red-500 mx-auto" />
              <p className="text-red-500 font-medium mt-2">Upload Failed</p>
              <button
                className="text-[#5737B4] underline text-sm"
                onClick={() =>
                  setDocs(prev => ({
                    ...prev,
                    [id]: { file: null, progress: 0, status: "idle" }
                  }))
                }
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
                      [id]: { file: null, progress: 0, status: "idle" }
                    }))
                  }
                />
              </div>
              <div className="w-[90%]">
                <div className="h-1 bg-gray-200 rounded">
                  <div
                    className={`h-1 rounded ${doc.status === "success" ? "bg-[#5737B4]" : "bg-red-500"}`}
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
    <div className="min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-[1200px] p-4 sm:p-6 lg:p-8 mx-auto my-10">
        <h1 className="text-5xl font-bold text-[#232832] mb-10">Business Documents</h1>

        <div className="flex flex-col sm:flex-row gap-15 flex-wrap">
          <div className="mt-11 text-xl w-full max-w-[320px]">
            {renderUploader("Filled Vendor Registration Form", "vendorForm")}
          </div>
          <div className="mt-4 text-xl w-full max-w-[320px]">
            {renderUploader("Signed NDA / Supply Agreement / Terms & Conditions", "ndaOrAgreement")}
          </div>
          <div className="mt-4 text-xl w-full max-w-[320px]">
            {renderUploader("Authorization Letter / Dealership Certificate", "authorizationLetter")}
          </div>
          <div className="mt-1 text-xl w-full max-w-[360px]">
            {renderUploader("Authorized Signatory Letter (with seal)", "signatoryLetter")}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-10">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-[280px] py-2.5 text-[#5737B4] border border-[#5737B4] font-medium rounded-full hover:bg-[#f4f4f4] transition-all"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            className={`w-[280px] py-2.5 rounded-full text-white font-medium transition-all ${isComplete && !loading
                ? "bg-[#5737B4] hover:bg-[#432a91]"
                : "bg-[#D8D8D8] cursor-not-allowed"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Save & Continue"
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
