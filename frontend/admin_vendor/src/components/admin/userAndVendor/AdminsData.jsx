import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from "../../../pages/admin/SearchFilter";
import { getAdminsList, addSubAdminApi, deleteAdminApi } from "../../../services/allAPI"; // ✅ added deleteAdminApi
import { toast } from "react-toastify";

export default function AdminOverview() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Admin",
    status: "",
  });

  useEffect(() => {
    const fetchAdminsList = async () => {
      try {
        const data = await getAdminsList();
        setAdmins(data);
        localStorage.setItem("adminsList", JSON.stringify(data)); // ✅ store in localStorage
      } catch (error) {
        console.error("Error fetching admin user list:", error);
      }
    };
    fetchAdminsList();
  }, []);

  const handleAdd = () => setShowModal(true);

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

      // Fetch updated list
      const updatedAdmins = await getAdminsList();
      setAdmins(updatedAdmins);
      localStorage.setItem("adminsList", JSON.stringify(updatedAdmins));

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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Updated handleDelete to call backend API
  const handleDelete = async (id) => {
    
   

    try {
      const response = await deleteAdminApi(id);
      toast.success(response.message || "Admin deleted successfully");

      // Update list after deletion
      const updatedAdmins = await getAdminsList();
      setAdmins(updatedAdmins);
      localStorage.setItem("adminsList", JSON.stringify(updatedAdmins));
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.error || "Failed to delete admin");
    }
  };

  const handleActionClick = (id, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX - 120,
    });
    setActiveDropdown(id);
  };

  const handleAction = (action, adminId) => {
    if (action === "Delete") {
      handleDelete(adminId);
    } else if (action === "Edit") {
      alert("Edit functionality not implemented yet");
    } else if (action === "View") {
      alert("View functionality not implemented yet");
    }
    setActiveDropdown(null);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-dropdown]")) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-[#232832] text-xl font-bold">Admin Overview</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#5737B4] text-white rounded-md hover:bg-[#462f91] transition"
        >
          <FaPlus /> Create Admin
        </button>
      </div>

      <SearchFilter />

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
            {admins.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
            {admins.map((admin, index) => (
              <tr key={index} className="hover:bg-gray-50 text-center border-gray-100">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4 font-medium text-[#5737B4]">{admin.id || "N/A"}</td>
                <td className="py-3 px-4">{admin.username || "N/A"}</td>
                <td className="py-3 px-4">{admin.email || "N/A"}</td>
                <td className="py-3 px-4">{admin.phone_number || "N/A"}</td>
                <td className="py-3 px-4">{admin.role || "Admin"}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      admin.status
                    )}`}
                  >
                    {admin.status || "N/A"}
                  </span>
                </td>
                <td className="py-3 px-4 ">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === admin.id ? null : admin.id)
                    }
                    className="p-1 hover:bg-gray-100 rounded-full"
                    data-dropdown
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {activeDropdown === admin.id && (
                    <div
                      className="flex absolute right-1 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                      data-dropdown
                    >
                      <button
                        onClick={() => handleAction("View", admin.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction("Edit", admin.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction("Delete", admin.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600 rounded-b-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    required
                    className="w-full rounded p-2 border"
                  />
                </div>
                <div>
                  <label className="block mb-1">Role</label>
                  <input
                    type="text"
                    value="Admin"
                    disabled
                    className="w-full rounded p-2 border bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
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
