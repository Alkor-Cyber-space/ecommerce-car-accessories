// src/pages/TaxReport.jsx
import React, { useEffect, useState } from "react";

export default function TaxReport() {
  const [taxData, setTaxData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const data = [
      {
        date: "2025-06-20",
        invoice: "INV-5423",
        product: "Vacuum Cleaner",
        taxType: "GST 18%",
        baseAmount: 1000,
        taxAmount: 180,
        totalAmount: 1180,
        state: "Maharashtra",
        buyerType: "Individual",
      },
      {
        date: "2025-06-21",
        invoice: "INV-5424",
        product: "Car Cover",
        taxType: "GST 12%",
        baseAmount: 1200,
        taxAmount: 144,
        totalAmount: 1344,
        state: "Delhi",
        buyerType: "Business",
      },
    ];
    setTaxData(data);
    setFilteredData(data);
  }, []);

  const filterByDate = () => {
    const filtered = taxData.filter((item) => {
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
      <h1 className="text-2xl font-bold">Tax Report</h1>

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
            <th className="border px-2 py-1">Invoice</th>
            <th className="border px-2 py-1">Product</th>
            <th className="border px-2 py-1">Tax Type</th>
            <th className="border px-2 py-1">Base Amount</th>
            <th className="border px-2 py-1">Tax</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">State</th>
            <th className="border px-2 py-1">Buyer Type</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.date}</td>
              <td className="border px-2 py-1">{item.invoice}</td>
              <td className="border px-2 py-1">{item.product}</td>
              <td className="border px-2 py-1">{item.taxType}</td>
              <td className="border px-2 py-1">₹{item.baseAmount.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">₹{item.taxAmount.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">₹{item.totalAmount.toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">{item.state}</td>
              <td className="border px-2 py-1">{item.buyerType}</td>
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
