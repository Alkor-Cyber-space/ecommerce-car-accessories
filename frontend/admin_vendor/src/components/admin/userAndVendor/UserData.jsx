// import React, { useState, useEffect } from 'react';
import { BsSearch } from "react-icons/bs";
import { HiOutlineDotsVertical } from "react-icons/hi";
import SearchFilter from '../../../pages/admin/SearchFilter';
import { Link } from 'react-router-dom';
import { getUserList } from '../../../services/allAPI';
import { useEffect, useState } from "react";

export default function UserDataTable() {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

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
    setFilteredUsers(users);
  };


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
    setFilteredUsers(users);

  }, []);

  // const filteredUsers = users.filter(user => {
  //   const matchesSearch = search === '' ||
  //     user.name.toLowerCase().includes(search.toLowerCase()) ||
  //     user.email.toLowerCase().includes(search.toLowerCase()) ||
  //     user.phone.includes(search) ||
  //     user.id.toLowerCase().includes(search);

  //   return (
  //     matchesSearch &&
  //     (statusFilter ? user.status === statusFilter : true) &&
  //     (locationFilter ? user.location === locationFilter : true)
  //   );
  // });
  const handleSearch = () => {
    const filtered = users.filter(user => {
      const matchesYear =
        filters.year === '' ||
        (user.date_joined && new Date(user.date_joined).getFullYear().toString() === filters.year);

      const matchesLocation =
        filters.location === '' || (user.location && user.location.toLowerCase() === filters.location.toLowerCase());

      const matchesStatus =
        filters.status === '' || (user.status && user.status.toLowerCase() === filters.status.toLowerCase());

      const matchesRegDateFrom =
        filters.regDateFrom === '' || (user.date_joined && new Date(user.date_joined) >= new Date(filters.regDateFrom));

      const matchesRegDateTo =
        filters.regDateTo === '' || (user.date_joined && new Date(user.date_joined) <= new Date(filters.regDateTo));

      return (
        matchesYear &&
        matchesLocation &&
        matchesStatus &&
        matchesRegDateFrom &&
        matchesRegDateTo
      );
    });

    setFilteredUsers(filtered);
  };

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
    const rect = e.currentTarget.getBoundingClientRect();
    // setDropdownPosition({
    //   top: rect.bottom + 4, // space below button
    //   left: rect.left - 60, // shift horizontally if needed
    // });
    setActiveDropdown(id);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
    setDropdownPosition(null);
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
      <div className='flex justify-between items-center'>
        <h1 className="text-[#232832] text-xl font-bold">Users Overview</h1>
        <button className='bg-[#5737B4] text-white p-2 rounded-md md:sm'>Download Report</button>
      </div>
      <div className="bg-white rounded-xl w-full md:w-[28%] flex flex-col md:flex-row items-center justify-between px-4 py-4">
        <p className="text-base md:text-lg text-gray-700">Total User :</p>
        <h1 className="text-3xl font-semibold text-black mr-5 md:mr-2">{users?.length}</h1>
      </div>

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
            {(filteredUsers.length > 0 ? filteredUsers : users).map((user, index) => (
              <tr key={`${user.id}-${index}`} className="text-left hover:bg-gray-50 border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-[#5737B4]"><Link to='/admin/user-details'>{user.id}</Link></td>
                <td className="py-3 px-4">{user.username || 'N/A'}</td>
                <td className="py-3 px-4">{user.email || 'N/A'}</td>
                <td className="py-3 px-4">{user.phone_number || 'N/A'}</td>
                <td className="py-3 px-4">{user.date_joined ? user.date_joined.slice(0, 10) : 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4">{user.lastActive || 'N/A'}</td>
                <td className="py-3 px-4 font-medium">₹ {user.totalOrders || 'N/A'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => handleActionClick(user.id + index, e)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <HiOutlineDotsVertical className="text-gray-500 text-lg" />
                  </button>
                  {activeDropdown && dropdownPosition && (
                    <div
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex items-center gap-3 px-3 py-2"
                    // style={{
                    //   top: dropdownPosition.top,
                    //   left: dropdownPosition.left,
                    // }}
                    >
                      <button
                        onClick={() => handleAction('View', activeDropdown)}
                        className="text-sm text-gray-800 hover:text-gray-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction('Edit', activeDropdown)}
                        className="text-sm text-gray-800 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('Delete', activeDropdown)}
                        className="text-sm text-red-600 hover:text-red-800"
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
    </div>
  );
}