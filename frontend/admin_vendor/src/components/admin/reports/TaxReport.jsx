import React, { useState } from "react";

const TaxReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const taxData = [
    {
      date: "2025-06-20",
      invoice: "INV-5423",
      product: "Vacuum Cleaner",
      taxType: "GST 18%",
      baseAmount: 1000,
      tax: 180,
      total: 1180,
      state: "Maharashtra",
      buyerType: "Individual",
    },
    {
      date: "2025-06-21",
      invoice: "INV-5424",
      product: "Car Cover",
      taxType: "GST 12%",
      baseAmount: 1200,
      tax: 144,
      total: 1344,
      state: "Delhi",
      buyerType: "Business",
    },
  ];

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-xl font-semibold mb-4">Tax Report</h1>

      {/* Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2 py-1 rounded"
          />
        </div>
        <div className="flex items-end">
          <button className="bg-gray-800 text-white px-4 py-2 rounded whitespace-nowrap">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Tax Type</th>
              <th className="p-3 text-left">Base Amount</th>
              <th className="p-3 text-left">Tax</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">Buyer Type</th>
            </tr>
          </thead>
          <tbody>
            {taxData.map((item, index) => (
              <tr key={index} className=" border-gray-200">
                <td className="p-3">{item.date}</td>
                <td className="p-3">{item.invoice}</td>
                <td className="p-3">{item.product}</td>
                <td className="p-3">{item.taxType}</td>
                <td className="p-3">₹{item.baseAmount.toLocaleString()}</td>
                <td className="p-3">₹{item.tax.toLocaleString()}</td>
                <td className="p-3">₹{item.total.toLocaleString()}</td>
                <td className="p-3">{item.state}</td>
                <td className="p-3">{item.buyerType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-gray-600">
        <div>Showing 1 - {taxData.length} of {taxData.length}</div>
        <div className="space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
            Prev
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxReport;
