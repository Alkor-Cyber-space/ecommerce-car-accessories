import React, { useState, useMemo, useEffect } from "react";
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
import { InventorystatsAPi } from "../../../services/allAPI";

const defaultStats = [
    { label: "Total Products", key: "total_products", icon: <FaBoxes />, color: "bg-blue-100 text-blue-600" },
    { label: "In Stock", key: "in_stock", icon: <FaCheckCircle />, color: "bg-green-100 text-green-600" },
    { label: "Low Stock", key: "low_stock", icon: <FaExclamationTriangle />, color: "bg-yellow-100 text-yellow-600" },
    { label: "Out of Stock", key: "out_of_stock", icon: <FaWarehouse />, color: "bg-red-100 text-red-600" },
];

const COLORS = ["#1E3A8A", "#2563EB", "#38BDF8", "#0EA5E9"]; // blue shades

export default function InventoryOverview() {
    const [timeRange, setTimeRange] = useState("All");
    const [year, setYear] = useState(new Date().getFullYear());
    const [category, setCategory] = useState("All");
    const [vendor, setVendor] = useState("All");

    const [stats, setStats] = useState(null);
    const [distribution, setDistribution] = useState([]);
    const [movement, setMovement] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventoryStats = async () => {
            try {
                setLoading(true);
                const response = await InventorystatsAPi();

                if (response) {
                    setStats(response);

                    if (response.stock_by_category) {
                        const formattedDistribution = Object.entries(response.stock_by_category).map(
                            ([key, value]) => ({
                                name: key,
                                value: value,
                            })
                        );
                        setDistribution(formattedDistribution);
                    } else {
                        setDistribution([]);
                    }

                    if (response.stock_movement && Array.isArray(response.stock_movement)) {
                        setMovement(response.stock_movement);
                    } else {
                        setMovement([]);
                    }
                } else {
                    setStats({});
                    setDistribution([]);
                    setMovement([]);
                }
            } catch (error) {
                console.error("Error fetching inventory stats:", error);
                setStats({});
                setDistribution([]);
                setMovement([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryStats();
    }, []);

    const filteredStockMovement = useMemo(() => {
        return movement.filter((entry) => {
            const entryDate = new Date(entry.date);
            const entryMonth = String(entryDate.getMonth() + 1).padStart(2, "0");
            const entryYear = entryDate.getFullYear();

            const matchMonth = timeRange === "All" || entryMonth === timeRange;
            const matchYear = String(entryYear) === String(year);
            const matchCategory = category === "All" || entry.category === category;
            const matchVendor = vendor === "All" || entry.vendor === vendor;

            return matchMonth && matchYear && matchCategory && matchVendor;
        });
    }, [timeRange, year, category, vendor, movement]);

    const filteredStockDistribution = useMemo(() => {
        if (category === "All") return distribution;
        const match = distribution.find((entry) => entry.name === category);
        if (!match) return [];
        const total = distribution.reduce((sum, item) => sum + item.value, 0);
        return [
            { name: match.name, value: match.value },
            { name: "Others", value: total - match.value },
        ];
    }, [category, distribution]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen rounded-2xl">
            <h1 className="text-2xl font-bold text-[#5737B4] mb-8">Inventory Overview</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl shadow mb-6">
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
                            return (
                                <option key={monthNum} value={monthNum}>
                                    {monthName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Year</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {Array.from(new Set(movement.map((entry) => new Date(entry.date).getFullYear())))
                            .sort((a, b) => b - a)
                            .map((yr) => (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {distribution.map((item) => (
                            <option key={item.name} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* <div>
                    <label className="block text-sm text-gray-600 mb-1">Vendor</label>
                    <select
                        className="p-2 border rounded w-full"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                    >
                        <option value="All">All Vendors</option>
                        {[...new Set(movement.map((m) => m.vendor))].map((vendor) => (
                            <option key={vendor} value={vendor}>
                                {vendor}
                            </option>
                        ))}
                    </select>
                </div> */}
            </div>

            {/* KPI Cards */}
            {loading ? (
                <p className="text-gray-500 text-center py-6">Loading inventory data...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {defaultStats.map((item, idx) => (
                        <div key={idx} className={`rounded-2xl p-4 shadow flex items-center gap-4 ${item.color}`}>
                            <div className="text-3xl">{item.icon}</div>
                            <div>
                                <div className="text-xl font-semibold">
                                    {stats?.[item.key] ?? 0}
                                </div>
                                <div className="text-sm">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock by Category</h2>
                    {Array.isArray(filteredStockDistribution) && filteredStockDistribution.length > 0 ? (
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
                    ) : (
                        <p className="text-gray-500 text-center">No category data available</p>
                    )}
                </div>

                {/* Bar Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock Movement Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={filteredStockMovement}
                            margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fill: "#6B7280" }} />
                            <YAxis tick={{ fill: "#6B7280" }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "white", borderColor: "#E5E7EB" }}
                                labelStyle={{ color: "#374151" }}
                            />
                            <Legend iconType="circle" />
                            <defs>
                                <linearGradient id="addedGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#406EDC" stopOpacity={0.95} />
                                    <stop offset="95%" stopColor="#4F8DFF 406EDC" stopOpacity={0.85} />
                                </linearGradient>

                                <linearGradient id="soldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6DACA1" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#8ED0C1" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <Bar dataKey="stock_added" fill="url(#addedGradient)" name="Stock Added" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="stock_sold" fill="url(#soldGradient)" name="Stock Sold" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
