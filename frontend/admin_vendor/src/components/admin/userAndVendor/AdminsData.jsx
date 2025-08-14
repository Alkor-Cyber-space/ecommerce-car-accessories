import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from "../../../pages/admin/SearchFilter";
import { getAdminsList } from "../../../services/allAPI";

// TODO: Replace this mock with your actual API call

export default function AdminOverview() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Super Admin",
    status: "Active",
    joined: new Date().toISOString().split("T")[0],
  });
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  const [filters, setFilters] = useState({
    year: '',
    location: '',
    status: '',
    regDateFrom: '',
    regDateTo: '',
  });

  const handleReset = () => {
    setFilters({
      year: '',
      location: '',
      status: '',
      regDateFrom: '',
      regDateTo: '',
    });
    setFilteredAdmins(admins);
  };
  const handleSearch = () => {
    const filtered = admins.filter((admin) => {
      const matchesStatus = filters.status
        ? admin.status?.toLowerCase() === filters.status.toLowerCase()
        : true;

      const matchesDateFrom = filters.regDateFrom
        ? new Date(admin.date_joined) >= new Date(filters.regDateFrom)
        : true;

      const matchesDateTo = filters.regDateTo
        ? new Date(admin.date_joined) <= new Date(filters.regDateTo)
        : true;

      return matchesStatus && matchesDateFrom && matchesDateTo;
    });

    setFilteredAdmins(filtered);
  };

  useEffect(() => {
    const fetchAdminsList = async () => {
      try {
        const data = await getAdminsList();
        setAdmins(data);
        setFilteredAdmins(data);
      } catch (error) {
        console.error("Error fetching admin user list:", error);
      }
    };
    fetchAdminsList();
  }, []);


  const handleAdd = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAdmin = {
      ...formData,
      id: Math.max(...admins.map((a) => a.id)) + 1,
    };
    setAdmins((prev) => [...prev, newAdmin]);
    setShowModal(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Super Admin",
      status: "Active",
      joined: new Date().toISOString().split("T")[0],
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure to delete this admin?");
    if (confirmDelete) {
      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
    }
  };

  // State
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleActionClick = (id, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 4, // 4px gap
      left: rect.left + window.scrollX - 120, // shift left so it aligns nicely
    });
    setActiveDropdown(id);
  };


  const handleAction = (action, adminId) => {
    console.log(`${action} admin with ID: ${adminId}`);
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
      // Close dropdown if clicking outside
      if (!event.target.closest('[data-dropdown]')) {
        setActiveDropdown(null);
      }
    };

    const handleScroll = () => {
      // Close dropdown on scroll
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeDropdown]);

  // const filteredAdmins = admins.filter(
  //   (admin) =>
  //     admin.name.toLowerCase().includes(search.toLowerCase()) ||
  //     admin.email.toLowerCase().includes(search.toLowerCase()) ||
  //     admin.phone.includes(search) ||
  //     admin.id.toString().includes(search)
  // );

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-[#232832] text-xl font-bold">Admin Overview</h1>

        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#5737B4] text-white rounded-md hover:bg-[#462f91] transition"
          >
            <FaPlus /> Add Super Admin
          </button>
        </div>
      </div>

      <SearchFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        showYear={false}
        showLocation={false}
      />


      <div className="overflow-x-auto bg-white shadow rounded-md scrollbar-none p-3">
        <table className="min-w-full bg-white text-sm">
          <thead className="text-gray-600 ">
            <tr>
              <th className="py-4 text-left px-4 font-medium">User ID</th>
              <th className="py-4 text-left px-4 font-medium">Name</th>
              <th className="py-4 text-left px-4 font-medium">Email</th>
              <th className="py-4 text-left px-4 font-medium">Phone</th>
              <th className="py-4 text-left px-4 font-medium">Role</th>
              <th className="py-4 text-left px-4 font-medium">Status</th>
              <th className="py-4 text-left px-4 font-medium">Joined On</th>
              <th className="py-4 text-left px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin, id) => (
              <tr key={id} className="hover:bg-gray-50 border-gray-100">
                <td className="py-3 px-4 font-medium text-[#5737B4]">{admin.id || 'N/A'}</td>
                <td className="py-3 px-4">{admin.username || 'N/A'}</td>
                <td className="py-3 px-4">{admin.email || 'N/A'}</td>
                <td className="py-3 px-4">{admin.phone_number || 'N/A'}</td>
                <td className="py-3 px-4">{admin.role || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      admin.status
                    )}`}
                  >
                    {admin.status || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {admin.date_joined ? admin.date_joined.slice(0, 10) : 'N/A'}
                </td>

                <td className="py-3 px-4 relative">
                  <button
                    onClick={(e) => handleActionClick(admin.id, e)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    data-dropdown
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {/* Dropdown shown on click */}
                  {activeDropdown === admin.id && (
                    <div className="absolute right-0 top-0 translate-y-[-10px] flex flex-col bg-white  rounded shadow w-32 z-50">
                      <button
                        onClick={() => handleAction("View", admin.id)}
                        className="px-4 py-2 text-left hover:bg-gray-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction("Edit", admin.id)}
                        className="px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction("Suspend", admin.id)}
                        className="px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                      >
                        Suspend
                      </button>
                    </div>
                  )}

                </td>

              </tr>
            ))}
            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-lg font-semibold mb-4">Add Super Admin</h3>

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
                <label className="block mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded p-2 border"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded p-2 border"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Joined Date</label>
                <input
                  type="date"
                  name="joined"
                  value={formData.joined}
                  onChange={handleChange}
                  className="w-full rounded p-2 border"
                />
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
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-[#5737B4] text-white rounded hover:bg-[#462f91]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}