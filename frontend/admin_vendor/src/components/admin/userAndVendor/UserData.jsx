import React, { useState, useEffect } from 'react';
import { BsSearch } from "react-icons/bs";
import { HiOutlineDotsVertical } from "react-icons/hi";

const usersData = [
  {
    id: "00975",
    name: 'Arjun Kumar',
    email: 'arjun.kumar@email.com',
    phone: '+91 9876543210',
    location: 'Delhi',
    status: 'Active',
    joined: '23/12/2024',
    lastActive: '23/12/2024 10am',
    totalOrders: '75,999'
  },
  {
    id: "00977",
    name: 'Aravind Singh',
    email: 'aravind.singh@email.com',
    phone: '+91 9988776655',
    location: 'Mumbai',
    status: 'Active',
    joined: '23/12/2024',
    lastActive: '23/12/2024 10am',
    totalOrders: '18,499'
  },
  {
    id: "00978",
    name: 'Geeta Sharma',
    email: 'geeta.sharma@email.com',
    phone: '+91 9123456780',
    location: 'Mumbai',
    status: 'Pending Verification',
    joined: '23/12/2024',
    lastActive: '23/12/2024 10am',
    totalOrders: '11,990'
  },
  {
    id: "00979",
    name: 'Wasim Khan',
    email: 'wasim.khan@email.com',
    phone: '+91 9876501234',
    location: 'Mumbai',
    status: 'Suspended',
    joined: '23/12/2024',
    lastActive: '23/12/2024 10am',
    totalOrders: '75,999'
  }
];

export default function UserDataTable() {
  const [users, setUsers] = useState(usersData);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search) ||
      user.id.toLowerCase().includes(search);

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

  const handleActionClick = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const handleAction = (action, userId) => {
    console.log(`${action} user with ID: ${userId}`);
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
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-[#232832] text-xl font-bold">Users Overview</h1>

      <div className='bg-white rounded-xl relative w-full md:w-[20%] flex'>
        <p className='pl-6 py-5.5'>Total User : </p>
        <h1 className='text-[30px] py-3 px-2 font-semibold'>256</h1>
      </div>

      <div className="relative w-full md:w-[50%]">
        <BsSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          className="bg-white px-5 py-2 rounded-3xl w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
              <tr key={`${user.id}-${index}`} className="text-left hover:bg-gray-50 border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-blue-600">{user.id}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4">{user.joined}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4">{user.lastActive}</td>
                <td className="py-3 px-4 font-medium">{user.totalOrders}</td>
                <td className="py-3 px-4 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(user.id + index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>

                  {activeDropdown === user.id + index && (
                    <div className="absolute right-0 top-8 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleAction('View', user.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction('Edit', user.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('Suspend', user.id)}
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
    </div>
  );
}
