import React, { useState, useEffect } from 'react';

const usersData = [
  {
    id: 1,
    name: 'Amit Sharma',
    email: 'amit@example.com',
    phone: '+91 9876543210',
    location: 'Delhi',
    role: 'Customer',
    status: 'Active',
    joined: '2024-12-15',
  },
  {
    id: 2,
    name: 'Neha Verma',
    email: 'neha@example.com',
    phone: '+91 9988776655',
    location: 'Mumbai',
    role: 'Customer',
    status: 'Blocked',
    joined: '2024-10-01',
  },
];

export default function UserDataTable() {
  const [users, setUsers] = useState(usersData);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredUsers = users.filter(user => {
    return (
      (statusFilter ? user.status === statusFilter : true) &&
      (locationFilter ? user.location === locationFilter : true)
    );
  });

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-[#232832] text-xl font-bold">Users Overview</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 text-left px-2">#</th>
              <th className="py-4 text-left px-2">Name</th>
              <th className="py-4 text-left px-2">Email</th>
              <th className="py-4 text-left px-2">Phone</th>
              <th className="py-4 text-left px-2">Location</th>
              <th className="py-4 text-left px-2">Role</th>
              <th className="py-4 text-left px-2">Status</th>
              <th className="py-4 text-left px-2">Joined On</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="text-left hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{index + 1}</td>
                <td className="py-2 px-2">{user.name}</td>
                <td className="py-2 px-2">{user.email}</td>
                <td className="py-2 px-2">{user.phone}</td>
                <td className="py-2 px-2">{user.location}</td>
                <td className="py-2 px-2">{user.role}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-2 px-2">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
