import React, { useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded p-2 text-sm shadow">
        <strong>{payload[0].payload.product_name}</strong>: {payload[0].value} sold
      </div>
    );
  }
  return null;
};

export default function TopProductsChart({ monthly_top_products }) {
  const monthKeys = Object.keys(monthly_top_products || {});

  // Default to current month if available, else first key
  const currentMonthKey =
    new Date().toISOString().slice(0, 7) ||
    (monthKeys.length > 0 ? monthKeys[0] : "");

  const [selectedMonth, setSelectedMonth] = useState(
    monthKeys.includes(currentMonthKey) ? currentMonthKey : monthKeys[0] || ""
  );

  const data = monthly_top_products?.[selectedMonth] || [];

  return (
    <div className="bg-white border-l border-l-[#D8D8D8] p-5 h-full">
      {/* Header with month selector */}
      <div className="flex justify-between items-center mb-4 p-2">
        <h2 className="text-gray-800 flex items-center gap-1">
          <FaBoxOpen />
          Top Products ({selectedMonth})
        </h2>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {monthKeys.length > 0 ? (
            monthKeys.map((month) => (
              <option key={month} value={month}>
                {new Date(month + "-01").toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })}
              </option>
            ))
          ) : (
            <option>No data</option>
          )}
        </select>
      </div>

      {/* Chart */}
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="product_name"
              tick={{ fill: "#555", fontSize: 11 }}
              interval={0}
              angle={-5}
              textAnchor="end"
              tickFormatter={(val) => {
                if (val == null) return "";
                let candidate = val;
                if (typeof val === "object") {
                  candidate = val.product_name ?? val.name ?? val.label ?? "";
                }
                const str = String(candidate);
                const words = str.split(/\s+/).filter(Boolean);
                return words.length > 2 ? `${words.slice(0, 2).join(" ")}...` : str;
              }}
            />


            <YAxis tick={{ fill: "#555", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total_sold" fill="#AA33FF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <span>{data.reduce((sum, p) => sum + p.total_sold, 0)} total sold</span>
        <a href="#" className="text-purple-600 text-sm font-semibold">
          Download Report
        </a>
      </div>
    </div>
  );
}
