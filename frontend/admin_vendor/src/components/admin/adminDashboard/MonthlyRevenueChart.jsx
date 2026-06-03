import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MdOutlineShowChart } from "react-icons/md";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded p-2 text-sm shadow">
        <strong>{payload[0].payload.month}</strong>: ₹
        {payload[0].value ? payload[0].value.toLocaleString() : 0}
      </div>
    );
  }
  return null;
};

export default function MonthlyRevenueChart({ data = [] }) {
  // Compute total revenue for optional display or stats if needed
  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-800 flex items-center gap-1 font-semibold">
          <MdOutlineShowChart className="text-purple-600" />
          Monthly Revenue
        </h2>
        
      </div>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={35}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#555", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#5737B4"
              radius={[6, 6, 0, 0]}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mt-3 text-xs text-gray-600">
        <span>Total months: {data.length}</span>
        <span className="text-gray-700 font-semibold">
          Total: ₹{totalRevenue.toLocaleString()}
        </span>
      </div>
    </div>
  );
}