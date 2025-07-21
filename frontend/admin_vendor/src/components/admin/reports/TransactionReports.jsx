import React, { useEffect, useState } from "react";

export default function TransactionReport() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

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
        gatewayFee: 50,
      },
      {
        date: "2025-06-21",
        orderId: "ORD1002",
        buyer: "Amit Kumar",
        paymentMethod: "Cash on Delivery",
        status: "Pending",
        amount: 850,
        refund: 0,
        gatewayFee: 0,
      },
      {
        date: "2025-06-22",
        orderId: "ORD1003",
        buyer: "Priya S.",
        paymentMethod: "Paytm",
        status: "Refunded",
        amount: 2400,
        refund: 2400,
        gatewayFee: 0,
      },
    ];
    setTransactions(data);
    setFilteredData(data);
  }, []);

  const formatINR = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const filterDataByDate = () => {
    const filtered = transactions.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const indexOfFirstRow = (currentPage - 1) * rowsPerPage + 1;
  const indexOfLastRow = Math.min(currentPage * rowsPerPage, filteredData.length);

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-[#232832] text-xl font-bold">Transaction Report</h1>

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
              <th className="py-4 px-2 text-left">Date</th>
              <th className="py-4 px-2 text-left">Order ID</th>
              <th className="py-4 px-2 text-left">Buyer</th>
              <th className="py-4 px-2 text-left">Payment Method</th>
              <th className="py-4 px-2 text-left">Status</th>
              <th className="py-4 px-2 text-left">Amount</th>
              <th className="py-4 px-2 text-left">Refund</th>
              <th className="py-4 px-2 text-left">Gateway Fee</th>
              <th className="py-4 px-2 text-left">Net Received</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const netReceived = item.amount - (item.refund + item.gatewayFee);
              return (
                <tr key={index}>
                  <td className="py-2 px-2">{item.date}</td>
                  <td className="py-2 px-2">{item.orderId}</td>
                  <td className="py-2 px-2">{item.buyer}</td>
                  <td className="py-2 px-2">{item.paymentMethod}</td>
                  <td className="py-2 px-2 font-medium">{item.status}</td>
                  <td className="py-2 px-2">{formatINR(item.amount)}</td>
                  <td className="py-2 px-2">{formatINR(item.refund)}</td>
                  <td className="py-2 px-2">{formatINR(item.gatewayFee)}</td>
                  <td className="py-2 px-2">{formatINR(netReceived)}</td>
                </tr>
              );
            })}
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
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
        