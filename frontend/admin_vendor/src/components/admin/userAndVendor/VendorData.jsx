import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiDownload } from "react-icons/fi";
import SearchFilter from '../../../pages/admin/SearchFilter';
import { Link } from 'react-router-dom';
import { exportReportApi, getVendorList } from '../../../services/allAPI';

export default function VendorDataTable() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const dropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    year: '',
    location: '',
    status: '',
    regDateFrom: '',
    regDateTo: '',
  });

  const handleDownloadReport = async (format) => {
    try {
      const tableData = filteredVendors.map((vendor) => ({
        id: vendor.id,
        username: vendor.username,
        email: vendor.email,
        contact_number: vendor.contact_number || "N/A",
        location: vendor.location || "N/A",
        status: vendor.status || "Pending",
        date_joined: formatDate(vendor.date_joined),
        totalProducts: vendor.totalProducts || 0,
        totalOrders: vendor.totalOrders || 0,
      }));

      const response = await exportReportApi(
        "vendors_overview",
        format,
        tableData
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `vendors_overview.${format === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleReset = () => {
    setFilters({
      year: '',
      location: '',
      status: '',
      regDateFrom: '',
      regDateTo: '',
    });
    setFilteredVendors(vendors);
  };

  const handleSearch = () => {
    const filtered = vendors.filter(vendor => {
      const matchesYear = filters.year
        ? new Date(vendor.date_joined).getFullYear().toString() === filters.year
        : true;

      const matchesLocation = filters.location
        ? vendor.location?.toLowerCase().includes(filters.location.toLowerCase())
        : true;

      const matchesStatus = filters.status
        ? vendor.status === filters.status
        : true;

      const matchesRegDateFrom = filters.regDateFrom
        ? new Date(vendor.date_joined) >= new Date(filters.regDateFrom)
        : true;

      const matchesRegDateTo = filters.regDateTo
        ? new Date(vendor.date_joined) <= new Date(filters.regDateTo)
        : true;

      return matchesYear && matchesLocation && matchesStatus && matchesRegDateFrom && matchesRegDateTo;
    });

    setFilteredVendors(filtered);
  };

  useEffect(() => {
    const fetchVendorList = async () => {
      try {
        const data = await getVendorList();
        setVendors(data);
        setFilteredVendors(data);
      } catch (error) {
        console.error("Error fetching vendor list:", error);
      }
    };
    fetchVendorList();
  }, []);

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
    console.log(`${action} vendor with ID: ${vendor.id}`);
    setActiveDropdown(null);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
      setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#ECECF0] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 rounded-2xl w-full space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-[#232832] text-lg sm:text-xl font-bold">Vendors Overview</h1>

        {/* Download Report Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="bg-[#5737B4] text-white px-3 py-2 rounded-md text-sm sm:text-base flex items-center gap-2"
          >
            Download Report
            {/* <FiDownload className="text-white text-lg" /> */}
          </button>

          {showDownloadOptions && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleDownloadReport("pdf")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Download as PDF
              </button>
              <button
                onClick={() => handleDownloadReport("excel")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Download as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Total Users Card */}
      <div className="bg-white rounded-xl w-full sm:w-sm md:w-lg lg:w-[20%] flex flex-col sm:flex-row items-center justify-between px-4 py-4">
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-0">Total User :</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-black">{vendors.length}</h1>
      </div>

      {/* New Vendor Request Banner */}
      <div className="border-2 border-green-600 bg-green-50 hover:bg-green-100 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out mb-4 w-full max-w-md">
        <h2 className="font-semibold text-gray-800 text-lg sm:text-xl">New vendor request</h2>
        <p className="text-sm mt-2 text-gray-600 rounded-lg bg-green-100/50">
          New vendor request received. Click here to review and approve.
        </p>
        <div className="mt-2 flex justify-end">
          <Link
            to="/admin/new-vendor-request"
            className="px-4 py-1 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200"
          >
            View
          </Link>
        </div>
      </div>

      {/* Filters */}
      <SearchFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        showYear={true}
        showLocation={true}
        showStatus={true}
        showOrderStatus={false}
        showBuyerName={false}
        showOrderId={false}
      />

      {/* Vendors Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm scrollbar-none p-3">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="text-gray-600">
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
              <tr key={`${vendor.id}-${index}`} className="hover:bg-gray-50 text-gray-800">
                <td className="py-3 px-4">{vendor.id}</td>
                <td className="py-3 px-4 font-semibold text-[#5737B4]">
                  <Link
                    to={`/admin/vendor-details/${vendor.id}`}
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
                <td className="py-3 px-4 relative">
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
                    <div className="absolute right-0 top-0 translate-y-[-10px] w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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

      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">No vendors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

