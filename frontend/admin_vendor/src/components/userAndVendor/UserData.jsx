import React from 'react';

const users = [
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
  // Add more users here...
];

export default function UserDataTable() {
  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Users Overview</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined On</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{index + 1}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">{user.location}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
