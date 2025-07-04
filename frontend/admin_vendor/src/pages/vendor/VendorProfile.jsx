import React from "react";
import { FaEdit, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStore, FaIdCard, FaRegBuilding } from "react-icons/fa";

const vendor = {
  name: "AutoZone Traders",
  owner: "Rahul Verma",
  email: "vendor@autozone.com",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra, India",
  businessType: "Car Spare Parts Retailer",
  gstNumber: "27AAAPL1234C1ZV",
  registrationId: "REG-2023-0192",
  address: "123, Industrial Road, Auto Nagar, Mumbai",
  documents: {
    panCard: "/documents/pan_card.jpg",
    gstCertificate: "/documents/gst_certificate.jpg",
    shopLicense: "/documents/shop_license.jpg",
  }
};

const VendorProfile = () => {
  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendor Profile</h1>
            <p className="text-sm text-blue-100">Manage and review your business information</p>
          </div>
          <button className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md flex items-center gap-2 font-medium">
            <FaEdit /> Edit Profile
          </button>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white">
          {[
            { label: "Business Name", value: vendor.name, icon: <FaStore className="text-blue-500" /> },
            { label: "Owner", value: vendor.owner },
            { label: "Email", value: vendor.email, icon: <FaEnvelope className="text-gray-500" /> },
            { label: "Phone", value: vendor.phone, icon: <FaPhone className="text-green-600" /> },
            { label: "Location", value: vendor.location, icon: <FaMapMarkerAlt className="text-red-500" /> },
            { label: "Business Type", value: vendor.businessType },
            { label: "GST Number", value: vendor.gstNumber, icon: <FaRegBuilding className="text-indigo-600" /> },
            { label: "Registration ID", value: vendor.registrationId },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-lg shadow flex items-start gap-3">
              {item.icon && <div className="text-2xl mt-1">{item.icon}</div>}
              <div>
                <h4 className="text-sm text-gray-400">{item.label}</h4>
                <p className="text-lg font-medium text-gray-800">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="md:col-span-2">
            <div className="bg-slate-50 p-4 rounded-lg shadow">
              <h4 className="text-sm text-gray-400">Business Address</h4>
              <p className="text-lg font-medium text-gray-800">{vendor.address}</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="border-t p-6 bg-white">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">KYC Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(vendor.documents).map(([key, value]) => (
              <div key={key} className="rounded-lg overflow-hidden border shadow-sm bg-white">
                <div className="p-3 border-b bg-slate-50 text-center font-medium capitalize text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <img
                  src={value}
                  alt={key}
                  className="w-full h-40 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
