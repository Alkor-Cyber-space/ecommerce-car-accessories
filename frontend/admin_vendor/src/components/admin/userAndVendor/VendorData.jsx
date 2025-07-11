import React, { useState } from 'react';

const initialVendors = [
  {
    id: 1,
    name: 'AutoParts Inc.',
    email: 'autoparts@example.com',
    phone: '+91 9876543210',
    businessName: 'AutoParts India Pvt Ltd',
    location: 'Delhi',
    kycDocument: 'aadhaar_autoparts.pdf',
    status: 'Approved',
    joined: '2024-09-10',
  },
  {
    id: 2,
    name: 'SpeedMotors',
    email: 'speed@example.com',
    phone: '+91 9999888877',
    businessName: 'Speed Motors LLP',
    location: 'Mumbai',
    kycDocument: 'pan_speedmotors.pdf',
    status: 'Pending',
    joined: '2025-01-05',
  },
];

export default function VendorDataTable() {
  const [vendors, setVendors] = useState(initialVendors);

  const handleStatusChange = (id, newStatus) => {
    const updated = vendors.map(vendor =>
      vendor.id === id ? { ...vendor, status: newStatus } : vendor
    );
    setVendors(updated);
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vendors Overview</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Vendor Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Business Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">KYC Document</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined On</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr key={vendor.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{index + 1}</td>
                <td className="px-4 py-3">{vendor.name}</td>
                <td className="px-4 py-3">{vendor.email}</td>
                <td className="px-4 py-3">{vendor.phone}</td>
                <td className="px-4 py-3">{vendor.businessName}</td>
                <td className="px-4 py-3">{vendor.location}</td>
                <td className="px-4 py-3 text-blue-600 underline cursor-pointer">
                  <a href="#" onClick={() => alert('Preview or download KYC')}>
                    {vendor.kycDocument}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded border focus:outline-none ${
                      vendor.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : vendor.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-4 py-3">{vendor.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
