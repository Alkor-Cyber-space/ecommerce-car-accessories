import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Sample Data
const vendorData = [
  { name: "ABC Automobiles", revenue: 125200, orders: 85000, growth: 28.5 },
  { name: "DriveDeck", revenue: 102000, orders: 72000, growth: 18.7 },
  { name: "MotiveGear", revenue: 96000, orders: 65000, growth: 14.3 },
  { name: "Gearify", revenue: 110000, orders: 77000, growth: 21.9 },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find((p) => p.dataKey === "revenue")?.value || 0;
    const growth = payload[0].payload.growth || 0;
    const name = payload[0].payload.name;

    return (
      <div className="bg-[#004C6D] text-white rounded-xl p-4 shadow-lg w-[180px]">
        <p className="text-xl font-semibold">₹{revenue.toLocaleString()}</p>
        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-[1px] rounded-full mt-1 inline-block">
          {growth}% ⬈
        </span>
        <p className="mt-1 text-sm text-[#C0E8FF]">{name}</p>
      </div>
    );
  }
  return null;
};

// Chart Component
export default function VendorsVsRevenue() {
  return (
    <div className="bg-white border border-[#D8D8D8] p-5">
      <h3 className="text-sm font-semibold mb-3">Vendors vs Revenue</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={vendorData} barGap={6}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(val) => `${val / 1000}K`} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="#AE7AFF" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="revenue" fill="#5737B4" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
