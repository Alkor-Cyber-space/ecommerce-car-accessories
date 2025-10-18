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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const [showMenu, setShowMenu] = useState(false); // 🔹 Dropdown toggle

  const data = monthly_top_products?.[selectedMonth] || [];

  // 🔹 Generate PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Top Products Report (${selectedMonth})`, 14, 16);

    if (data.length > 0) {
      autoTable(doc, {
        head: [["Product Name", "Total Sold"]],
        body: data.map((item) => [item.product_name, item.total_sold]),
        startY: 25,
      });
    } else {
      doc.text("No data available.", 14, 30);
    }

    doc.save(`Top_Products_Report_${selectedMonth}.pdf`);
  };

  // 🔹 Generate Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        "Product Name": item.product_name,
        "Total Sold": item.total_sold,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Top Products");
    XLSX.writeFile(workbook, `Top_Products_Report_${selectedMonth}.xlsx`);
  };

  return (
    <div className="bg-white border-l border-l-[#D8D8D8] p-5 h-full relative">
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
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600 relative">
        <span>{data.reduce((sum, p) => sum + p.total_sold, 0)} total sold</span>

        {/* 🔹 Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-violet-600 text-sm  hover:underline"
          >
            Download Report
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md z-10">
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                PDF
              </button>
              <button
                onClick={() => {
                  handleDownloadExcel();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                Excel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
