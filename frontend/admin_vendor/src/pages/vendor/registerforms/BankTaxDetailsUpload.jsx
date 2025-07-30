import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SlCloudUpload } from "react-icons/sl";
import { RiDeleteBinLine } from "react-icons/ri";
import {
    setCurrentStep,
    setBankDetails,
    setTaxDocuments,
} from "../../../store/vendorRegisterSlice";
import { uploadBankAndTaxDocsApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

export default function BankAndTaxDetails() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showTaxSection, setShowTaxSection] = useState(false);

    const [bankDocs, setBankDocs] = useState({
        cancelled_cheque: { file: null, progress: 0, status: "idle" },
        bank_statement: { file: null, progress: 0, status: "idle" },
    });

    const [taxDocs, setTaxDocs] = useState({
        it_return: { file: null, progress: 0, status: "idle" },
        financial_statement: { file: null, progress: 0, status: "idle" },
    });

    const uploadIntervals = useRef({});

    // ✅ RESTORE FROM LOCALSTORAGE ON LOAD
    useEffect(() => {
        const restoreDocs = (key, fields, setDocs) => {
            const saved = localStorage.getItem(key);
            if (!saved) return;

            const parsed = JSON.parse(saved);
            const isValid = (f) => f && typeof f === "object" && f.name;

            const restored = {};
            Object.keys(fields).forEach((field) => {
                restored[field] = isValid(parsed[field])
                    ? { file: parsed[field], progress: 100, status: "success" }
                    : { file: null, progress: 0, status: "idle" };
            });

            setDocs(restored);
            console.log(`✅ Restored ${key} from localStorage`, restored);
        };

        restoreDocs("vendorBankDocuments", bankDocs, setBankDocs);
        restoreDocs("vendorTaxDocuments", taxDocs, setTaxDocs);
    }, []);

    const handleFileChange = (eOrFile, section, name) => {
        const file = eOrFile?.target?.files?.[0] || eOrFile;
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
        bankDocs.cancelled_cheque.status === "success" &&
        bankDocs.bank_statement.status === "success";

    const isTaxDocsComplete = taxDocs.it_return.status === "success";

    const handleSubmit = async () => {
        if (isTaxDocsComplete) {
            const uploadedBankDocs = {};
            const uploadedTaxDocs = {};

            Object.entries(bankDocs).forEach(([key, doc]) => {
                if (doc.file) {
                    uploadedBankDocs[key] = {
                        name: doc.file.name,
                        size: doc.file.size,
                        type: doc.file.type,
                    };
                }
            });

            Object.entries(taxDocs).forEach(([key, doc]) => {
                if (doc.file) {
                    uploadedTaxDocs[key] = {
                        name: doc.file.name,
                        size: doc.file.size,
                        type: doc.file.type,
                    };
                }
            });

            // 👉 Make your API call here before dispatching
            try {
                const vendorId = localStorage.getItem("vendorId");

                const formData = new FormData();
                for (const key in uploadedBankDocs) {
                    formData.append(key, bankDocs[key].file); 
                }
                for (const key in uploadedTaxDocs) {
                    formData.append(key, taxDocs[key].file); 
                }
                const response = await uploadBankAndTaxDocsApi(vendorId, formData);
                console.log(response.data);


                if (response.status === 200) {
                    dispatch(setBankDetails(uploadedBankDocs));
                    localStorage.setItem("vendorBankDocuments", JSON.stringify(uploadedBankDocs));
                    console.log(" Bank Documents saved:", uploadedBankDocs);

                    dispatch(setTaxDocuments(uploadedTaxDocs));
                    localStorage.setItem("vendorTaxDocuments", JSON.stringify(uploadedTaxDocs));
                    console.log("Tax Documents saved:", uploadedTaxDocs);

                    // ✅ Move to next step
                    dispatch(setCurrentStep(5));
                    navigate("/vendor-register/agreements");
                } else {
                    console.error("❌ Upload failed with status:", response.status);
                    toast.error("Failed to upload documents. Try again.");
                }
            } catch (error) {
                console.error("❌ API error:", error);
                toast.error("Server error. Please try again later.", error);
            }
        }
    };

    const renderUploader = (label, id, docs, setDocs, section) => {
        const doc = docs[id];
        return (
            <div className="flex-1 min-w-[250px] max-w-[400px]">
                <label className="block font-semibold text-[#232832] mb-3">{label}</label>
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileChange(file, section, id);
                    }}
                    className={`relative w-full h-45 border-2 rounded-lg flex flex-col justify-center items-center text-center bg-white transition
    ${doc.status === "uploading"
                            ? "border-green-500 bg-green-50 border-dashed border-2"
                            : doc.status === "failed"
                                ? "border-red-300 bg-[#FAEAE5]"
                                : "border-dashed border-gray-500 border-2"}`}
                >
                    {!doc.file ? (
                        <label className="cursor-pointer flex flex-col items-center justify-center">
                            <SlCloudUpload className="text-4xl mb-2" />
                            <span className="text-sm text-gray-500">Drag and drop here</span>
                            <span className="text-sm text-[#5737B4] font-semibold">Browse Files</span>
                            <input
                                type="file"
                                accept=".pdf,.jpeg"
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
                                    <p className="text-xs text-gray-500">
                                        {(doc.file.size / 1024).toFixed(0)}kb
                                    </p>
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
                {!showTaxSection ? (
                    <>
                        <h1 className="text-5xl font-bold text-[#232832] mb-10">Bank & Tax Details</h1>

                        <div className="flex flex-col sm:flex-row gap-10">
                            <div className="mt-18 text-xl w-full max-w-[300px] ">
                                {renderUploader(
                                    "Upload Cancelled Cheque",
                                    "cancelled_cheque",
                                    bankDocs,
                                    setBankDocs,
                                    "bank"
                                )}
                            </div>
                            <div className="mt-4 text-lg w-full max-w-[350px]">
                                {renderUploader(
                                    "Bank Passbook or Statement (with IFSC, account holder name, account number)",
                                    "bank_statement",
                                    bankDocs,
                                    setBankDocs,
                                    "bank"
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-10">
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(setCurrentStep(6));
                                    navigate("/vendor-register/agreements");
                                }}
                                className="w-[280px] py-2 text-[#5737B4] border border-[#5737B4] font-medium rounded-full hover:bg-[#f4f4f4] transition-all"
                            >
                                Skip for Now
                            </button>

                            <button
                                disabled={!isBankDocsComplete}
                                onClick={() => setShowTaxSection(true)}
                                className={`w-[280px] py-2 text-white font-medium rounded-full transition-all ${isBankDocsComplete
                                        ? "bg-[#5737B4] hover:bg-[#432a91]"
                                        : "bg-[#D8D8D8] cursor-not-allowed"
                                    }`}
                            >
                                Next: Tax / Financial Records
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-5xl font-bold text-[#232832] mb-10">
                            Tax / Financial Documents
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-10">
                            <div className="mt-10 text-xl w-full max-w-[300px]">
                                {renderUploader(
                                    "Latest IT Return (1 year)",
                                    "it_return",
                                    taxDocs,
                                    setTaxDocs,
                                    "tax"
                                )}
                            </div>
                            <div className="mt-4 text-lg w-full max-w-[300px]">
                                {renderUploader(
                                    "P&L Statement or Balance Sheet (Optional for Small Vendors)",
                                    "financial_statement",
                                    taxDocs,
                                    setTaxDocs,
                                    "tax"
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(setCurrentStep(6));
                                    navigate("/login");
                                }}
                                className="w-[280px] py-2 text-[#5737B4] border border-[#5737B4] font-medium rounded-full hover:bg-[#f4f4f4] transition-all"
                            >
                                Skip for Now
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isTaxDocsComplete}
                                className={`w-[280px] py-2 rounded-full text-white font-medium transition-all ${isTaxDocsComplete
                                        ? "bg-[#5737B4] hover:bg-[#432a91]"
                                        : "bg-[#D8D8D8] cursor-not-allowed"
                                    }`}
                            >
                                Save & Continue
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
