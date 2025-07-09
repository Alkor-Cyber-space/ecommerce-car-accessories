import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin Overview</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#5737B4] text-white rounded-md hover:bg-[#462f91] transition"
        >
          <FaPlus /> Add Super Admin
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Role</th>
              <th className="py-2 px-4 border">Joined On</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="text-center hover:bg-gray-50">
                <td className="py-2 px-4 border">{admin.name}</td>
                <td className="py-2 px-4 border">{admin.email}</td>
                <td className="py-2 px-4 border">{admin.role}</td>
                <td className="py-2 px-4 border">{admin.joined}</td>
                <td className="py-3 px-4 border flex justify-center gap-3">
                  <button onClick={() => alert("Edit not implemented")} className="text-blue-500">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(admin.id)} className="text-red-500">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
                  className="w-full border rounded p-2"
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
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">Joined Date</label>
                <input
                  type="date"
                  name="joined"
                  value={formData.joined}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
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
