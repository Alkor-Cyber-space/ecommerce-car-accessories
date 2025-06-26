// src/pages/Transaction.jsx
import React, { useEffect, useState } from "react";

export default function Transaction() {
  const [transactionData, setTransactionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const data = [
      {
        date: "2025-06-20",
        orderId: "ORD1001",
        buyer: "Ravi Sharma",
        paymentMethod: "Razorpay",
        status: "Success",
        amount: 3200,
        refund: 0,
        fee: 50,
        netReceived: 3150,
      },
      {
        date: "2025-06-21",
        orderId: "ORD1002",
        buyer: "Amit Kumar",
        paymentMethod: "Cash on Delivery",
        status: "Pending",
        amount: 850,
        refund: 0,
        fee: 0,
        netReceived: 0,
      },
      {
        date: "2025-06-22",
        orderId: "ORD1003",
        buyer: "Priya S.",
        paymentMethod: "Paytm",
        status: "Refunded",
        amount: 2400,
        refund: 2400,
        fee: 0,
        netReceived: 0,
      },
    ];
    setTransactionData(data);
    setFilteredData(data);
  }, []);

  const filterByDate = () => {
    const filtered = transactionData.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Transaction Report</h1>

      <div className="flex gap-4 items-end">
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
        <button
          onClick={filterByDate}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Apply Filter
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Order ID</th>
            <th className="border px-2 py-1">Buyer</th>
            <th className="border px-2 py-1">Payment Method</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Refund</th>
            <th className="border px-2 py-1">Gateway Fee</th>
            <th className="border px-2 py-1">Net Received</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.date}</td>
              <td className="border px-2 py-1">{item.orderId}</td>
              <td className="border px-2 py-1">{item.buyer}</td>
              <td className="border px-2 py-1">{item.paymentMethod}</td>
              <td className="border px-2 py-1 font-semibold">{item.status}</td>
              <td className="border px-2 py-1">₹{item.amount.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">₹{item.refund.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">₹{item.fee.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">₹{item.netReceived.toLocaleString("en-IN")}</td>
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
    </div>
  );
}
