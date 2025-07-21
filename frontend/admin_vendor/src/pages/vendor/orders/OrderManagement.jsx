import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faArrowUp, faArrowDown,} from "@fortawesome/free-solid-svg-icons";

const OrderManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const orders = [
    { id: "12325566", date: "20 May 2025", time: "3:50 PM", buyer: "Rahul Mehta", order: "Alloy Wheel X2R15", quantity: 2, status: "Order Placed" },
    { id: "12323566", date: "20 May 2025", time: "5:50 PM", buyer: "Priya Nair", order: "LED Headlamp Pro", quantity: 1, status: "Delivered" },
    { id: "2328566", date: "20 May 2025", time: "8:30 PM", buyer: "Arjun Kapoor", order: "Car Seat Cover Duo", quantity: 3, status: "Cancelled" },
    { id: "2823566", date: "20 May 2025", time: "3:30 PM", buyer: "Sneha Sharma", order: "Brake Pad RZ", quantity: 1, status: "Out for Delivery" },
    { id: "2987566", date: "21 May 2025", time: "9:15 AM", buyer: "Kunal Verma", order: "Dashboard Polish Kit", quantity: 2, status: "Delivered" },
    { id: "3122451", date: "21 May 2025", time: "11:00 AM", buyer: "Anjali Menon", order: "Car Perfume Set", quantity: 4, status: "Order Placed" },
    { id: "3223471", date: "21 May 2025", time: "1:45 PM", buyer: "Farhan Khan", order: "Rear View Mirror X", quantity: 1, status: "Returned" },
    { id: "3324502", date: "21 May 2025", time: "2:30 PM", buyer: "Neha Gupta", order: "Tyre Inflator Compact", quantity: 1, status: "Delivered" },
    { id: "3427854", date: "21 May 2025", time: "4:10 PM", buyer: "Amit Joshi", order: "Windshield Washer Fluid", quantity: 5, status: "Out for Delivery" },
    { id: "3529823", date: "21 May 2025", time: "6:50 PM", buyer: "Ritika Das", order: "Sun Shade XL", quantity: 2, status: "Order Placed" },
  ];

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {

  if (sortConfig.key !== key) {

    return(

      <span className="ml-1 text-black-400 text-sm">↑↓</span>

    );

  }

  return (

    <span className="ml-1 text-black-600 text-sm">

      {sortConfig.direction === 'asc' ? '↑' : '↓'}

    </span>

  );

};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Order Management</h2>
        <button className="bg-purple-600 text-white text-sm px-4 py-2 rounded hover:bg-purple-700 flex items-center">
          Download Report
        </button>
      </div>

      {/* Search Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Select Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Returned</option>
                <option>Expired</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date - From</label>
                <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date - To</label>
                <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button className="border border-gray-300 text-gray-700 px-6 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors">
            Reset
          </button>
          <button className="bg-purple-600 text-white px-6 py-2 text-sm rounded-md hover:bg-purple-700 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Order ID
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  Order Date & Time
                  {getSortIcon('date')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('buyer')}
              >
                <div className="flex items-center">
                  Buyer Name
                  {getSortIcon('buyer')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Product
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('quantity')}
              >
                <div className="flex items-center">
                  Qty
                  {getSortIcon('quantity')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#5737B4]">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div>
                    <div className="font-medium">Date: {order.date}</div>
                    <div>Time: {order.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {order.buyer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5737B4]">
                  {order.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === "Order Placed" ? "bg-green-100 text-green-600" :
                    order.status === "Delivered" ? "bg-yellow-100 text-yellow-600" :
                    order.status === "Cancelled" ? "bg-red-100 text-red-600" :
                    order.status === "Out for Delivery" ? "bg-blue-100 text-blue-600" :
                    order.status === "Returned" ? "bg-purple-100 text-purple-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-500 hover:text-purple-600">
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800 flex items-center">
                      
                      View More
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex justify-end items-center py-4 bg-gray-100 text-sm font-medium text-gray-800 mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`px-2 text-lg ${currentPage === 1 ? "text-gray-400" : "hover:text-purple-600"}`}
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-2 text-lg ${currentPage === 1 ? "text-gray-400" : "hover:text-purple-600"}`}
          >
            ‹
          </button>
          <span className="px-3 py-1 rounded-md bg-white shadow text-purple-600">
            {currentPage}
          </span>
          <span className="text-gray-600">
            of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-2 text-lg ${currentPage === totalPages ? "text-gray-400" : "hover:text-purple-600"}`}
          >
            
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-2 text-lg ${currentPage === totalPages ? "text-gray-400" : "hover:text-purple-600"}`}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;