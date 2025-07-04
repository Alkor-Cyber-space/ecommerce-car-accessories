import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';
// import {
//     LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
// } from 'recharts';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

const data = [
    { month: 'Jan', revenue: 2000, expenses: 20000 },
    { month: 'Feb', revenue: 6000, expenses: 31000 },
    { month: 'Mar', revenue: 15000, expenses: 25500 },
    { month: 'Apr', revenue: 43000, expenses: 43990 },
    { month: 'May', revenue: 55500, expenses: 58000 },
    { month: 'Jun', revenue: 59000, expenses: 50000 },
    { month: 'Jul', revenue: 61000, expenses: 80000 },
    { month: 'Aug', revenue: 71000, expenses: 99000 },
    { month: 'Sep', revenue: 89000, expenses: 69600 },
    { month: 'Oct', revenue: 109000, expenses: 59000 },
    { month: 'Nov', revenue: 119000, expenses: 48000 },
    { month: 'Dec', revenue: 122500, expenses: 34000 },
];

const SalesTrends = () => {
    const [startDate, setStartDate] = useState(new Date('2024-01-01'));
    const [endDate, setEndDate] = useState(new Date('2024-12-31'));
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white sm:p-6   text-black w-full">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                {/* Title and Value */}
                <div>
                    <h2 className="text-base sm:text-lg text-gray-700 mb-1">Sales Trends</h2>
                    <div className='flex gap-3 items-center'>
                        <div className="text-2xl sm:text-3xl font-bold">₹125200</div>
                        <div className="flex items-center gap-1 text-green-600 text-sm sm:text-base mt-1 bg-[#e6fff0] px-2 py-1 rounded">
                            24.6%
                            <FiArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Labels + Date Picker */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                    {/* Revenue & Expenses Labels */} 
                    <div className="flex gap-5 items-center font-semibold">
                        <span className="flex items-center text-sm gap-2">
                            <div className="w-2 h-2 bg-[#5737B4] rounded-full"></div>
                            Revenue
                        </span>
                        <span className="flex items-center text-sm gap-2">
                            <div className="w-2 h-2 bg-[#00C2FF] rounded-full"></div>
                            Expenses
                        </span>
                    </div>

                    {/* Date Range Filter */}
                    <div className="relative w-max">
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-2  text-sm px-4 py-2 rounded shadow"
                        >
                            <FaCalendarAlt />
                            {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                            {endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </button>

                        {open && (
                            <div className="absolute z-50 mt-2 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded shadow">
                                <div>
                                    <p className="text-sm font-semibold mb-1 text-black">Start Date</p>
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
                                    <p className="text-sm font-semibold mb-1 text-black">End Date</p>
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
                </div>
            </div>

            {/* Chart Section */}
            <div className="h-[300px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#AE7AFF" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#AE7AFF" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#20DFDF" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#20DFDF" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis dataKey="month" stroke="#505050" />
                        <YAxis stroke="#505050" tickFormatter={(value) => `${value / 1000}K`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#2A2A3E", border: "none", color: "#fff" }}
                            formatter={(value) => [`₹${value}`, ""]}
                        />

                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#5737B4"
                            fill="url(#colorRevenue)"
                            strokeWidth={1.5}
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            name="Expenses"
                            stroke="#00C2FF"
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
