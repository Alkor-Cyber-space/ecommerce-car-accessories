import React, { useEffect, useState } from "react";

export default function ReturnsReport() {
  const [returnsData, setReturnsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const data = [
  // { date: "2025-06-18", returnId: "RET1021", orderId: "ORD1005", product: "Brake Pads", buyer: "Siddharth Verma", vendor: "AutoMart", reason: "Damaged item", status: "Processed", amount: 850 },
  // { date: "2025-06-21", returnId: "RET1022", orderId: "ORD1010", product: "Seat Covers", buyer: "Neha Sharma", vendor: "CoverPro", reason: "Wrong size", status: "Pending", amount: 1200 },
  // { date: "2025-06-22", returnId: "RET1023", orderId: "ORD1011", product: "LED Headlights", buyer: "Rahul Desai", vendor: "AutoGlow", reason: "Not bright enough", status: "Approved", amount: 3200 },
  // { date: "2025-06-23", returnId: "RET1024", orderId: "ORD1012", product: "Car Vacuum Cleaner", buyer: "Priya Patel", vendor: "CleanDrive", reason: "Battery drains quickly", status: "Processed", amount: 1800 },
  // { date: "2025-06-24", returnId: "RET1025", orderId: "ORD1013", product: "Steering Wheel Cover", buyer: "Amit Singh", vendor: "GripPlus", reason: "Wrong color delivered", status: "Pending", amount: 650 },
  // { date: "2025-06-25", returnId: "RET1026", orderId: "ORD1014", product: "Car Phone Holder", buyer: "Deepika Joshi", vendor: "HoldRight", reason: "Doesn't fit my phone", status: "Rejected", amount: 450 },
  // { date: "2025-06-26", returnId: "RET1027", orderId: "ORD1015", product: "Air Freshener Pack", buyer: "Vikram Mehta", vendor: "FreshRide", reason: "Allergic to fragrance", status: "Processed", amount: 350 },
  
];
    setReturnsData(data);
    setFilteredData(data);
  }, []);

  const filterDataByDate = () => {
    const filtered = returnsData.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      const matchesVendor = vendorFilter ? item.vendor === vendorFilter : true;
      return (
        (!from || itemDate >= from) &&
        (!to || itemDate <= to) &&
        matchesStatus &&
        matchesVendor
      );
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const formatINR = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const getTotalRefundAmount = () => {
    return filteredData.reduce((total, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : Number(item.amount);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-blue-100 text-blue-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const indexOfFirstRow = (currentPage - 1) * rowsPerPage + 1;
  const indexOfLastRow = Math.min(currentPage * rowsPerPage, filteredData.length);

  const uniqueVendors = [...new Set(returnsData.map(item => item.vendor))];
  const uniqueStatuses = [...new Set(returnsData.map(item => item.status))];

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Returns Report</h1>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 
                   focus:ring-2 focus:ring-[#406EDC] focus:border-[#406EDC] 
                   transition-all duration-200 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 
                   focus:ring-2 focus:ring-[#406EDC] focus:border-[#406EDC] 
                   transition-all duration-200 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 
                   focus:ring-2 focus:ring-[#406EDC] focus:border-[#406EDC] 
                   transition-all duration-200 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {uniqueStatuses.map((status, idx) => (
                <option key={idx} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 
                   focus:ring-2 focus:ring-[#406EDC] focus:border-[#406EDC] 
                   transition-all duration-200 outline-none"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <option value="">All</option>
              {uniqueVendors.map((vendor, idx) => (
                <option key={idx} value={vendor}>{vendor}</option>
              ))}
            </select>
          </div>

          <button
            onClick={filterDataByDate}
            className="bg-[#5737B4] hover:bg-[#2f093d] text-white font-medium 
                 px-6 py-2.5 rounded-md shadow-md hover:shadow-lg 
                 transition-all duration-200 whitespace-nowrap"
          >
            Apply Filter
          </button>

          <div>
            <button
              className="bg-[#5737B4] hover:bg-[#2f093d] text-white font-medium 
                   px-6 py-2.5 rounded-md shadow-md hover:shadow-lg 
                   transition-all duration-200 whitespace-nowrap"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow ">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-6 text-left">Date</th>
              <th className="py-4 px-6 text-left">Return ID</th>
              <th className="py-4 px-6 text-left">Order ID</th>
              <th className="py-4 px-6 text-left">Product</th>
              <th className="py-4 px-6 text-left">Buyer</th>
              <th className="py-4 px-6 text-left">Vendor</th>
              <th className="py-4 px-6 text-left">Reason</th>
              <th className="py-4 px-6 text-left">Amount</th>
              <th className="py-4 px-6 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="text-left hover:bg-gray-50">
                  <td className="py-3 px-6 min-w-[120px]">{item.date}</td>
                  <td className="py-3 px-6">{item.returnId}</td>
                  <td className="py-3 px-6">{item.orderId}</td>
                  <td className="py-3 px-6">{item.product}</td>
                  <td className="py-3 px-6">{item.buyer}</td>
                  <td className="py-3 px-6">{item.vendor}</td>
                  <td className="py-3 px-6">{item.reason}</td>
                  <td className="py-3 px-6">{formatINR(item.amount)}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center text-gray-500 py-6 font-medium"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <p className="text-sm">
          Showing {indexOfFirstRow} - {indexOfLastRow} of {filteredData.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Total Amount */}
      <div className="pt-2 text-right text-sm font-semibold">
        Total Refunded Amount: {formatINR(getTotalRefundAmount())}
      </div>
    </div>
  );
}
