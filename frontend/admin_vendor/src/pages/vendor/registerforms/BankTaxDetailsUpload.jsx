import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SlCloudUpload } from "react-icons/sl";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  setCurrentStep,
  setBankDetails,
  setTaxDocuments,
} from "../../../store/vendorRegisterSlice";


const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

export default function BankAndTaxDetails() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showTaxSection, setShowTaxSection] = useState(false);

    const [bankDocs, setBankDocs] = useState({
        cancelledCheque: { file: null, progress: 0, status: "idle" },
        bankStatement: { file: null, progress: 0, status: "idle" },
    });

    const [taxDocs, setTaxDocs] = useState({
        itrReport: { file: null, progress: 0, status: "idle" },
        plOrBalanceSheet: { file: null, progress: 0, status: "idle" },
    });


    const uploadIntervals = useRef({});

    const handleFileChange = (e, section, name) => {
        const file = e.target.files[0];
        if (!file) return;

        const setDocs = section === "bank" ? setBankDocs : setTaxDocs;

        setDocs((prev) => ({
            ...prev,
            [name]: { file, progress: 0, status: "uploading" },
        }));

        simulateUpload(file, section, name);
    };

    const simulateUpload = (file, section, name) => {
        const isInvalid = !allowedTypes.includes(file.type);
        const updateDocs = section === "bank" ? setBankDocs : setTaxDocs;
        let progress = 0;

        const intervalId = setInterval(() => {
            progress += 10;

            if (progress <= 50) {
                updateDocs((prev) => ({
                    ...prev,
                    [name]: { ...prev[name], progress, status: "uploading" },
                }));
            }

            if (isInvalid && progress >= 50) {
                clearInterval(uploadIntervals.current[name]);
                updateDocs((prev) => ({
                    ...prev,
                    [name]: { ...prev[name], progress: 50, status: "failed" },
                }));
                return;
            }

            if (!isInvalid && progress >= 100) {
                clearInterval(uploadIntervals.current[name]);
                updateDocs((prev) => ({
                    ...prev,
                    [name]: { ...prev[name], progress: 100, status: "success" },
                }));
            }

        }, 200);

        uploadIntervals.current[name] = intervalId;
    };

    const isBankDocsComplete =
        bankDocs.cancelledCheque.status === "success" &&
        bankDocs.bankStatement.status === "success";

    const isTaxDocsComplete =
        taxDocs.itrReport.status === "success"; // Only IT Return is mandatory

const handleSubmit = () => {
  if (isTaxDocsComplete) {
    // ✅ Prepare and store Bank Documents in Redux
    const uploadedBankDocs = {};
    Object.entries(bankDocs).forEach(([key, doc]) => {
      if (doc.file) {
        uploadedBankDocs[key] = {
          name: doc.file.name,
          size: doc.file.size,
          type: doc.file.type,
        };
      }
    });
    dispatch(setBankDetails(uploadedBankDocs));

    // ✅ Prepare and store Tax Documents in Redux
    const uploadedTaxDocs = {};
    Object.entries(taxDocs).forEach(([key, doc]) => {
      if (doc.file) {
        uploadedTaxDocs[key] = {
          name: doc.file.name,
          size: doc.file.size,
          type: doc.file.type,
        };
      }
    });
    dispatch(setTaxDocuments(uploadedTaxDocs));

    // ✅ Move to next step
    dispatch(setCurrentStep(6));
    navigate("/vendor-register/agreements");
  }
};


    const renderUploader = (label, id, docs, setDocs, section) => {
        const doc = docs[id];
        return (
            <div className="w-full sm:w-[300px] mb-6">
                <label className="block font-semibold text-[#232832] mb-2">{label}</label>
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
                                onChange={(e) => handleFileChange(e, section, id)}
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
                                    setDocs((prev) => ({
                                        ...prev,
                                        [id]: { file: null, progress: 0, status: "idle" },
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
                                        setDocs((prev) => ({
                                            ...prev,
                                            [id]: { file: null, progress: 0, status: "idle" },
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
                <h1 className="text-4xl font-bold text-[#232832] mb-10">Bank & Tax Documents</h1>

                {!showTaxSection ? (
                    <>
                        <h2 className="text-2xl font-semibold mb-6">Bank Details</h2>
                        <div className="flex flex-col sm:flex-row gap-6 mb-6">
                            {renderUploader("Cancelled Cheque", "cancelledCheque", bankDocs, setBankDocs, "bank")}
                            {renderUploader("Bank Passbook or Statement (with IFSC, account holder name, account number)", "bankStatement", bankDocs, setBankDocs, "bank")}
                        </div>
                        <button
                            disabled={!isBankDocsComplete}
                            onClick={() => setShowTaxSection(true)}
                            className={`px-10 py-2 rounded-3xl text-white transition ${isBankDocsComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"}`}
                        >
                            Next: Tax / Financial Records
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold mb-6">Tax / Financial Records</h2>
                        <div className="flex flex-col sm:flex-row gap-6 mb-6">
                            {renderUploader("Latest IT Return (1 year)", "itrReport", taxDocs, setTaxDocs, "tax")}
                            {renderUploader("P&L Statement or Balance Sheet (Optional for Small Vendors)", "plOrBalanceSheet", taxDocs, setTaxDocs, "tax")}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!isTaxDocsComplete}
                            className={`px-12 py-2 rounded-3xl text-white transition ${isTaxDocsComplete ? "bg-[#5737B4] hover:bg-[#432a91]" : "bg-[#D8D8D8] cursor-not-allowed"}`}
                        >
                            Save & Continue
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
