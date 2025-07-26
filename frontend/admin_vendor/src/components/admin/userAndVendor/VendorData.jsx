import React, { useState } from 'react';
import { BsSearch } from "react-icons/bs";

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
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');


  const handleStatusChange = (id, newStatus) => {
    const updated = vendors.map(vendor =>
      vendor.id === id ? { ...vendor, status: newStatus } : vendor
    );
    setVendors(updated);
  };



  const filteredVendors = vendors.filter(vendor => {
    return (
      (statusFilter ? vendor.status === statusFilter : true) &&
      (locationFilter ? vendor.location === locationFilter : true)
    );
  });

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-[#232832] text-xl font-bold">Vendors Overview</h1>

      <div className="relative w-full md:w-[50%]">
                        <BsSearch className=" absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search admins..."
                          className="bg-white px-5 py-2 rounded-3xl w-full"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 text-left px-2">#</th>
              <th className="py-4 text-left px-2">Vendor Name</th>
              <th className="py-4 text-left px-2">Email</th>
              <th className="py-4 text-left px-2">Phone</th>
              <th className="py-4 text-left px-2">Business Name</th>
              <th className="py-4 text-left px-2">Location</th>
              <th className="py-4 text-left px-2">KYC Document</th>
              <th className="py-4 text-left px-2">Status</th>
              <th className="py-4 text-left px-2">Joined On</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor, index) => (
              <tr key={vendor.id} className="text-left hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{index + 1}</td>
                <td className="py-2 px-2">{vendor.name}</td>
                <td className="py-2 px-2">{vendor.email}</td>
                <td className="py-2 px-2">{vendor.phone}</td>
                <td className="py-2 px-2">{vendor.businessName}</td>
                <td className="py-2 px-2">{vendor.location}</td>
                <td className="py-2 px-2 text-blue-600 underline cursor-pointer">
                  <a href="#" onClick={() => alert('Preview or download KYC')}>
                    {vendor.kycDocument}
                  </a>
                </td>
                <td className="py-2 px-2">
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded border focus:outline-none 
                      ${vendor.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : vendor.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'}`}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="py-2 px-2">{vendor.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
