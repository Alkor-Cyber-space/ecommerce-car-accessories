import React, { useState, useEffect } from 'react';
import { GoArrowDownRight, GoArrowUpRight } from 'react-icons/go';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const UserDetails = () => {
  // State
  const [userorders, setUserOrders] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Example statuses (replace with real API data if needed)
  const statusArray = ["Live", "Draft", "Inactive", "Live"];

  // Orders data
  const orders = statusArray.map((status, index) => ({
    id: index + 1,
    name: 'Alloy Wheel XZR16',
    sku: 'BRK-BCS-CBP-STD-0001',
    stock: status === 'Live' ? 34 : 0,
    status,
    price: '₹4,499',
  }));

  // Load orders into state once
  useEffect(() => {
    setUserOrders(orders);
  }, []);

  // Dropdown toggle
  const handleDropdownToggle = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Handle actions
  const handleAction = (action, id) => {
    console.log(`Action: ${action}, Order ID: ${id}`);
    setActiveDropdown(null);
  };

  return (
    <div className='w-full min-h-screen p-4 md:p-6 text-[#232323] space-y-6 bg-gray-100 rounded-xl'>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-lg md:text-xl font-semibold">User Details</h1>
        <div className="flex gap-2 ml-auto">
          <Link
            to="/admin/vendor-documents"
            className="border border-[#5737B4] text-[#5737B4] px-4 py-2 rounded text-sm"
          >
            View Documents
          </Link>
          <button className="bg-[#5737B4] text-white px-4 py-2 rounded text-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">Total orders</p>
          <h2 className="text-2xl font-bold">{userorders.length}</h2>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {userorders.length}
            <span className="text-red-500 text-sm bg-red-100 px-2 py-1 rounded flex items-center gap-1">
              12.6% <GoArrowDownRight />
            </span>
          </h2>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">Stock</p>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            50.8K
            <span className="text-green-700 text-sm bg-green-100 px-2 py-1 rounded flex items-center gap-1">
              8.3% <GoArrowUpRight />
            </span>
          </h2>
        </div>
      </div>

      {/* Basic Details / Address / Company / Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Basic Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex"><span className="font-medium w-24">Name</span><span className="ml-4"> </span></div>
            <div className="flex"><span className="font-medium w-24">Email</span><span className="ml-4"></span></div>
            <div className="flex"><span className="font-medium w-24">Phone</span><span className="ml-4"></span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Address</h3>
          <div className="space-y-2 text-sm">
            <div className="flex"><span className="font-medium w-28">Line 1</span><span className="ml-4">rD</span></div>
            <div className="flex"><span className="font-medium w-28">Line 2</span><span className="ml-4">rD</span></div>
            <div className="flex"><span className="font-medium w-28">Landmark</span><span className="ml-4"></span></div>
            <div className="flex"><span className="font-medium w-28">Pincode</span><span className="ml-4"></span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Company Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex"><span className="font-medium w-40">Company Name</span><span className="ml-4">r</span></div>
            <div className="flex"><span className="font-medium w-40">Company Email</span><span className="ml-4">r</span></div>
            <div className="flex"><span className="font-medium w-40">Company Number</span><span className="ml-4">nd</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex"><span className="font-medium w-24">Name</span><span className="ml-4"></span></div>
            <div className="flex"><span className="font-medium w-24">Designation</span><span className="ml-4"></span></div>
            <div className="flex"><span className="font-medium w-24">Email</span><span className="ml-4"></span></div>
            <div className="flex"><span className="font-medium w-24">Phone</span><span className="ml-4"></span></div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="font-semibold text-lg">All Orders List</h2>
        <button className="text-sm text-[#5737B4] font-medium border border-[#5737B4] px-3 py-2 rounded">
          Bulk Actions
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 overflow-x-auto">
        <table className="min-w-[700px] w-full text-left text-sm ">
          <thead>
            <tr className="text-xs md:text-sm text-gray-600">
              <th className="px-3 py-2 font-medium">S.NO</th>
              <th className="px-3 py-2 font-medium">Order Name</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userorders.map((order, index) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 text-[#5737B4] font-semibold cursor-pointer">
                  {order.name}
                </td>
                <td className="px-3 py-2">{order.sku}</td>
                <td className="px-3 py-2">{order.stock}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      order.status === 'Live'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Draft'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2">{order.price}</td>
                <td className="px-3 py-2 relative">
                  <button
                    onClick={() => handleDropdownToggle(order.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <span className="text-lg"><HiOutlineDotsVertical /></span>
                  </button>

                  {activeDropdown === order.id && (
                    <div className="flex absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => handleAction('view', order.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction('edit', order.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('suspend', order.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600 rounded-b-lg"
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
};

export default UserDetails;
