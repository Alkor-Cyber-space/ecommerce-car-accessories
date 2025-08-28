import React, { useState, useEffect } from 'react';
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    const fetchVendorList = async () => {
      try {
        const data = await getVendorList();
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
      case 'Approved': return 'bg-green-100 text-green-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      case 'Pending': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };

  const handleActionClick = (vendorId) => {
    setActiveDropdown(activeDropdown === vendorId ? null : vendorId);
  };

  const handleAction = (action, vendor) => {
    if (action === 'View') {
      localStorage.setItem("selected_vendor", JSON.stringify(vendor));
    }
    if (action === 'Edit') {
      setSelectedVendor(vendor);
      setIsModalOpen(true);
    }
    console.log(`${action} vendor with ID: ${vendor.id}`);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  // Save edited vendor
  const handleSave = () => {
    setVendors(prev =>
      prev.map(v => (v.id === selectedVendor.id ? selectedVendor : v))
    );
    setIsModalOpen(false);
  };

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
      <div className="bg-white rounded-xl w-full sm:w-sm md:w-lg  lg:w-[20%] flex flex-col sm:flex-row items-center justify-between px-4 py-4">
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-0">Total User :</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-black">{vendors.length}</h1>
      </div>

      {/* New Vendor Request Banner */}
      {/* New Vendor Request Banner */}
      {vendors.length > 0 && (
        <div className="border-2 border-green-600 bg-green-50 hover:bg-green-100 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out mb-4 w-full max-w-md">
          <h2 className="font-semibold text-gray-800 text-lg sm:text-xl">New vendor request</h2>
          <p className="text-sm mt-2 text-gray-600 rounded-lg bg-green-100/50">
            New vendor request received. Click here to review and approve.
          </p>
          <div className="mt-2 flex justify-end">
            <Link
              to={`/admin/user-details/${vendors[0].id}`}
              onClick={() => localStorage.setItem("selected_vendor", JSON.stringify(vendors[0]))}
              className="px-4 py-1 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200"
            >
              View
            </Link>
          </div>
        </div>
      )}


      {/* Filters */}
      <SearchFilter />

      {/* Unified Responsive Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm  scrollbar-none">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-4 text-left">User ID</th>
              <th className="py-3 px-4 text-left">Vendor Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Joined</th>
              <th className="py-3 px-4 text-left">Products</th>
              <th className="py-3 px-4 text-left">Orders</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor, index) => (
              <tr key={`${vendor.id}-${index}`} className=" hover:bg-gray-50 text-gray-800">
                <td className="py-3 px-4">{vendor.id}</td>
                <td className="py-3 px-4 font-semibold text-[#5737B4]">
                  <Link to={`/admin/vendor-details/${vendor.id}`}
                    onClick={() => localStorage.setItem("selected_vendor", JSON.stringify(vendor))}
                  >
                    {vendor.username}
                  </Link>
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
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(vendor.id + index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {activeDropdown === vendor.id + index && (
                    <div className="flex absolute right-13 mt-2 w-50 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <Link
                        to={`/admin/vendor-details/${vendor.id}`}
                        onClick={() => handleAction('View', vendor)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleAction('Edit', vendor)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('Suspend', vendor)}
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

      {/* No Results */}
      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">No vendors found matching your criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedVendor && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">Edit Vendor</h2>

            <div className="space-y-4">
              <input
                type="text"
                value={selectedVendor.username}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, username: e.target.value })}
                placeholder="Vendor Name"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="email"
                value={selectedVendor.email}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                placeholder="Email"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="text"
                value={selectedVendor.contact_number || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, contact_number: e.target.value })}
                placeholder="Phone"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="text"
                value={selectedVendor.location || ''}
                onChange={(e) => setSelectedVendor({ ...selectedVendor, location: e.target.value })}
                placeholder="Location"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md border text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-[#5737B4] text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
