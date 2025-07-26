import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";

const initialAdmins = [
  {
    id: 1,
    name: "Rohit Ravikumar",
    email: "rohit@gmail.com",
    role: "Super Admin",
    joined: "2024-05-12",
  },
  {
    id: 2,
    name: "Ananya Singh",
    email: "ananya@admin.com",
    role: "Admin",
    joined: "2024-06-01",
  },
];

export default function AdminOverview() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Super Admin",
    joined: new Date().toISOString().split("T")[0],
  });

  const handleAdd = () => setShowModal(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAdmin = { ...formData, id: Date.now() };
    setAdmins((prev) => [...prev, newAdmin]);
    setShowModal(false);
    setFormData({
      name: "",
      email: "",
      role: "Super Admin",
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

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
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
              <th className="py-4 text-left px-2">Name</th>
              <th className="py-4 text-left px-2">Email</th>
              <th className="py-4 text-left px-2">Role</th>
              <th className="py-4 text-left px-2">Joined On</th>
              <th className="py-4 text-left px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin, index) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{index + 1}</td>
                <td className="py-2 px-2">{admin.name}</td>
                <td className="py-2 px-2">{admin.email}</td>
                <td className="py-2 px-2">{admin.role}</td>
                <td className="py-2 px-2">{admin.joined}</td>
                <td className="py-2 px-2 flex gap-2">
                  <button
                    onClick={() => alert("Edit not implemented")}
                    className="text-blue-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  type="submit"
                  className="px-4 py-2 bg-[#5737B4] text-white rounded hover:bg-[#462f91]"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
