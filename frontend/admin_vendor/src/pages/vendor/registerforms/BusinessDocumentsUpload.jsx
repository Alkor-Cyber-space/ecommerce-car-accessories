import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setBusinessDoc, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { SlCloudUpload } from "react-icons/sl";
import { FaTrashAlt } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

export default function BusinessDocumentsUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState({
    gstinCertificate: { file: null, progress: 0, status: "idle" },
    registrationCertificate: { file: null, progress: 0, status: "idle" },
    shopLicense: { file: null, progress: 0, status: "idle" },
  });

  const uploadIntervals = useRef({});

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    // ✅ Always set file and mark as uploading — regardless of type
    setDocuments((prev) => ({
      ...prev,
      [name]: { file, progress: 0, status: "uploading" },
    }));

    // ✅ simulateUpload will handle progress + success/failure
    simulateUpload(name, file);
  };


  const simulateUpload = (name, file) => {
    const allowedTypes = ["application/pdf", "image/jpeg"];
    const isInvalidType = !allowedTypes.includes(file.type);

    let progress = 0;

    const intervalId = setInterval(() => {
      progress += 10;

      if (progress <= 50) {
        // Show progress up to 50% for any file
        setDocuments((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            progress,
            status: "uploading",
          },
        }));
      }

      if (isInvalidType && progress >= 50) {
        clearInterval(uploadIntervals.current[name]);
        delete uploadIntervals.current[name];

        setDocuments((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            progress: 50,
            status: "failed",
          },
        }));
        return;
      }

      if (!isInvalidType && progress >= 100) {
        clearInterval(uploadIntervals.current[name]);
        delete uploadIntervals.current[name];

        setDocuments((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            progress: 100,
            status: "success",
          },
        }));

        dispatch(
          setBusinessDoc({
            key: name,
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
          })
        );
      }
    }, 200);

    uploadIntervals.current[name] = intervalId;
  };

  const fileInputsRef = useRef({
    gstinCertificate: null,
    registrationCertificate: null,
    shopLicense: null,
  });



  const handleCancelUpload = (name) => {
    clearInterval(uploadIntervals.current[name]);
    delete uploadIntervals.current[name];
    setDocuments((prev) => ({
      ...prev,
      [name]: { file: null, progress: 0, status: "idle" },
    }));
  };

  const handleRetry = (name) => {
    if (fileInputsRef.current[name]) {
      fileInputsRef.current[name].click();
    }
  };

  const isFormComplete =
    documents.gstinCertificate.status === "success" &&
    documents.registrationCertificate.status === "success" &&
    documents.shopLicense.status === "success";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;
    dispatch(setCurrentStep(4));
    setTimeout(() => navigate("/vendor-register/bank-details"), 100);
  };

  const renderUploadBox = (id, label) => {
    const doc = documents[id];

    const borderStyles = {
      idle: "border-dashed border-gray-300",
      uploading: "border-green-500 bg-green-50 border-dashed",
      success: "border-dashed border-gray-300",
      failed: "border-dashed border-gray-300 ",
    };

    return (
      <div className="w-full sm:w-[300px] mb-6">
        <label className="block text-[#232832] font-semibold mb-2">{label}</label>
        <div
          className={`relative w-[300px] h-44 border-2 rounded-lg flex flex-col justify-center items-center text-center bg-white transition ${borderStyles[doc.status]}`}
        >
          {!doc.file ? (
            <label htmlFor={id} className="cursor-pointer flex flex-col items-center justify-center">
              <SlCloudUpload className="text-4xl mb-2" />
              <span className="text-sm text-gray-500">Drag and drop here</span>
              <span className="text-[#5737B4] font-semibold">Browse Files</span>
            </label>
          ) : (
            <>
              {/* Show only if not failed */}
              {doc.status !== "failed" && (
                <div className="flex justify-between items-center w-[90%] mb-1">
                  {/* File type + name */}
                  <div className="flex items-center gap-4">
                    <div className="text-[#0CA37F] font-semibold text-md">
                      {doc.file.type?.split("/")[1]?.toUpperCase() || "FILE"}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="text-[#232832] text-sm font-medium truncate max-w-[120px]">
                        {doc.file.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {(doc.file.size / 1024).toFixed(0)}kb
                      </div>
                    </div>
                  </div>

                  {/* Cancel or Delete */}
                  <div className="mt-5">
                    {doc.status === "uploading" ? (
                      <button
                        onClick={() => handleCancelUpload(id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    ) : (
                      <RiDeleteBinLine
                        onClick={() => handleCancelUpload(id)}
                        className="text-red-500 cursor-pointer text-3xl my-2"
                        title="Remove"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Progress or Failure */}
              {doc.status === "failed" ? (
                <div className="flex flex-col items-center  justify-center text-center w-full py-4">
                  <SlCloudUpload className="text-4xl text-red-500 mb-2" />
                  <div className="text-red-500 font-semibold text-lg">Upload Failed</div>
                  <button
                    onClick={() => handleRetry(id)}
                    className="underline text-[#5737B4] text-sm mt-1"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="w-[90%]">
                  <div className="h-2 rounded bg-gray-200 relative">
                    <div
                      className="h-full rounded bg-[#5737B4]"
                      style={{ width: `${doc.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs mt-1 font-semibold text-green-600">
                    {doc.progress}%
                  </div>
                </div>
              )}
            </>
          )}

          <input
            type="file"
            id={id}
            name={id}
            accept=".pdf,.jpeg"
            ref={(el) => (fileInputsRef.current[id] = el)}
            onChange={handleFileChange}
            className="hidden"
          />

        </div>
      </div>

    );
  };


  return (
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-[1200px] p-4 sm:p-6 lg:p-8 mx-auto my-10">
        <h1 className="text-4xl font-bold text-[#232832] mb-10">Business Documents</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            {renderUploadBox("gstinCertificate", "Upload GSTIN Certificate")}
            {renderUploadBox("registrationCertificate", "Business Registration Certificate")}
            {renderUploadBox("shopLicense", "Shop & Establishment License")}
          </div>

          <div className="flex justify-evenly gap-2 mt-6">
            <button
              type="button"
              className="px-12 py-2 rounded-3xl text-[#5737B4] border-2 border-[#5737B4] bg-gray-200 hover:bg-gray-300 transition"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={!isFormComplete}
              className={`px-12 py-2 rounded-3xl text-white transition ${isFormComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"
                }`}
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
