import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setBusinessDoc, setCompletedStep, setCurrentStep } from "../../../store/vendorRegisterSlice";
import { SlCloudUpload } from "react-icons/sl";
import { RiDeleteBinLine } from "react-icons/ri";
import { uploadBussinessDocApi } from "../../../services/allAPI";

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/x-webp"
];

export default function BusinessDocumentsUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  const [documents, setDocuments] = useState({
    gst_certificate: { file: null, progress: 0, status: "idle" },
    business_registration_cert: { file: null, progress: 0, status: "idle" },
    shop_license: { file: null, progress: 0, status: "idle" },
  });

  const uploadIntervals = useRef({});

  useEffect(() => {
    const saved = localStorage.getItem("vendorBusinessDocuments");
    if (saved) {
      const parsed = JSON.parse(saved);
      const isValidFile = (f) => f && typeof f === "object" && f.name;

      const restored = {
        gst_certificate: isValidFile(parsed.gst_certificate)
          ? { file: parsed.gst_certificate, progress: 100, status: "success" }
          : { file: null, progress: 0, status: "idle" },

        business_registration_cert: isValidFile(parsed.business_registration_cert)
          ? { file: parsed.business_registration_cert, progress: 100, status: "success" }
          : { file: null, progress: 0, status: "idle" },

        shop_license: isValidFile(parsed.shop_license)
          ? { file: parsed.shop_license, progress: 100, status: "success" }
          : { file: null, progress: 0, status: "idle" },
      };

      setDocuments(restored);
      console.log(" Restored Business Docs from localStorage", restored);
    }
  }, []);

  const handleFileChange = (eOrFile, key) => {
    const file = eOrFile?.target?.files?.[0] || eOrFile;
    if (!file) return;

    setDocuments((prev) => ({
      ...prev,
      [key]: { file, progress: 0, status: "uploading" }, 
    }));

    simulateUpload(file, key);
  };

const simulateUpload = (file, key) => {
  const isInvalid = !allowedTypes.includes(file.type);
  let progress = 0;

  const intervalId = setInterval(() => {
    progress += 10;

    if (progress <= 50) {
      setDocuments((prev) => ({
        ...prev,
        [key]: { ...prev[key], progress, status: "uploading" },
      }));
    }

    if (isInvalid && progress >= 50) {
      clearInterval(uploadIntervals.current[key]);
      setDocuments((prev) => ({
        ...prev,
        [key]: { ...prev[key], progress: 50, status: "failed" },
      }));
      return;
    }

    if (!isInvalid && progress >= 100) {
      clearInterval(uploadIntervals.current[key]);
      // Update status on UI
      setDocuments((prev) => ({
        ...prev,
        [key]: { ...prev[key], progress: 100, status: "success" },
      }));

      const existing = JSON.parse(localStorage.getItem("vendorBusinessDocuments") || "{}");
      localStorage.setItem(
        "vendorBusinessDocuments",
        JSON.stringify({ ...existing, [key]: file.name })
      );
      dispatch(setBusinessDoc({ key, file: { name: file.name } }));
          dispatch(setCompletedStep(3));    
    }
  }, 200);

  uploadIntervals.current[key] = intervalId;
};


  const handleRemove = (key) => {
    // Stop any ongoing upload
    clearInterval(uploadIntervals.current[key]);
    delete uploadIntervals.current[key];

    // Remove from state
    setDocuments((prev) => ({
      ...prev,
      [key]: { file: null, progress: 0, status: "idle" },
    }));
    const existing = JSON.parse(localStorage.getItem("vendorBusinessDocuments") || "{}");
    delete existing[key];
    localStorage.setItem("vendorBusinessDocuments", JSON.stringify(existing));
  };

  const isComplete = Object.values(documents).every((doc) => doc.status === "success");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete) {
      console.warn("All documents must be successfully uploaded.");
      return;
    }
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      console.error("Vendor ID not found.");
      return;
    }
    const formData = new FormData();
    try {
    Object.entries(documents).forEach(([key, doc]) => {
      if (doc?.file instanceof File) {
        formData.append(key, doc.file);
      }
    });
      const response = await uploadBussinessDocApi(vendorId, formData);

      if (response.status === 200 || response.status === 201) {
        console.log("Business documents uploaded successfully:", response.data);
        dispatch(setCurrentStep(4));
        setTimeout(() => {
          navigate("/vendor-register/bank-details");
        }, 100);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(" Error submitting business documents:", error);
      if (error.response?.status === 400 && error.response.data) {
        const fieldErrors = error.response.data;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          console.error(` ${field}: ${messages[0]}`);
        });
      } else {
        toast.error("Failed to submit documents. Please try again.");
      }
    }
  };

  const renderUploader = (label, id) => {
    const doc = documents[id];

    return (
      <div className="w-full sm:w-[300px] mb-6">
        <label className="block text-[#232832] font-semibold mb-2">{label}</label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileChange(file, id);
          }}
          className={`relative w-full h-45 border-2 rounded-lg flex flex-col justify-center items-center text-center bg-white transition
            ${doc.status === "uploading"
              ? "border-green-500 bg-green-50 border-dashed"
              : doc.status === "failed"
                ? "border-red-300 bg-[#FAEAE5] border-dashed"
                : dragActive
                  ? "border-blue-400 bg-blue-50 border-dashed"
                  : "border-dashed border-gray-500"
            }`}
        >
          {!doc.file ? (
            <label className="cursor-pointer flex flex-col items-center justify-center">
              <SlCloudUpload className="text-4xl mb-2" />
              <span className="text-sm text-gray-500">Drag and drop here</span>
              <span className="text-[#5737B4] font-semibold">Browse Files</span>
              <input
                type="file"
                accept=".pdf,.jpeg"
                onChange={(e) => handleFileChange(e, id)}
                className="hidden"
              />
            </label>
          ) : doc.status === "failed" ? (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <SlCloudUpload className="text-4xl text-red-500 mb-2" />
              <div className="text-red-500 font-semibold text-lg">Upload Failed</div>
              <button
                onClick={() => handleRemove(id)}
                className="underline text-[#5737B4] text-sm mt-1"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center w-[90%] mb-1">
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

                <div className="mt-5">
                  {doc.status === "uploading" ? (
                    <button
                      onClick={() => handleRemove(id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Cancel
                    </button>
                  ) : (
                    <RiDeleteBinLine
                      onClick={() => handleRemove(id)}
                      className="text-red-500 cursor-pointer text-3xl my-2"
                      title="Remove"
                    />
                  )}
                </div>
              </div>

              <div className="w-[90%]">
                <div className="h-1 rounded bg-gray-200 relative">
                  <div
                    className={`h-1 rounded ${doc.status === "success" ? "bg-[#5737B4]" : "bg-red-500"
                      }`}
                    style={{ width: `${doc.progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs mt-1 font-semibold text-green-600">
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
    <div className="flex min-h-screen bg-[#ECECF0]">
      <div className="w-full max-w-[1200px] p-4 sm:p-6 lg:p-8 mx-auto my-10">
        <div className="mb-6">
        <h1 className="text-5xl font-bold text-[#232832]">Business Documents</h1>
        <span className="block text-sm font-normal text-gray-600 mt-1">
            (Allowed file types: .pdf, .jpg, .jpeg, .png{" "}
            <span className="text-red-900">*</span>)
          </span>
          </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row justify-between gap-10 text-lg">
            {renderUploader("Upload GSTIN Certificate", "gst_certificate")}
            {renderUploader("Business Registration Certificate", "business_registration_cert")}
            {renderUploader("Shop & Establishment License", "shop_license")}
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-10">
            <button
              type="button"
              onClick={() => navigate("/vendor-register/bank-details")}
              className="px-1 sm:px-12 py-2 w-[250px] text-[#5737B4] border border-[#5737B4] font-medium rounded-full hover:bg-[#f4f4f4] transition-all"
            >
              Skip for Now
            </button>

            <button
              type="submit"
              disabled={!isComplete}
              className={`px-1 sm:px-12 py-2.5 w-[250px] text-white font-medium rounded-full transition-all ${isComplete
                ? "bg-[#5737B4] hover:bg-[#432a91]"
                : "bg-[#D8D8D8] cursor-not-allowed"
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
