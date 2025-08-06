import React, { useState, useEffect } from 'react';
import { BsSearch } from "react-icons/bs";
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from '../../../pages/admin/SearchFilter';
import { Link } from 'react-router-dom';
import { getVendorList } from '../../../services/allAPI';

export default function VendorDataTable() {
  const [vendors, setVendors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchVendorList = async () => {
      try {
        const data = await getVendorList();
        console.log("API Response:", data);
        setVendors(data);
      } catch (error) {
        console.error("Error fetching vendor list:", error);
      }
    };
    fetchVendorList();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updated = vendors.map(vendor =>
      vendor.id === id ? { ...vendor, status: newStatus } : vendor
    );
    setVendors(updated);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = search === '' ||
      vendor.name?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.id?.toString().includes(search);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };

  const handleActionClick = (vendorId) => {
    setActiveDropdown(activeDropdown === vendorId ? null : vendorId);
  };

  const handleAction = (action, vendorId) => {
    console.log(`${action} vendor with ID: ${vendorId}`); 
    setActiveDropdown(null);
  };

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
    <div className="bg-[#ECECF0] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 rounded-2xl w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <h1 className="text-[#232832] text-lg sm:text-xl font-bold">Vendors Overview</h1>
        <button className='bg-[#5737B4] text-white px-3 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto'>
          Download Report
        </button>
      </div>

      {/* Total Users Card */}
      <div className="bg-white rounded-xl w-full sm:w-auto lg:w-[28%] flex flex-col sm:flex-row items-center justify-between px-4 py-4">
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-0">Total User :</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-black">{vendors.length}</h1>
      </div>

      {/* Search Filter */}
      <SearchFilter />

      {/* Mobile Card View - Show on small screens */}
      <div className="block lg:hidden space-y-4">
        {filteredVendors.map((vendor, index) => (
          <div key={`${vendor.id}-${index}`} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-[#5737B4] text-base">
                  <Link to='/admin/user-details'>{vendor.username}</Link>
                </h3>
                <p className="text-sm text-gray-600">ID: {vendor.id}</p>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(vendor.id + index);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                </button>

                {activeDropdown === vendor.id + index && (
                  <div className="absolute right-0 top-10 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-right flex-1 ml-2 truncate">{vendor.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span>{vendor.contact_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span>{vendor.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                  {vendor.status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span>{formatDate(vendor.date_joined)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Products:</span>
                <span className="font-medium">{vendor.totalProducts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orders:</span>
                <span className="font-medium">{vendor.totalOrders || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Show on large screens */}
      <div className="hidden lg:block overflow-x-auto scrollbar-none">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
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
              <tr key={`${vendor.id}-${index}`} className="text-left hover:bg-gray-50 border-gray-100">
                <td className="py-3 px-4 font-medium text-black">{vendor.id}</td>
                <td className="py-3 px-4 text-[#5737B4]/100 font-medium">
                  <Link to='/admin/user-details'>{vendor.username}</Link>
                </td>
                <td className="py-3 px-4">{vendor.email}</td>
                <td className="py-3 px-4">{vendor.contact_number || 'N/A'}</td>
                <td className="py-3 px-4">{vendor.location || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                    {vendor.status || 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">{formatDate(vendor.date_joined)}</td>
                <td className="py-3 px-4 font-medium">{vendor.totalProducts || 0}</td>
                <td className="py-3 px-4 font-medium">{vendor.totalOrders || 0}</td>
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

      {/* Empty State */}
      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">No vendors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}