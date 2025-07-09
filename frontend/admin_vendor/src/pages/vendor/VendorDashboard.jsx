import React, { useState } from "react";
import {
  FaBoxOpen,
  FaClipboardList,
  FaMoneyBillWave,
  FaTags,
  FaBell,
  FaCogs
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import RevenueChart from "../../components/vendor/RevenueChart";
import WeeklyOrderChart from "../../components/vendor/OrdrerChart";

const cards = [
  {
    title: "Total Products",
    count: 132,
    icon: <FaBoxOpen className="text-blue-500 text-2xl" />,
    bg: "bg-blue-50",
  },
  {
    title: "Pending Orders",
    count: 18,
    icon: <FaClipboardList className="text-yellow-500 text-2xl" />,
    bg: "bg-yellow-50",
  },
  {
    title: "Revenue This Month",
    count: "$14,320",
    icon: <FaMoneyBillWave className="text-green-500 text-2xl" />,
    bg: "bg-green-50",
  },
  {
    title: "Active Promotions",
    count: 5,
    icon: <FaTags className="text-pink-500 text-2xl" />,
    bg: "bg-pink-50",
  },
];

const monthWiseBarData = {
  January: [
    { name: 'Week 1', orders: 22 },
    { name: 'Week 2', orders: 30 },
    { name: 'Week 3', orders: 28 },
    { name: 'Week 4', orders: 34 },
  ],
  February: [
    { name: 'Week 1', orders: 18 },
    { name: 'Week 2', orders: 25 },
    { name: 'Week 3', orders: 20 },
    { name: 'Week 4', orders: 26 },
  ],
  March: [
    { name: 'Week 1', orders: 30 },
    { name: 'Week 2', orders: 45 },
    { name: 'Week 3', orders: 38 },
    { name: 'Week 4', orders: 50 },
  ]
};


const pieData = [
  { name: 'Electronics', value: 40 },
  { name: 'Car Care', value: 30 },
  { name: 'Accessories', value: 20 },
  { name: 'Others', value: 10 },
];

const pieColors = ["#6366f1", "#f97316", "#10b981", "#facc15"];

const notifications = [
  "2 new orders placed",
  "Product 'Alloy Wheels' stock is low",
  "3 returns pending approval",
  "New promotion approved"
];

const VendorDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("March");

  return (
    <div className="space-y-10 h-full bg-[#ECECF0] px-6 py-10 rounded-2xl">
      <div className="text-2xl font-semibold text-gray-800">
        👋 Welcome back, Vendor!
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl shadow-md border ${card.bg} flex items-center gap-4`}
          >
            <div className="p-3 bg-white rounded-full shadow">
              {card.icon}
            </div>
            <div>
              <div className="text-sm text-gray-500">{card.title}</div>
              <div className="text-xl font-bold text-gray-800">{card.count}</div>
            </div>
          </div>
        ))}
      </div>
  {/* Bar Chart */}
        {/* <div className="bg-white p-6 rounded-xl shadow-md">
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      {/* Charts Section */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
  <div className="md:col-span-2 lg:col-span-3">
    <RevenueChart />
  </div>

  {/* Pie Chart: span 2 of 5 columns */}
  <div className="md:col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>


      {/* Notifications + Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBell className="text-yellow-500" /> Notifications
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {notifications.map((note, idx) => (
              <li key={idx} className="bg-yellow-50 p-3 rounded-md shadow-sm">
                {note}
              </li>
            ))}
          </ul>
        </div>

        <WeeklyOrderChart selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          monthWiseBarData={monthWiseBarData} />
      </div>
    </div>
  );
};

export default VendorDashboard;
