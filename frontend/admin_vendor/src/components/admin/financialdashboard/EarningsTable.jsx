// src/components/EarningsTable.jsx
import React from "react";

const data = [
  {
    vendor: "AutoParts Inc.",
    orders: 120,
    totalSales: 150000,
    fee: 15000,
    payout: 135000,
  },
  {
    vendor: "SpeedZone",
    orders: 80,
    totalSales: 100000,
    fee: 10000,
    payout: 90000,
  },
];

export default function EarningsTable() {
  return (
    <div className="bg-white shadow p-4 rounded mt-4">
      <h2 className="text-lg font-semibold mb-4">Earnings by Vendor</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Vendor</th>
            <th className="p-2 border">Orders</th>
            <th className="p-2 border">Total Sales</th>
            <th className="p-2 border">Platform Fee</th>
            <th className="p-2 border">Net Payout</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="p-2 border">{row.vendor}</td>
              <td className="p-2 border">{row.orders}</td>
              <td className="p-2 border">₹{row.totalSales.toLocaleString()}</td>
              <td className="p-2 border">₹{row.fee.toLocaleString()}</td>
              <td className="p-2 border font-semibold">₹{row.payout.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
