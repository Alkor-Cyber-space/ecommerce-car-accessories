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

const data = [
  { time: "12 AM", value: 10 },
  { time: "2 AM", value: 95 },
  { time: "4 AM", value: 140 },
  { time: "8 AM", value: 70 },
  { time: "12 PM", value: 230 },
  { time: "4 PM", value: 80 },
  { time: "7 PM", value: 150 },
  { time: "11 PM", value: 20 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded p-2 text-sm shadow">
        <strong>{payload[0].payload.time}</strong>: {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function RefundReturnStats() {
  return (
    <div className="bg-white border-l border-l-[#D8D8D8] p-5 h-full">
      <div className="flex justify-between items-center mb-4 p-2">
        <h2 className=" text-gray-800 flex items-center gap-1">
          <PiTimerFill />
          Refund and return statistics
        </h2>
        <div className="text-green-600 font-medium bg-green-100 px-3 py-1  text-sm">
          12.6% ↓
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 12 }} />
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
        <span>10k visitors</span>
        <a href="#" className="text-purple-600 text-sm font-semibold">
          Download Report
        </a>
      </div>
    </div>
  );
}
