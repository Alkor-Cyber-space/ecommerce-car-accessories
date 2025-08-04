import React, { useState, useEffect } from 'react';
import { BsSearch } from "react-icons/bs";
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from '../../../pages/admin/SearchFilter';
import { Link } from 'react-router-dom';

const initialVendors = [
  {
    id: 234430,
    name: 'Vendor 1',
    email: 'autoparts@example.com',
    phone: '+91 9876543210',
    location: 'London',
    status: 'Approved',
    joined: '2024-09-10',
    lastActive: '23/12/2024 10am',
    totalProducts: 8,
    totalOrders: 54
  },
  {
    id: 234431,
    name: 'Vendor 1',
    email: 'speed@example.com',
    phone: '+91 9999888877',
    location: 'Mumbai',
    status: 'Pending',
    joined: '2025-01-05',
    lastActive: '23/12/2024 10am',
    totalProducts: 12,
    totalOrders: 12
  },
  {
    id: 234432,
    name: 'Vendor 1',
    email: 'autoparts@example.com',
    phone: '+91 9876543210',
    location: 'Delhi',
    status: 'Pending',
    joined: '2024-09-10',
    lastActive: '23/12/2024 10am',
    totalProducts: 16,
    totalOrders: 16
  },
  {
    id: 234433,
    name: 'Vendor 1',
    email: 'speed@example.com',
    phone: '+91 9999888877',
    location: 'India',
    status: 'Rejected',
    joined: '2025-01-05',
    lastActive: '23/12/2024 10am',
    totalProducts: 4,
    totalOrders: 4
  },
  {
    id: 234434,
    name: 'Vendor 1',
    email: 'autoparts@example.com',
    phone: '+91 9876543210',
    location: 'Japan',
    status: 'Rejected',
    joined: '2024-09-10',
    lastActive: '23/12/2024 10am',
    totalProducts: 5,
    totalOrders: 5
  },
  {
    id: 234435,
    name: 'Vendor 1',
    email: 'speed@example.com',
    phone: '+91 9999888877',
    location: 'Gujarat',
    status: 'Approved',
    joined: '2025-01-05',
    lastActive: '23/12/2024 10am',
    totalProducts: 6,
    totalOrders: 6
  },
  {
    id: 234436,
    name: 'Vendor 1',
    email: 'autoparts@example.com',
    phone: '+91 9876543210',
    location: 'China',
    status: 'Rejected',
    joined: '2024-09-10',
    lastActive: '23/12/2024 10am',
    totalProducts: 7,
    totalOrders: 7
  },
  {
    id: 234437,
    name: 'Vendor 1',
    email: 'speed@example.com',
    phone: '+91 9999888877',
    location: 'German',
    status: 'Rejected',
    joined: '2025-01-05',
    lastActive: '23/12/2024 10am',
    totalProducts: 9,
    totalOrders: 9
  }
];

export default function VendorDataTable() {
  const [vendors, setVendors] = useState(initialVendors);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    const updated = vendors.map(vendor =>
      vendor.id === id ? { ...vendor, status: newStatus } : vendor
    );
    setVendors(updated);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = search === '' ||
      vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.email.toLowerCase().includes(search.toLowerCase()) ||
      vendor.id.toLowerCase().includes(search.toLowerCase());

    return (
      matchesSearch &&
      (statusFilter ? vendor.status === statusFilter : true) &&
      (locationFilter ? vendor.location === locationFilter : true)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-600';
      case 'Rejected':
        return 'bg-red-100 text-red-600';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleActionClick = (vendorId) => {
    setActiveDropdown(activeDropdown === vendorId ? null : vendorId);
  };

  const handleAction = (action, vendorId) => {
    console.log(`${action} vendor with ID: ${vendorId}`);
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <div className='flex justify-between items-center'>
        <h1 className="text-[#232832] text-xl font-bold">Vendors Overview</h1>
        <button className='bg-[#5737B4] text-white p-2 rounded-md md:sm'>Download Report</button>
      </div>


      <div className="bg-white rounded-xl w-full md:w-[28%] flex flex-col md:flex-row items-center justify-between px-4 py-4">
        <p className="text-base md:text-lg text-gray-700">Total User :</p>
        <h1 className="text-3xl font-semibold text-black mr-5 md:mr-2">256</h1>
      </div>

      <SearchFilter />

      <div className="overflow-x-auto scrollbar-none">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600 ">
            <tr>
              <th className="py-4 text-left px-4 font-medium">User ID</th>
              <th className="py-4 text-left px-4 font-medium">Vendor Name</th>
              <th className="py-4 text-left px-4 font-medium">Email</th>
              <th className="py-4 text-left px-4 font-medium">Phone</th>
              <th className="py-4 text-left px-4 font-medium">Location</th>
              <th className="py-4 text-left px-4 font-medium">Status</th>
              <th className="py-4 text-left px-4 font-medium">Joined On</th>
              <th className="py-4 text-left px-4 font-medium">Total Products</th>
              <th className="py-4 text-left px-4 font-medium">Total Orders</th>
              <th className="py-4 text-left px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor, index) => (
              <tr key={`${vendor.id}-${index}`} className="text-left hover:bg-gray-50  border-gray-100">
                <td className="py-3 px-4 font-medium text-black">{vendor.id}</td>
                <td className="py-3 px-4 text-[#5737B4]/100 font-medium"><Link to='/admin/user-details'>{vendor.name}</Link></td>
                <td className="py-3 px-4">{vendor.email}</td>
                <td className="py-3 px-4">{vendor.phone}</td>
                <td className="py-3 px-4">{vendor.location}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="py-3 px-4">{vendor.joined}</td>
                <td className="py-3 px-4 font-medium">{vendor.totalProducts}</td>
                <td className="py-3 px-4 font-medium">{vendor.totalOrders}</td>
                <td className="py-3 px-4 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(vendor.id + index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {activeDropdown === vendor.id + index && (
                    <div className="absolute right-0 top-8 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleAction('View', vendor.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        <Link to='/admin/user-details'>View</Link>
                      </button>
                      <button
                        onClick={() => handleAction('Edit', vendor.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('Suspend', vendor.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                      >
                        Suspend
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



