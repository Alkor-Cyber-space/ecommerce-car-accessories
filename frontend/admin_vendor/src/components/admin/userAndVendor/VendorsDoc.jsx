import React from "react";
import { FaEye } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";


const documents = [
  {
    section: "KYC Uploads",
    items: [
      { status: "verified",actionButton: "Approve Document", title: "PAN Card", file: "PANfile.pdf" },
      { status: "verified",actionButton: "Approve Document", title: "Passport/ Aadhaar/ License", file: "PANfile.pdf" },
    ],
  },
  {
    section: "Business Documents",
    items: [
      {
        status: "pending",
        title: "GSTIN Certificate",
        file: "GSTNCertificatepdf",
        actionButton: "Approve Document",
      },
      { status: "verified",actionButton: "Approve Document",  title: "Business Registration", file: "PANfile.pdf" },
      { status: "verified",actionButton: "Approve Document", title: "Shop Establishment License", file: "PANfile.pdf" },
    ],
  },
  {
    section: "Bank and Tax Details",
    items: [
      { status: "verified",actionButton: "Approve Document", title: "Cancelled Cheque", file: "GSTNCertificatepdf" },
      { status: "verified",actionButton: "Approve Document", title: "Bank Passbook / Statement", file: "PANfile.pdf" },
    ],
  },
  {
    section: "Tax Financial Records",
    items: [
      { status: "verified",actionButton: "Approve Document", title: "IT Return", file: "GSTNCertificatepdf" },
      { status: "verified",actionButton: "Approve Document", title: "P&L Statement/ Balance Sheet", file: "PANfile.pdf" },
    ],
  },
  {
    section: "Agreement and Supporting Documents",
    items: [
      { status: "verified",actionButton: "Approve Document", title: "Filled Vendor Registration Form", file: "GSTNCertificatepdf" },
      { status: "verified",actionButton: "Approve Document", title: "Signed NPA/Supply Agreement/ Terms and Condition", file: "PANfile.pdf" },
      { status: "verified",actionButton: "Approve Document", title: "Authorization Letter/ Dealership Certificate", file: "PANfile.pdf" },
      { status: "verified",actionButton: "Approve Document", title: "Authorized Signatory Letter", file: "PANfile.pdf" },
    ],
  },
];

const getStatusStyle = (status) => {
  if (status === "verified") return " bg-green-100 border border-green-200 rounded-md px-3 py-1 text-green-500";
  if (status === "pending") return " bg-red-100 border border-red-200 rounded-md px-3 py-1 text-red-500";
  return "text-red-500";
};

const getStatusLabel = (status) => {
  if (status === "verified") return "• Verified";
  if (status === "pending") return "• Pending";
  return "✗ Rejected";
};

const VendorsDoc = () => {
  return (
    <div>
      <div className="bg-gray-100 min-h-screen px-6 py-10">
        <h2 className="text-xl font-semibold text-indigo-700 mb-2"><Link to="/admin/user-details">Vendors 1 </Link>  <span className="text-black">/ View Documents</span> </h2>
        <p className="mb-6 text-sm text-gray-600">Manage vendor business documents.</p>

        {documents.map((section, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-md font-semibold text-gray-800 mb-3">{section.section}</h3>
            <div className="space-y-4">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-md shadow-sm p-4 flex flex-wrap justify-between items-center gap-4"
                >
                  <p className={`font-medium ${getStatusStyle(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </p>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <a className="underline text-sm text-blue-600 cursor-pointer">{item.file}</a>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Uploaded At :</span> 20 May 2025, Time : 3:30 PM
                  </p>
                  {item.actionButton && (
                    <button className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700">
                      {item.actionButton}
                    </button>
                  )}
                  <div className="flex gap-3">
                    <FaEye className="text-gray-600 cursor-pointer" size={18} />
                    <RiDeleteBinLine className="text-gray-600 cursor-pointer" size={18} />
                  </div>
                </div>
              ))}
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
          <button className="bg-[#5737B4] text-white px-16 py-1 rounded hover:bg-[#5737B4]">
            Save
          </button>
        </div>
      </div>
    </div>

  );
};

export default VendorsDoc;
