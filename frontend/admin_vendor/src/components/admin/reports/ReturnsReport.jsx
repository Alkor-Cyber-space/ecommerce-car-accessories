import React, { useEffect, useState } from "react";

export default function ReturnsReport() {
  const [returnsData, setReturnsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;


  useEffect(() => {
    const data = [
  { date: "2025-06-18", returnId: "RET1021", orderId: "ORD1005", product: "Brake Pads", buyer: "Siddharth Verma", vendor: "AutoMart", reason: "Damaged item", status: "Processed", amount: 850 },
  { date: "2025-06-21", returnId: "RET1022", orderId: "ORD1010", product: "Seat Covers", buyer: "Neha Sharma", vendor: "CoverPro", reason: "Wrong size", status: "Pending", amount: 1200 },
  { date: "2025-06-22", returnId: "RET1023", orderId: "ORD1011", product: "LED Headlights", buyer: "Rahul Desai", vendor: "AutoGlow", reason: "Not bright enough", status: "Approved", amount: 3200 },
  { date: "2025-06-23", returnId: "RET1024", orderId: "ORD1012", product: "Car Vacuum Cleaner", buyer: "Priya Patel", vendor: "CleanDrive", reason: "Battery drains quickly", status: "Processed", amount: 1800 },
  { date: "2025-06-24", returnId: "RET1025", orderId: "ORD1013", product: "Steering Wheel Cover", buyer: "Amit Singh", vendor: "GripPlus", reason: "Wrong color delivered", status: "Pending", amount: 650 },
  { date: "2025-06-25", returnId: "RET1026", orderId: "ORD1014", product: "Car Phone Holder", buyer: "Deepika Joshi", vendor: "HoldRight", reason: "Doesn't fit my phone", status: "Rejected", amount: 450 },
  { date: "2025-06-26", returnId: "RET1027", orderId: "ORD1015", product: "Air Freshener Pack", buyer: "Vikram Mehta", vendor: "FreshRide", reason: "Allergic to fragrance", status: "Processed", amount: 350 },
  
  
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
      // Ensure amount is treated as a number
      const amount = typeof item.amount === 'number' ? item.amount : Number(item.amount);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  // Pagination logic
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
      <h1 className="text-[#232832] text-xl font-bold">Returns Report</h1>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="px-3 py-1 rounded w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            className="px-3 py-1 rounded w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            className="px-3 py-1 rounded w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {uniqueStatuses.map((status, idx) => (
              <option key={idx} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Vendor</label>
          <select
            className="px-3 py-1 rounded w-full"
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
          className="bg-gray-800 text-white px-4 py-2 rounded whitespace-nowrap"
        >
          Apply Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 text-left px-2">Date</th>
              <th className="py-4 text-left px-2">Return ID</th>
              <th className="py-4 text-left px-2">Order ID</th>
              <th className="py-4 text-left px-2">Product</th>
              <th className="py-4 text-left px-2">Buyer</th>
              <th className="py-4 text-left px-2">Vendor</th>
              <th className="py-4 text-left px-2">Reason</th>
              <th className="py-4 text-left px-2">Amount</th>
              <th className="py-4 text-left px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="text-left">
                <td className="py-2 px-2">{item.date}</td>
                <td className="py-2 px-2">{item.returnId}</td>
                <td className="py-2 px-2">{item.orderId}</td>
                <td className="py-2 px-2">{item.product}</td>
                <td className="py-2 px-2">{item.buyer}</td>
                <td className="py-2 px-2">{item.vendor}</td>
                <td className="py-2 px-2">{item.reason}</td>
                <td className="py-2 px-2">{formatINR(item.amount)}</td>
                <td className="py-2 px-2 font-semibold">{item.status}</td>
              </tr>
            ))}
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-[#ECECF0] px-4 md:px-4 py-4 md:py-4 rounded-2xl w-full space-y-6">
    
      <div className="pt-2 text-right text-sm font-semibold">
        Total Refunded Amount: {formatINR(getTotalRefundAmount())}
      </div>
    </div>
    </div>
  );
}