import React, { useEffect, useState } from "react";

export default function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const data = [
      {
        date: "2025-06-20",
        orderId: "#ORD1023",
        product: "Engine Oil",
        vendor: "AutoZone",
        buyer: "John Doe",
        qty: 2,
        price: 850,
        total: 1700,
        commission: 170,
        earnings: 1530,
      },
      {
        date: "2025-06-21",
        orderId: "#ORD1024",
        product: "Car Cover",
        vendor: "CoverPro",
        buyer: "Jane Smith",
        qty: 1,
        price: 1200,
        total: 1200,
        commission: 120,
        earnings: 1080,
      },
      {
        date: "2025-06-22",
        orderId: "#ORD1025",
        product: "Car Battery",
        vendor: "CarPower",
        buyer: "James Brown",
        qty: 3,
        price: 4200,
        total: 12600,
        commission: 1260,
        earnings: 11340,
      },
    ];
    setSalesData(data);
    setFilteredData(data);
  }, []);

  const filterDataByDate = () => {
    const filtered = salesData.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const formatINR = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const getTotalRevenue = () =>
    filteredData.reduce((acc, item) => acc + item.total, 0);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-[#232832] text-xl font-bold">Sales Report</h1>

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
              <th className="py-4 text-left px-2">Date</th>
              <th className="py-4 text-left px-2">Order ID</th>
              <th className="py-4 text-left px-2">Product</th>
              <th className="py-4 text-left px-2">Vendor</th>
              <th className="py-4 text-left px-2">Buyer</th>
              <th className="py-4 text-left px-2">Qty</th>
              <th className="py-4 text-left px-2">Price</th>
              <th className="py-4 text-left px-2">Total</th>
              <th className="py-4 text-left px-2">Commission</th>
              <th className="py-4 text-left px-2">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="text-left">
                <td className="py-2 px-2">{item.date}</td>
                <td className="py-2 px-2">{item.orderId}</td>
                <td className="py-2 px-2">{item.product}</td>
                <td className="py-2 px-2">{item.vendor}</td>
                <td className="py-2 px-2">{item.buyer}</td>
                <td className="py-2 px-2">{item.qty}</td>
                <td className="py-2 px-2">{formatINR(item.price)}</td>
                <td className="py-2 px-2">{formatINR(item.total)}</td>
                <td className="py-2 px-2">{formatINR(item.commission)}</td>
                <td className="py-2 px-2">{formatINR(item.earnings)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold border-t border-gray-200">
              <td className="py-2 px-2 text-left">Total Revenue</td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2">{formatINR(getTotalRevenue())}</td>
              <td className="py-2 px-2"></td>
              <td className="py-2 px-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 border border-gray-300 rounded ${
              currentPage === i + 1 ? "bg-[#5737B4] text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}
