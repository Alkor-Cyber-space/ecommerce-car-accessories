import React from "react";
import { PiTimerFill } from "react-icons/pi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function RecentOrdersStats({ recentOrders }) {
  // Prepare chart data: total_price per day
  const data = recentOrders.map((order) => ({
    day: new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }), // e.g., "Oct 8"
    value: parseFloat(order.total_price),
    status: order.status,
    payment_method: order.payment_method,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const order = payload[0].payload;
      return (
        <div className="bg-white border rounded p-2 text-sm shadow">
          <div><strong>Day:</strong> {order.day}</div>
          <div><strong>Total:</strong> ₹{order.value.toLocaleString()}</div>
          <div><strong>Status:</strong> {order.status}</div>
          <div><strong>Payment:</strong> {order.payment_method}</div>
        </div>
      );
    }
    return null;
  };

  const totalOrders = recentOrders.length;
  const totalSales = recentOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

  return (
    <div className="bg-white border-l border-l-[#D8D8D8] p-5 h-full">
      <div className="flex justify-between items-center mb-4 p-2">
        <h2 className="text-gray-800 flex items-center gap-1">
          <PiTimerFill />
          Recent Orders Statistics
        </h2>
        
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 12 }} />
            <YAxis tick={{ fill: "#555", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#AA33FF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <span>{totalOrders} orders | Total Sales: ₹{totalSales.toLocaleString()}</span>
        <a href="#" className="text-purple-600 text-sm font-semibold">
          Download Report
        </a>
      </div>
    </div>
  );
}
