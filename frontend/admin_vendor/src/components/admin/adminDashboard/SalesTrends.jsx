import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const SalesTrends = ({
  data = [], // incoming data from parent
  title = "",
  totalValue = 0,
  growth = 0,
  revenueLabel = "",
  expensesLabel = "",
  xKey = "month",
  yFormatter = (v) => `${v / 1000}K`,
  revenueColor = "#5737B4",
  expensesColor = "#00C2FF",
}) => {
  const [startDate, setStartDate] = useState(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31"));
  const [open, setOpen] = useState(false);

  // ✅ Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((item) => {
      let itemDate;
      if (item[xKey]?.length <= 3) {
        // Month abbreviations (e.g. "Jan")
        itemDate = new Date(`2024-${item[xKey]}-01`);
      } else if (!isNaN(new Date(item[xKey]))) {
        itemDate = new Date(item[xKey]);
      } else {
        return true; // fallback
      }

      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [data, startDate, endDate, xKey]);

  // ✅ Calculate filtered total (optional)
  const filteredTotal = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return filteredData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  }, [filteredData]);

  return (
    <div className="sm:p-2 text-black w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center my-6 gap-4">
        <div>
          <h2 className="text-base sm:text-lg text-gray-700 mb-1">{title}</h2>
          <div className="flex gap-3 items-center">
            <div className="text-2xl sm:text-3xl font-bold">
              ₹{filteredTotal.toLocaleString()}
            </div>
            {/* <div
              className={`flex items-center gap-1 text-sm sm:text-base mt-1 px-2 py-1 rounded ${
                growth >= 0
                  ? "text-green-600 bg-[#e6fff0]"
                  : "text-red-600 bg-[#ffe6e6]"
              }`}
            >
              {growth}% <FiArrowUpRight className="w-4 h-4" />
            </div> */}
          </div>
        </div>

        {/* Date Picker & Legend */}
        <div className="flex flex-col sm:flex-col sm:items-center gap-4">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded shadow"
            >
              <FaCalendarAlt />
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}{" "}
              -{" "}
              {endDate.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </button>

            {open && (
              <div className="absolute z-50 mt-2 flex flex-col sm:flex-col gap-4 bg-white p-4 rounded shadow">
                <div>
                  <p className="text-sm font-semibold mb-1 text-black">
                    Start Date
                  </p>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    inline
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1 text-black">
                    End Date
                  </p>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    inline
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex gap-5 items-center font-semibold">
            <span className="flex items-center text-sm gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: revenueColor }}
              ></div>
              {revenueLabel}
            </span>
            <span className="flex items-center text-sm gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: expensesColor }}
              ></div>
              {expensesLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={revenueColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={revenueColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={expensesColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={expensesColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} stroke="#505050" />
            <YAxis stroke="#505050" tickFormatter={yFormatter} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2A2A3E",
                border: "none",
                color: "#fff",
              }}
              formatter={(value, name) => [`₹${value}`, name]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name={revenueLabel}
              stroke={revenueColor}
              fill="url(#colorRevenue)"
              strokeWidth={1.5}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name={expensesLabel}
              stroke={expensesColor}
              fill="url(#colorExpenses)"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrends;