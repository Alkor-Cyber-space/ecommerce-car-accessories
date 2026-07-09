import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from '../../../pages/admin/SearchFilter';
import { Link } from 'react-router-dom';
import { exportReportApi, getVendorList } from '../../../services/allAPI';

export default function VendorDataTable() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
      setShowDownloadOptions(false);
      setIsDownloading(true);
      const tableData = filteredVendors.map((vendor) => ({
        id: vendor.id,
        username: vendor.username,
        email: vendor.email,
        contact_number: vendor.contact_number || "N/A",
        location: vendor.location || "N/A",
        status: vendor.is_active ? "Active" : "Inactive",
        date_joined: formatDate(vendor.date_joined),
        totalProducts: vendor.products || 0,
        totalOrders: vendor.orders || 0,
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
    } finally {
      setIsDownloading(false);
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
  // Add this useEffect after fetching vendors
  useEffect(() => {
    const filtered = vendors.filter((vendor) => {
      const vendorDate = vendor.date_joined ? new Date(vendor.date_joined) : null;

      const matchesYear =
        !filters.year || (vendorDate && vendorDate.getFullYear().toString() === filters.year);

      const matchesLocation =
        !filters.location ||
        (vendor.location
          ? vendor.location.toLowerCase().includes(filters.location.toLowerCase())
          : true);

      const matchesStatus =
        !filters.status ||
        (filters.status.toLowerCase() === "active"
          ? vendor.is_active === true
          : vendor.is_active === false);

      const matchesRegDateFrom =
        !filters.regDateFrom || (vendorDate && vendorDate >= new Date(filters.regDateFrom));

      let regDateToObj = null;
      if (filters.regDateTo) {
        regDateToObj = new Date(filters.regDateTo);
        regDateToObj.setHours(23, 59, 59, 999);
      }

      const matchesRegDateTo =
        !regDateToObj || (vendorDate && vendorDate <= regDateToObj);

      return matchesYear && matchesLocation && matchesStatus && matchesRegDateFrom && matchesRegDateTo;
    });

    setFilteredVendors(filtered);
  }, [filters, vendors]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
      if (!event.target.closest('.action-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-100 p-6 rounded-2xl w-full space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#5737B4]">Vendors Overview</h1>

        {/* Download Report Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            disabled={isDownloading}
            className={`bg-[#5737B4] text-white px-3 py-2 rounded-md text-sm sm:text-base flex items-center gap-2 transition-all ${
              isDownloading ? "opacity-75 cursor-not-allowed" : "hover:bg-[#462a93]"
            }`}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              "Download Report"
            )}
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
        onSearch={() => { }}
        onReset={handleReset}
        showYear={true}
        showLocation={true}
        showStatus={true}
        showOrderStatus={false}
        showBuyerName={false}
        showOrderId={false}
      />

      {/* Vendors Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm scrollbar-none p-3 pb-32">
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      vendor.is_active ? "Active" : "Inactive"
                    )}`}
                  >
                    {vendor.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="py-3 px-4">{formatDate(vendor.date_joined)}</td>
                <td className="py-3 px-4 font-medium">{vendor.products || 0}</td>
                <td className="py-3 px-4 font-medium">{vendor.orders || 0}</td>
                <td className="py-3 px-4 relative action-dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(`${vendor.id}-${index}`);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {activeDropdown === `${vendor.id}-${index}` && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <Link
                        to={`/admin/vendor-details/${vendor.id}`}
                        onClick={() => handleAction('View', vendor)}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-r border-gray-200 whitespace-nowrap"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleAction('Edit', vendor)}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-r border-gray-200 whitespace-nowrap"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('Suspend', vendor)}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-gray-50 whitespace-nowrap"
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

