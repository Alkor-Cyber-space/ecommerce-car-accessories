// src/components/admin/adminDashboard/CombinedChartPanel.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
  AreaChart,
  Area
} from 'recharts';
import VendorsVsRevenue from '../../components/admin/revenuetrends/VendorsRvenueChart';
import { revenueTrendsApi } from '../../services/allAPI';
import SalesTrends from '../../components/admin/adminDashboard/SalesTrends';

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
  const [growthTrends, setGrowthTrends] = useState([]);
  const [vendorVSRevenue, setVendorVSRevenue] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [totalSales, setTotalSales] = useState(0); 
  const [totalOrders, setTotalOrders] = useState(0); 

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        const data = await revenueTrendsApi();

        setGrowthTrends(data.growth_trends || []);
        setVendorVSRevenue(data.vendor_vs_revenue || []);
        const customers = data.top_customers || [];

        const transformedData = customers.map((customer) => ({
          name: customer.email,
          value: customer.total_spent,
        }));

        setTopCustomers(transformedData);
        const totalSales = data.growth_trends.reduce(
          (acc, trend) => acc + (trend.total_sales || 0),
          0
        );
        const totalOrders = data.growth_trends.reduce(
          (acc, trend) => acc + (trend.total_orders || 0),
          0
        );

        setTotalSales(totalSales);
        setTotalOrders(totalOrders);

        console.log(data);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    fetchSalesAnalytics();
  }, []);

  const shortenName = (name, maxLength = 5) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
  };

  return (
    <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl h-full'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Revenue Trends</h1>
        <button className='bg-[#5737B4] text-white px-4 py-2 rounded-md'>Download report</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6  p-1 border  border-[#D8D8D8] rounded-2xl shadow-lg ">
        <div className="lg:col-span-2 bg-white p-1  ">
          <SalesTrends
            data={growthTrends.map((item) => ({
              month: item.month, 
              revenue: item.total_sales,
              expenses: item.total_orders,
            }))}
            title="Growth Trends"
            totalValue={totalSales}
            growth={24.6}
            revenueLabel="Sales"
            expensesLabel="Orders"
            xKey="month"
            yFormatter={(v) => (v ? `${(v / 1000).toFixed(1)}K` : "0")}
            revenueColor="#5737B4"
            expensesColor="#00C2FF"
          />
        </div>

        {/* Side Charts */}
        <div className="flex flex-col ">
          {/* Vendors vs Revenue */}
          <div className=' '>
            <VendorsVsRevenue vendorData={vendorVSRevenue} />
          </div>
          <hr className='border border-[#D8D8D8]' />
          {/* Top Value Customers */}
          <div className='bg-white border-l border-l-[#D8D8D8] px-6 py-3 h-full'>
            <div className="">
              <h3 className="text-sm font-semibold mb-3">Top Value Customers</h3>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart layout="vertical" data={topCustomers}>
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}K`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickFormatter={(name) => shortenName(name)}
                  />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
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


{/* <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={growthTrends}>
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
                  fill: '#fff',
                  r: 9,  // Set the size of the dot
                }}
                activeDot={{
                  stroke: '#5737B4',
                  strokeWidth: 3,
                  r: 7,  // Size of active dot
                  fill: '#5737B4', // Color of the active dot
                }}
              />
            </AreaChart>
          </ResponsiveContainer> */}