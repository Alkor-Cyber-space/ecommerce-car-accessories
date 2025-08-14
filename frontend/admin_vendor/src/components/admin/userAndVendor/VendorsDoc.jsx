import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FinalApproveVendorApi, getVendorProfileDocumentsApi } from "../../../services/allAPI";
import { format } from "date-fns";
import { ApproveorRejectApi } from "../../../services/allAPI";
import { toast } from "react-toastify";
import { BsEye } from "react-icons/bs";

const getStatusStyle = (status) => {
  const normalized = status === "approved" ? "verified" : status;
  if (normalized === "verified") return " bg-green-100 border border-green-200 rounded-md px-3 py-1 text-green-500";
  if (normalized === "pending") return " bg-red-100 border border-red-200 rounded-md px-3 py-1 text-red-500";
  if (normalized === "rejected") return " bg-red-100 border border-red-200 rounded-md px-3 py-1 text-red-500";
  return "text-red-500";
};


const getStatusLabel = (status) => {
  const normalized = status === "approved" ? "verified" : status;
  if (normalized === "verified") return "• Verified";
  if (normalized === "pending") return "• Pending";
  if (normalized === "rejected") return "• Rejected";
  return "✗ Unknown";
};

const VendorsDoc = () => {
  const [documents, setDocuments] = useState({});
  const { id } = useParams();
  const server_url = "http://localhost:8000";

  useEffect(() => {
    const fetchVendorDocuments = async () => {
      try {
        const data = await getVendorProfileDocumentsApi(id);
        console.log("Vendor Documents:", data);
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching vendor documents:", error);
      }
    };

    if (id) {
      fetchVendorDocuments();
    }
  }, [id]);
  const documentSchema = [
    {
      section: "KYC Uploads",
      items: [
        { label: "PAN Card", key: "pan_card" },
        { label: "Passport/ Aadhaar/ License", key: "aadhar_passport_dl" },
      ],
    },
    {
      section: "Business Documents",
      items: [
        { label: "GSTIN Certificate", key: "gst_certificate" },
        { label: "Business Registration", key: "business_registration_cert" },
        { label: "Shop Establishment License", key: "shop_license" },
      ],
    },
    {
      section: "Bank and Tax Details",
      items: [
        { label: "Cancelled Cheque", key: "cancelled_cheque" },
        { label: "Bank Passbook / Statement", key: "bank_statement" },
      ],
    },
    {
      section: "Tax Financial Records",
      items: [
        { label: "IT Return", key: "it_return" },
        { label: "P&L Statement/ Balance Sheet", key: "financial_statement" },
      ],
    },
    {
      section: "Agreement and Supporting Documents",
      items: [
        { label: "Filled Vendor Registration Form", key: "vendor_registration_form" },
        { label: "Signed NPA/Supply Agreement/ Terms and Condition", key: "signed_terms_and_con" },
        { label: "Authorization Letter/ Dealership Certificate", key: "dealership_letter" },
        { label: "Authorized Signatory Letter", key: "authorized_signatory_letter" },
      ],
    },
  ];
  const [previewFile, setPreviewFile] = useState(null);

  const handleAction = async (documentKey, action) => {
    try {
      const res = await ApproveorRejectApi(id, documentKey + "_status", action);
      console.log(`${action} success`, res);
      toast.success(`Successfully ${action === "approved" ? "approved" : "rejected"} ${documentKey.replaceAll("_", " ")}`);
      setDocuments((prev) => ({
        ...prev,
        [documentKey + "_status"]: action,
      }));
    } catch (error) {
      console.error(`Failed to ${action} ${documentKey}:`, error);
      toast.error(`Failed to ${action} ${documentKey.replaceAll("_", " ")}`);
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleFinalApprove = async () => {
    if (documents?.profile_status === "approved") {
      toast.warning("Vendor is already approved.");
      setShowConfirmModal(false);
      return;
    }

    try {
      const res = await FinalApproveVendorApi(id, "approved");
      console.log("Final approval success", res);
      toast.success("Vendor successfully approved");
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error(error.response?.data?.error || "Approval failed");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleRejectVendor = async () => {
    if (documents?.profile_status === "approved") {
      toast.warning("Vendor is already approved and cannot be rejected.");
      return;
    }

    try {
      const res = await FinalApproveVendorApi(id, "rejected");
      console.log("Vendor rejected", res);
      toast.success("Vendor successfully rejected");
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error(error.response?.data?.error || "Rejection failed");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const confirmAction = () => {
    if (actionType === "approve") {
      handleFinalApprove();
    } else if (actionType === "reject") {
      handleRejectVendor();
    }
  };
  return (
    <div>
      <div className="bg-gray-100 min-h-screen px-6 py-10">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2"><Link to="/admin/user-details">{`Vendor ${id}`} <span className="text-black">/ View Documents</span></Link></h2>
            <p className="mb-6 text-sm text-gray-600">Manage vendor business documents.</p>
          </div>

          <div className="flex gap-3">
            {documents?.profile_status === "pending" ? (
              <>
                <div>
                  <button
                    onClick={() => {
                      setActionType("approve");
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
                  >
                    Approve Vendor
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setActionType("reject");
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-[#d60707] text-white font-medium shadow hover:bg-red-700 transition"
                  >
                    Reject Vendor
                  </button>
                </div>
              </>
            ) : (
              <div
                className={` rounded-lg text-xl font-medium  ${documents?.profile_status === "approved"
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                Vendor {documents?.profile_status}
              </div>
            )}
          </div>

          {showConfirmModal && (
            <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
                <h2 className="text-lg font-semibold mb-3">
                  Confirm {actionType === "approve" ? "Approval" : "Rejection"}
                </h2>
                <p className="mb-5">
                  Are you sure you want to{" "}
                  <span className={actionType === "approve" ? "text-green-600" : "text-red-600"}>
                    {actionType}
                  </span>{" "}
                  this vendor?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    className={`px-4 py-2 rounded-lg text-white font-medium shadow ${actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                      }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        {documentSchema.map((section, index) => (
          <div key={index} className="mt-10">
            <h2 className="font-semibold text-lg mb-3">{section.section}</h2>
            <div className="space-y-4">
              {section.items.map((item, idx) => {
                const file = documents[item.key];
                const status = documents[`${item.key}_status`];
                const fileUrl = `${server_url}${file}`;

                if (!file) return null;
                return (
                  <div key={idx}>
                    {/* ---- Document row ---- */}
                    <div className="flex justify-between items-center bg-white p-5 rounded shadow sm:gap-5">
                      <p className={`${getStatusStyle(status)} font-medium`}>
                        {getStatusLabel(status)}
                      </p>
                      <p className="font-medium w-35 left-0">{item.label}</p>

                      <a
                        href={fileUrl}
                        className="text-blue-600 text-sm underline cursor-pointer w-35"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {item.label.replace(/\s+/g, " ")}
                      </a>

                      {documents?.submitted_at && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium text-gray-900">Uploaded At:</span>{" "}
                          {format(new Date(documents.submitted_at), "dd MMMM yyyy, 'Time:' h:mm a")}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAction(item.key, "approved")}
                          className="bg-[#5737B4] text-white text-sm px-4 py-1 rounded hover:bg-indigo-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(item.key, "rejected")}
                          className="bg-[#d60707] text-white text-sm px-4 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>

                      <div className="flex gap-5">
                        <div
                          onClick={() => setPreviewFile((prev) => (prev === fileUrl ? null : fileUrl))}
                          className="cursor-pointer"
                        >
                          <BsEye size={22} />
                        </div>
                      </div>
                    </div>

                    {/* ---- Inline Preview ---- */}
                    {previewFile && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 w-[90%] max-w-4xl h-[80%] overflow-auto relative">
                          <button
                            className="absolute top-2 right-4 text-gray-500 hover:text-black text-2xl"
                            onClick={() => setPreviewFile(null)}
                          >
                            &times;
                          </button>

                          {previewFile?.endsWith(".pdf") ? (
                            <iframe
                              src={previewFile}
                              title="Document Preview"
                              className="w-full h-[600px] rounded-b-lg"
                              sandbox="allow-same-origin allow-scripts"
                            />
                          ) : previewFile ? (
                            <img
                              src={previewFile}
                              alt="Document Preview"
                              className="max-w-full max-h-[600px] mx-auto"
                            />
                          ) : null}

                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
      <div className="flex items-center  justify-between mt-3">
        <div>
          <Link to="/admin/user-details">
            <button className="border border-[#5737B4] text-[#5737B4] px-16 py-1 rounded hover:bg-gray-100">
              Cancel
            </button>
          </Link>
        </div>
        <div >
          {/* <button className="bg-[#5737B4] text-white px-16 py-1 rounded hover:bg-[#5737B4]">
            Save
          </button> */}
        </div>
      </div>
    </div>

  );
};

export default VendorsDoc;
