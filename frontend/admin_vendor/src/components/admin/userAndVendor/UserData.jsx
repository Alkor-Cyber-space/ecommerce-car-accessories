import React, { useState, useEffect } from 'react';
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from '../../../pages/admin/SearchFilter';
import { Link, useNavigate } from 'react-router-dom';
import { getUserList } from '../../../services/allAPI';

export default function UserDataTable() {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // ✅ Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const data = await getUserList();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };
    fetchUserList();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      search === '' ||
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search) ||
      user.id?.toString().includes(search);

    return (
      matchesSearch &&
      (statusFilter ? user.status === statusFilter : true) &&
      (locationFilter ? user.location === locationFilter : true)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-600';
      case 'Suspended':
        return 'bg-red-100 text-red-600';
      case 'Pending Verification':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleActionClick = (id, e) => {
    e.stopPropagation();
    setActiveDropdown(prev => (prev === id ? null : id));
  };

  const handleAction = (action, user) => {
    if (action === "Edit") {
      setEditUser(user);
      setIsModalOpen(true);
    } else if (action === "View") {
      navigate(`/admin/user-details/${user.id}`); // ✅ redirect with user.id
    } else if (action === "Disable") {
      console.log(`Disable user with ID: ${user.id}`);
    }
    setActiveDropdown(null);
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  // ✅ Handle input change in modal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Save changes
  const handleSave = () => {
    console.log("Updated User:", editUser);
    setUsers(prev =>
      prev.map(u => (u.id === editUser.id ? editUser : u))
    );
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <div className='flex justify-between items-center'>
        <h1 className="text-[#232832] text-xl font-bold">Users Overview</h1>
        <button className='bg-[#5737B4] text-white p-2 rounded-md md:sm'>
          Download Report
        </button>
      </div>

      <div className="bg-white rounded-xl w-full md:w-[28%] flex flex-col md:flex-row items-center justify-between px-4 py-4">
        <p className="text-base md:text-lg text-gray-700">Total User :</p>
        <h1 className="text-3xl font-semibold text-black mr-5 md:mr-2">{users?.length}</h1>
      </div>

      <SearchFilter />

      <div className="overflow-x-auto scrollbar-none">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 text-left px-4 font-medium">User ID</th>
              <th className="py-4 text-left px-4 font-medium">Full Name</th>
              <th className="py-4 text-left px-4 font-medium">Email</th>
              <th className="py-4 text-left px-4 font-medium">Phone</th>
              <th className="py-4 text-left px-4 font-medium">Registration Date</th>
              <th className="py-4 text-left px-4 font-medium">Status</th>
              <th className="py-4 text-left px-4 font-medium">Last Active</th>
              <th className="py-4 text-left px-4 font-medium">Total Orders</th>
              <th className="py-4 text-left px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={`${user.id}-${index}`}
                className="text-left hover:bg-gray-50 border-b border-gray-100"
              >
                <td className="py-3 px-4 font-medium text-[#5737B4]">
                  <Link to={`/admin/user-details/${user.id}`}>{user.id}</Link>
                </td>
                <td className="py-3 px-4">{user.username || 'N/A'}</td>
                <td className="py-3 px-4">{user.email || 'N/A'}</td>
                <td className="py-3 px-4">{user.phone_number || 'N/A'}</td>
                <td className="py-3 px-4">
                  {user.date_joined ? user.date_joined.slice(0, 10) : 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                  >
                    {user.status || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4">{user.lastActive || 'N/A'}</td>
                <td className="py-3 px-4 font-medium">₹ {user.totalOrders || 'N/A'}</td>

                {/* ✅ Actions */}
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => handleActionClick(user.id + index, e)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {activeDropdown === user.id + index && (
                    <div
                      className="flex absolute right-12 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleAction('View', user)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction('Edit', user)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('Disable', user)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                      >
                        Disable
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Edit Modal */}
      {isModalOpen && editUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="username"
                value={editUser.username || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Full Name"
              />
              <input
                type="email"
                name="email"
                value={editUser.email || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <input
                type="text"
                name="phone_number"
                value={editUser.phone_number || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Phone Number"
              />
              <select
                name="status"
                value={editUser.status || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#5737B4] text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
