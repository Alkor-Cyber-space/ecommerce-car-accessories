import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { PiPencilSimpleLineLight } from "react-icons/pi";


const products = [
  { name: "Wheel Rim Refund", refundId: "RR4001", customer: "Arjun Nair", reason: "Damaged on delivery", status: "Approved", price: "₹4,499" },
  { name: "LED Light Return", refundId: "RR4523", customer: "Riya Sharma", reason: "Wrong item received", status: "Pending", price: "₹2,699" },
  { name: "Seat Cover Refund", refundId: "RR0233", customer: "Karthik Menon", reason: "Item not as described", status: "Expired", price: "₹1,449" },
  { name: "Brake Pad Return", refundId: "RR1007", customer: "Divya Singh", reason: "Product quality issue", status: "Returned", price: "₹5,699" },
  { name: "Wiper Refund", refundId: "RR6523", customer: "Aditya Roy", reason: "Missing parts", status: "Received", price: "₹999" },
  { name: "Dashboard Camera", refundId: "RR8201", customer: "Sneha Joshi", reason: "Not compatible with vehicle", status: "Approved", price: "₹3,499" },
  { name: "Sunshade", refundId: "RR1098", customer: "Rohan Das", reason: "Changed mind", status: "Returned", price: "₹599" },
  { name: "Tyre Inflator Return", refundId: "RR3301", customer: "Anjali Verma", reason: "Defective product", status: "Pending", price: "₹2,299" },
  { name: "LED Fog Light", refundId: "RR7323", customer: "Nikhil Rao", reason: "Packaging damaged", status: "Expired", price: "₹1,899" },
  { name: "Rearview Mirror", refundId: "RR4529", customer: "Meera Pillai", reason: "Wrong color sent", status: "Received", price: "₹1,199" },
  { name: "Floor Mat Set", refundId: "RR5621", customer: "Vikram Shetty", reason: "Late delivery", status: "Approved", price: "₹1,799" },
  { name: "Car Charger Return", refundId: "RR6790", customer: "Isha Kapoor", reason: "Doesn't work", status: "Returned", price: "₹649" },
  { name: "Mobile Holder Refund", refundId: "RR3443", customer: "Aryan Thomas", reason: "Duplicate order", status: "Received", price: "₹349" }
];

const ReturnsRefundsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const itemsPerPage = 5;


  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = products.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className=" bg-[#ECECF0] rounded-2xl min-h-screen px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Returns & Refunds</h2>
        <button className="bg-[#5737B4] text-white text-sm px-4 py-2 rounded  flex items-center">
          Download Report
        </button>
      </div>

      {/* Filter Form */}
      <div className="bg-white w-4xl py-4 px-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5737B4]">
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
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date - From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date - To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button className="border border-gray-300 text-gray-700 px-6 py-2 text-sm rounded-md hover:bg-gray-50">
            Reset
          </button>
          <button className="bg-[#5737B4] text-white px-6 py-2 text-sm rounded-md hover:bg-[#5737B4]">
            Search
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded-md shadow text-sm">
          <thead className="text-gray-600">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {currentItems.map((product, idx) => (
              <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3 text-indigo-600 font-medium">{product.name}</td>
                <td className="p-3">{product.customer}</td>
                <td className="p-3">{product.reason}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : product.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : product.status === "Expired"
                            ? "bg-red-100 text-red-600"
                            : product.status === "Received"
                              ? "bg-blue-100 text-blue-600"
                              : product.status === "Returned"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-3">{product.price}</td>
                <td className="flex p-3 gap-4 text-gray-500 hover:text-black cursor-pointer">
                  <Link to={`/vendor/orders/edit-order`}>
                    <PiPencilSimpleLineLight className="text-lg mb-2 text-gray-700" />
                  </Link>
                  <Link to={`/vendor/orders/order-detail`} className="flex items-center text-[#5737B4] font-semibold">
                    View More
                  </Link>
                </td>
              </tr>
            ))} */}

          </tbody>
        </table>
        <p className="text-center text-gray-500 py-4">No data found</p>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-[#505050] font-medium ">
          {/* Showing {endIndex} of {totalItems} */}
          showing {0} of {0}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="text-[#5737B4] px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="text-[#5737B4] px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnsRefundsTable;