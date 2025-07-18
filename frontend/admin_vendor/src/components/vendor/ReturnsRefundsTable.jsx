import React from "react";

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
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Returns & Refunds</h2>
        <select className="border px-3 py-2 rounded-md text-[#5737B4]">
          <option>Download Report</option>
          <option>Download Us</option>
          <option>Pdf</option>
          <option>Excel</option>
        </select>
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
            {products.map((product, idx) => (
              <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3 text-indigo-600 font-medium">{product.name}</td>
                <td className="p-3">{product.customer}</td>
                <td className="p-3">{product.reason}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.status === "Approved"
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
                <td className="p-3 text-gray-500 hover:text-black cursor-pointer">✏️</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4 gap-2 text-sm">
        <span className="text-gray-500">1</span>
        <span className="text-gray-500">1</span>
      </div>
    </div>
  );
};

export default ReturnsRefundsTable;
