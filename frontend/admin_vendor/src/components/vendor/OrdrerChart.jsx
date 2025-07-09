import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const WeeklyOrderChart = ({ selectedMonth, setSelectedMonth, monthWiseBarData }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Weekly Order Volume</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          {Object.keys(monthWiseBarData).map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthWiseBarData[selectedMonth]}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyOrderChart;
