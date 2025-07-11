import React, { useState } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';

const monthlyGMV = {
  2023: [
    { month: 'Jan', gmv: 45000 },
    { month: 'Feb', gmv: 48000 },
    { month: 'Mar', gmv: 50000 },
    { month: 'Apr', gmv: 47000 },
    { month: 'May', gmv: 52000 },
    { month: 'Jun', gmv: 54000 },
    { month: 'Jul', gmv: 60000 },
    { month: 'Aug', gmv: 62000 },
    { month: 'Sep', gmv: 58000 },
    { month: 'Oct', gmv: 65000 },
    { month: 'Nov', gmv: 70000 },
    { month: 'Dec', gmv: 75000 },
  ],
  2024: [
    { month: 'Jan', gmv: 60000 },
    { month: 'Feb', gmv: 55000 },
    { month: 'Mar', gmv: 72000 },
    { month: 'Apr', gmv: 68000 },
    { month: 'May', gmv: 75000 },
    { month: 'Jun', gmv: 82000 },
    { month: 'Jul', gmv: 79000 },
    { month: 'Aug', gmv: 85000 },
    { month: 'Sep', gmv: 87000 },
    { month: 'Oct', gmv: 90000 },
    { month: 'Nov', gmv: 95000 },
    { month: 'Dec', gmv: 100000 },
  ]
};

export default function MonthlyGMVChart() {
  const [viewType, setViewType] = useState('bar');
  const [selectedYear, setSelectedYear] = useState('2024');

  const data = monthlyGMV[selectedYear];

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold">Monthly GMV ({selectedYear})</h3>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded px-2 py-1 text-sm text-gray-700"
          >
            {Object.keys(monthlyGMV).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded ${viewType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Bar
          </button>
          <button
            onClick={() => setViewType('line')}
            className={`px-3 py-1 rounded ${viewType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Line
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {viewType === 'bar' ? (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Bar dataKey="gmv" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Line dataKey="gmv" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
