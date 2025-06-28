import React, { useState } from "react";
import {
    FaBoxOpen,
    FaClipboardList,
    FaMoneyBillWave,
    FaTags,
    FaBell,
    FaChartBar,
    FaArrowUp,
    FaArrowDown
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
import ProductPerformanceTable from "./PerProductsMetrics";

const performanceDataByYear = {
    2023: [
        { month: 'Jan', conversion: 3.2, returns: 1.8, rating: 2.1, dispatch: 2.1 },
        { month: 'Feb', conversion: 2.5, returns: 2.1, rating: 2.6, dispatch: 2.4 },
        { month: 'Mar', conversion: 3.9, returns: 2.9, rating: 3.7, dispatch: 3.8 },
        { month: 'Apr', conversion: 4.9, returns: 3.0, rating: 4.3, dispatch: 1.7 },
        { month: 'May', conversion: 4.2, returns: 2.6, rating: 4.6, dispatch: 1.1 },
        { month: 'June', conversion: 5.6, returns: 2.9, rating: 5, dispatch: 1.9 },
    ],
    2024: [
        { month: 'Jan', conversion: 3.4, returns: 1.6, rating: 3.2, dispatch: 2.2 },
        { month: 'Feb', conversion: 2.9, returns: 2.0, rating: 3.5, dispatch: 2.5 },
        { month: 'Mar', conversion: 4.1, returns: 2.3, rating: 4.0, dispatch: 2.2 },
        { month: 'Apr', conversion: 4.8, returns: 2.7, rating: 4.4, dispatch: 1.5 },
        { month: 'May', conversion: 5.0, returns: 2.5, rating: 4.8, dispatch: 1.0 },
        { month: 'June', conversion: 5.3, returns: 2.4, rating: 5, dispatch: 1.8 },
    ],
};

const PerformanceMetrics = () => {
    const [selectedYear, setSelectedYear] = useState("2024");

    return (
        <div className="space-y-10">
            <div className="text-2xl font-semibold text-gray-800 mb-6">
                📊 Vendor Performance Metrics
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-xl shadow-md">
                    {/* Percentage of users making a purchase. */}
                    <div className="text-gray-500 text-sm">Conversion Rate</div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-2xl font-bold text-blue-700">4.1%</div>
                        <FaArrowUp className="text-green-500" />
                    </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl shadow-md">
                    <div className="text-gray-500 text-sm">Return Rate</div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-2xl font-bold text-yellow-700">2.0%</div>
                        <FaArrowDown className="text-red-500" />
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl shadow-md">
                    <div className="text-gray-500 text-sm">Avg. Product Rating</div>
                    <div className="text-2xl font-bold text-green-700 mt-2">4.6 / 5</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl shadow-md">
                    <div className="text-gray-500 text-sm">Avg. Dispatch Time</div>
                    <div className="text-2xl font-bold text-purple-700 mt-2">1.7 Days</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Conversion Rate Over Time</h2>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                        >
                            {Object.keys(performanceDataByYear).map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceDataByYear[selectedYear]}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="conversion"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Conversion %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Rating, Dispatch Time & Return Rate</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceDataByYear[selectedYear]}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="rating" fill="#10b981" name="Avg. Rating" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="dispatch" fill="#8b5cf6" name="Dispatch Days" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="returns" fill="#f59e0b" name="Return %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <ProductPerformanceTable />
            </div>
        </div>
    );
};

export default PerformanceMetrics;
