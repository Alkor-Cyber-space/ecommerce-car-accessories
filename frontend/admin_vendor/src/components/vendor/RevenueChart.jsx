import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = {
  2023: [
    { month: "Jan", revenue: 7000 },
    { month: "Feb", revenue: 8200 },
    { month: "Mar", revenue: 9600 },
    { month: "Apr", revenue: 10100 },
  ],
  2024: [
    { month: "Jan", revenue: 9400 },
    { month: "Feb", revenue: 10000 },
    { month: "Mar", revenue: 11700 },
    { month: "Apr", revenue: 12400 },
  ],
};

const RevenueChart = () => {
  const [selectedYear, setSelectedYear] = useState("2024");

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          {Object.keys(revenueData).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueData[selectedYear]}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
