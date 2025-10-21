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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find((p) => p.dataKey === "total_revenue")?.value || 0;
    const items = payload.find((p) => p.dataKey === "total_items")?.value || 0;
    const name = payload[0].payload.vendor_email;

    return (
      <div className="bg-[#6a3ab7] text-white rounded-xl p-4 shadow-lg w-[180px]">
        {/* Show total revenue */}
        <span className="text-xs font-medium bg-blue-100 text-[#463c5f] px-2 py-1 rounded-full mt-1 inline-block">
          Revenue: {revenue}
        </span>       
         {/* <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-[1px] rounded-full mt-1 inline-block">
          Items: {items}
        </span> */}

      </div>
    );
  }
  return null;
};

export default function VendorsVsRevenue({ vendorData }) {
  const shortenName = (name, maxLength = 9) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
  };
  return (
    <div className="bg-white border-l border-[#D8D8D8] p-5">
      <h3 className="text-sm font-semibold mb-3">Vendors vs Revenue</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={vendorData} barGap={6}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="vendor_email" tick={{ fontSize: 12 }} tickFormatter={(value) => shortenName(value)} />
          <YAxis tickFormatter={(val) => `${val / 1000}K`} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total_items" fill="#AE7AFF" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="total_revenue" fill="#5737B4" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

