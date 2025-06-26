// src/pages/ReturnsReport.jsx
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
      {
        date: "2025-06-18",
        returnId: "RET1021",
        orderId: "ORD1005",
        product: "Brake Pads",
        buyer: "Siddharth Verma",
        vendor: "AutoMart",
        reason: "Damaged item",
        status: "Processed",
        amount: 850,
      },
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
      ,
      {
        date: "2025-06-21",
        returnId: "RET1022",
        orderId: "ORD1010",
        product: "Seat Covers",
        buyer: "Neha Sharma",
        vendor: "CoverPro",
        reason: "Wrong size",
        status: "Pending",
        amount: 1200,
      },
      {
        date: "2025-06-22",
        returnId: "RET1023",
        orderId: "ORD1011",
        product: "Wiper Blades",
        buyer: "Rahul Kumar",
        vendor: "RainStop",
        reason: "Not working",
        status: "Rejected",
        amount: 450,
      },
      {
        date: "2025-06-23",
        returnId: "RET1024",
        orderId: "ORD1012",
        product: "Floor Mats",
        buyer: "Anjali Mehra",
        vendor: "MatMaster",
        reason: "Color mismatch",
        status: "Processed",
        amount: 950,
      },
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

  const getTotalRefundAmount = () => {
    return filteredData.reduce((total, item) => total + item.amount, 0);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const uniqueVendors = [...new Set(returnsData.map(item => item.vendor))];
  const uniqueStatuses = [...new Set(returnsData.map(item => item.status))];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Returns Report</h1>

      <div className="flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            className="border px-3 py-1 rounded"
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
            className="border px-3 py-1 rounded"
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
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Apply Filter
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Return ID</th>
            <th className="border px-2 py-1">Order ID</th>
            <th className="border px-2 py-1">Product</th>
            <th className="border px-2 py-1">Buyer</th>
            <th className="border px-2 py-1">Vendor</th>
            <th className="border px-2 py-1">Reason</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.date}</td>
              <td className="border px-2 py-1">{item.returnId}</td>
              <td className="border px-2 py-1">{item.orderId}</td>
              <td className="border px-2 py-1">{item.product}</td>
              <td className="border px-2 py-1">{item.buyer}</td>
              <td className="border px-2 py-1">{item.vendor}</td>
              <td className="border px-2 py-1">{item.reason}</td>
              <td className="border px-2 py-1">₹{item.amount.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1 font-semibold">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center pt-4">
        <p className="text-sm">
          Showing {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length}
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="pt-2 text-right text-sm font-semibold">
        Total Refunded Amount: ₹{getTotalRefundAmount().toLocaleString("en-IN")}
      </div>
    </div>
  );
}
