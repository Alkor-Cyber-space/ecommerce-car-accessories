import React, { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from "../../../pages/admin/SearchFilter";
import {
  getAdminsList,
  addSubAdminApi,
  deleteAdminApi,
  exportReportApi,
} from "../../../services/allAPI";
import { toast } from "react-toastify";

export default function AdminOverview() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Admin",
    status: "",
  });

  const [filters, setFilters] = useState({
    year: "",
    location: "",
    status: "",
    regDateFrom: "",
    regDateTo: "",
  });

  //  Fetch admins
  useEffect(() => {
    const fetchAdminsList = async () => {
      try {
        const data = await getAdminsList();
        setAdmins(data);
        setFilteredAdmins(data);
        localStorage.setItem("adminsList", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching admin user list:", error);
      }
    };
    fetchAdminsList();
  }, []);

  //  Download Report Function
  const handleDownloadReport = async (format) => {
    try {
      setShowDownloadOptions(false);
      setIsDownloading(true);
      const tableData = filteredAdmins.map((admin) => ({
        id: admin.id,
        username: admin.username || "N/A",
        email: admin.email || "N/A",
        phone_number: admin.phone_number || "N/A",
        role: admin.role || "Admin",
        status: admin.status || "Pending",
        date_joined: admin.date_joined
          ? admin.date_joined.split("T")[0]
          : "N/A",
      }));

      const response = await exportReportApi("admins_overview", format, tableData);

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `admins_overview.${format === "pdf" ? "pdf" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download report.");
    } finally {
      setIsDownloading(false);
    }
  };

  //  Filter logic
  const handleReset = () => {
    setFilters({
      year: "",
      location: "",
      status: "",
      regDateFrom: "",
      regDateTo: "",
    });
    setFilteredAdmins(admins);
  };

  // Add this useEffect after fetching admins
  useEffect(() => {
    const filtered = admins.filter((admin) => {
      const adminDate = admin.date_joined ? new Date(admin.date_joined) : null;

      const matchesStatus =
        !filters.status ||
        admin.status?.toLowerCase() === filters.status.toLowerCase();

      const matchesRegDateFrom =
        !filters.regDateFrom || (adminDate && adminDate >= new Date(filters.regDateFrom));

      const matchesRegDateTo =
        !filters.regDateTo || (adminDate && adminDate <= new Date(filters.regDateTo));

      return matchesStatus && matchesRegDateFrom && matchesRegDateTo;
    });

    setFilteredAdmins(filtered);
  }, [filters, admins]);

  //  Modal form submit
  const validateForm = () => {
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!phoneRegex.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      alert("Email must be a valid Gmail address (example@gmail.com).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const adminData = {
        username: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
        role: formData.role,
        status: formData.status,
      };

      const response = await addSubAdminApi(adminData);
      toast.success(response.message);

      const updatedAdmins = await getAdminsList();
      setAdmins(updatedAdmins);
      setFilteredAdmins(updatedAdmins);
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Admin",
        status: "",
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.error || "Failed to create admin");
    }
  };

  //  Delete admin
  const handleDelete = async (id) => {
    try {
      const response = await deleteAdminApi(id);
      toast.success(response.message || "Admin deleted successfully");

      const updatedAdmins = await getAdminsList();
      setAdmins(updatedAdmins);
      setFilteredAdmins(updatedAdmins);
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.error || "Failed to delete admin");
    }
  };

  const handleAction = (action, adminId) => {
    if (action === "Delete") {
      handleDelete(adminId);
    } else {
      toast.info(`${action} action not implemented yet`);
    }
    setActiveDropdown(null);
  };

  // Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Suspended":
        return "bg-red-100 text-red-600";
      case "Pending":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  //  Close dropdowns on outside click
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
    <div className="bg-gray-100 p-6 rounded-2xl w-full space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-[#5737B4]">Admin Overview</h1>

        <div className="flex items-center gap-3" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              disabled={isDownloading}
              className={`text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                isDownloading ? "bg-[#462a93] opacity-75 cursor-not-allowed" : "bg-[#5737B4] hover:bg-[#462f91]"
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

          {/* Create Admin */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5737B4] text-white rounded-md hover:bg-[#462f91] transition"
          >
            <FaPlus /> Create Admin
          </button>
        </div>
      </div>

      {/* Filters */}
      <SearchFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={() => { }}
        onReset={handleReset}
        showYear={false}
        showLocation={false}
        showOrderStatus={false}
        showBuyerName={false}
        showOrderId={false}
      />

      {/* Table */}
      <div className="overflow-x-auto scrollbar-none">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-4">S.No</th>
              <th className="py-4 px-4">User ID</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Phone</th>
              <th className="py-4 px-4">Role</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 text-center border-gray-100"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-[#5737B4]">
                    {admin.id || "N/A"}
                  </td>
                  <td className="py-3 px-4">{admin.username || "N/A"}</td>
                  <td className="py-3 px-4">{admin.email || "N/A"}</td>
                  <td className="py-3 px-4">{admin.phone_number || "N/A"}</td>
                  <td className="py-3 px-4">
                    {admin.is_admin_staff ? "Admin Staff" : "Admin"}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        admin.is_active ? "Active" : "Inactive"
                      )}`}
                    >
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 relative action-dropdown-container">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === admin.id ? null : admin.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                    </button>

                    {activeDropdown === admin.id && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                        <button
                          onClick={() => handleAction("Edit", admin.id)}
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-r border-gray-200 whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleAction("Delete", admin.id)}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-gray-50 whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-lg font-semibold mb-4">Create Admin</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded p-2 border"
                  />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded p-2 border"
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full rounded p-2 border"
                  />
                </div>
                <div>
                  <label className="block mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full rounded p-2 border"
                  />
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded p-2 border"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5737B4] text-white rounded hover:bg-[#462f91]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
