import React, { useState, useMemo } from "react";
import {
    FaBoxes,
    FaExclamationTriangle,
    FaCheckCircle,
    FaWarehouse,
} from "react-icons/fa";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";

// Dummy KPI data
const stockStats = [
    { label: "Total Products", value: 320, icon: <FaBoxes />, color: "bg-blue-100 text-blue-600" },
    { label: "In Stock", value: 280, icon: <FaCheckCircle />, color: "bg-green-100 text-green-600" },
    { label: "Low Stock", value: 25, icon: <FaExclamationTriangle />, color: "bg-yellow-100 text-yellow-600" },
    { label: "Out of Stock", value: 15, icon: <FaWarehouse />, color: "bg-red-100 text-red-600" },
];

const allStockDistribution = [
    { name: "Engine", value: 120 },
    { name: "Brakes", value: 80 },
    { name: "Electrical", value: 50 },
    { name: "Body Parts", value: 70 },
];

const COLORS = ["#6366F1", "#E5E7EB"];

const allStockMovement = [
    { date: "May 5 2021", added: 30, sold: 20, category: "Engine", vendor: "XYZ Motors" },
    { date: "Jun 5 2022", added: 70, sold: 35, category: "Brakes", vendor: "Autoplus" },
    { date: "Jun 10 2023", added: 20, sold: 15, category: "Electrical", vendor: "XYZ Motors" },
    { date: "Jun 15 2023", added: 50, sold: 35, category: "Engine", vendor: "Autoplus" },
    { date: "Jun 20 2024", added: 80, sold: 40, category: "Brakes", vendor: "XYZ Motors" },
    { date: "Jun 22 2022", added: 10, sold: 5, category: "Body Parts", vendor: "Autoplus" },
    { date: "Aug 22 2025", added: 80, sold: 40, category: "Brakes", vendor: "XYZ Motors" },
    { date: "Aug 22 2025", added: 80, sold: 40, category: "Engine", vendor: "Autoplus" },
    { date: "Dec 22 2025", added: 80, sold: 40, category: "Engine", vendor: "Autoplus" },

];

export default function InventoryOverview() {
    const [timeRange, setTimeRange] = useState("All");
    const [year, setYear] = useState(new Date().getFullYear());
    const [category, setCategory] = useState("All");
    const [vendor, setVendor] = useState("All");

    const filteredStockMovement = useMemo(() => {
        return allStockMovement.filter((entry) => {
            const entryDate = new Date(entry.date);
            const entryMonth = String(entryDate.getMonth() + 1).padStart(2, "0");
            const entryYear = entryDate.getFullYear();
            const matchMonth = timeRange === "All" || entryMonth === timeRange;
            const matchYear = String(entryYear) === String(year);
            const matchCategory = category === "All" || entry.category === category;
            const matchVendor = vendor === "All" || entry.vendor === vendor;

            return matchMonth && matchYear && matchCategory && matchVendor;
        });
    }, [timeRange, year, category, vendor]);

    const filteredStockDistribution = useMemo(() => {
        if (category === "All") return allStockDistribution;
        const match = allStockDistribution.find((entry) => entry.name === category);
        if (!match) return [];
        const total = allStockDistribution.reduce((sum, item) => sum + item.value, 0);
        return [
            { name: match.name, value: match.value },
            { name: "Others", value: total - match.value },
        ];
    }, [category]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Inventory Overview</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow mb-6">
                {/* Month Filter */}
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Month</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="All">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => {
                            const monthNum = String(i + 1).padStart(2, "0");
                            const monthName = new Date(0, i).toLocaleString("default", { month: "long" });
                            return <option key={monthNum} value={monthNum}>{monthName}</option>;
                        })}
                    </select>
                </div>

                {/* Year Filter */}
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Year</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {Array.from(
                            new Set(
                                allStockMovement.map((entry) => {
                                    const parsedDate = new Date(entry.date);
                                    return parsedDate.getFullYear();
                                })
                            )
                        )
                            .sort((a, b) => b - a) // sort descending if needed
                            .map((yr) => (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            ))}
                    </select>

                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Engine">Engine</option>
                        <option value="Brakes">Brakes</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Body Parts">Body Parts</option>
                    </select>
                </div>

                {/* Vendor Filter */}
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Vendor</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                    >
                        <option value="All">All Vendors</option>
                        <option value="XYZ Motors">XYZ Motors</option>
                        <option value="Autoplus">Autoplus</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {stockStats.map((item, idx) => (
                    <div
                        key={idx}
                        className={`rounded-2xl p-4 shadow flex items-center gap-4 ${item.color}`}
                    >
                        <div className="text-3xl">{item.icon}</div>
                        <div>
                            <div className="text-xl font-semibold">{item.value}</div>
                            <div className="text-sm">{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={filteredStockDistribution}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {filteredStockDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock Movement Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={filteredStockMovement} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fill: "#6B7280" }} />
                            <YAxis tick={{ fill: "#6B7280" }} />
                            <Tooltip contentStyle={{ backgroundColor: "white", borderColor: "#E5E7EB" }} labelStyle={{ color: "#374151" }} />
                            <Legend iconType="circle" />
                            <Bar dataKey="added" fill="#10B981" name="Stock Added" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="sold" fill="#6366F1" name="Stock Sold" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
