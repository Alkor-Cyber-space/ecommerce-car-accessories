// src/components/admin/adminDashboard/CombinedChartPanel.jsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
  AreaChart,
  Area
} from 'recharts';
import VendorsVsRevenue from '../../components/admin/revenuetrends/VendorsRvenueChart';

const growthData = [
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 20000 },
  { month: 'Mar', revenue: 50000 },
  { month: 'Apr', revenue: 80000 },
  { month: 'May', revenue: 95000 },
  { month: 'Jun', revenue: 100000 },
  { month: 'Jul', revenue: 120000 },
  { month: 'Aug', revenue: 150000 },
  { month: 'Sep', revenue: 180000 },
  { month: 'Oct', revenue: 200000 },
  { month: 'Nov', revenue: 225000 },
  { month: 'Dec', revenue: 250000 },
];

const vendorData = [
  { name: 'Vendor A', revenue: 40000, orders: 30 },
  { name: 'Vendor B', revenue: 70000, orders: 50 },
  { name: 'Vendor C', revenue: 55000, orders: 42 },
  { name: 'Vendor D', revenue: 75000, orders: 60 },
];

const customerData = [
  { name: 'TorqueLine', value: 50000 },
  { name: 'DriveDeck', value: 70000 },
  { name: 'MotoMend', value: 85000 },
  { name: 'FixNDrive', value: 65000 },
];

const CombinedChartPanel = () => {
  return (
    <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl h-full'>
            <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Revenue Trends</h1>
        <button className='bg-[#5737B4] text-white px-4 py-2 rounded-md'>Download report</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6  p-1 border  border-[#D8D8D8] rounded-2xl shadow-lg ">
  
        {/* Growth Trends Chart */}
        <div className="lg:col-span-2 bg-white  p-7">
          <div className="flex justify-between items-center mb-4">
            <div className='flex flex-col gap-2'>
              <h2 className="text-lg font-semibold text-gray-700">Growth Trends</h2>
              <div className="text-xl font-semibold">₹1,22,5000</div>
  
            </div>
            <div className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm">24.6% ↑</div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AE7AFF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#AE7AFF" stopOpacity={0} />
                </linearGradient>
              </defs>
  
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis tickFormatter={(value) => `${value / 1000}K`} />
  
              <Tooltip
                formatter={(value) => [`₹${value}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#5737B4',   // purple bg
                  color: '#fff',
                  borderRadius: '10px',
                  border: 'none',
                }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
  
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#5737B4"
                fill="url(#colorRevenue)"
                strokeWidth={2}
                dot={{
                  stroke: '#5737B4',
                  strokeWidth: 2,
                  r: false,
                  fill: '#fff',
                }}
                activeDot={{
                  stroke: '#5737B4',
                  strokeWidth: 3,
                  r: 7,
                  fill: '#5737B4',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
  
  
        </div>
  
        {/* Side Charts */}
        <div className="flex flex-col ">
  
          {/* Vendors vs Revenue */}
          <div className=' '>
            <VendorsVsRevenue />
          </div>
          <hr className='border border-[#D8D8D8]' />
          {/* Top Value Customers */}
          <div className='bg-white border-l border-l-[#D8D8D8] p-5 h-full'>
            <div className="">
              <h3 className="text-sm font-semibold mb-3">Top Value Customers</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" data={customerData}>
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}K`} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(val) => `₹${val}`} />
                  <Bar dataKey="value" fill="#5737B4" barSize={16} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
  
        </div>
      </div>
  </div>
  );
};

export default CombinedChartPanel;
