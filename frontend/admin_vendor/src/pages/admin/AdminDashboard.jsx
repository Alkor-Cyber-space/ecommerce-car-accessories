import React, { use, useEffect, useState } from 'react';

import SalesTrends from '../../components/admin/adminDashboard/SalesTrends';
import RegisteredUsersChart from '../../components/admin/adminDashboard/RegisteredUsersChart';
import TopProductsTable from '../../components/admin/adminDashboard/TopProducts';
import RecentOrdersTable from '../../components/admin/adminDashboard/OrderTracking';
import TotalProfitCard from '../../components/admin/adminDashboard/TotalProfitChart';
import UsersOverview from '../../components/admin/adminDashboard/UserOverview';
import RefundReturnStats from '../../components/admin/adminDashboard/RefundReturnStats';
import { getAdminDashboardApi } from '../../services/allAPI';
import OverviewChart from '../../components/OverviewChart';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const adminDashboard = async () => {
      try {
        const data = await getAdminDashboardApi();
        setDashboardData(data);
        console.log("Admin Dashboard Data:", data);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };
    adminDashboard();
  }, []);
// const stats = [
//   { title: "Orders Today", value: 53 },
//   { title: "Products sold - Today", value: "42" },
//   { title: "New Users", value: 20 },
//   { title: "New Vendors", value: 3 },
// ];
if (!dashboardData) return <div>Loading...</div>; // wait for data

const stats = [
  { title: "Orders Today", value: dashboardData?.total_orders || 0 },
  { title: "Products Sold - Today", value: dashboardData?.total_products || 0 },
  { title: "New Users", value: dashboardData?.new_users || 0 },
  { title: "New Vendors", value: dashboardData?.new_vendors || 0 },
];

  return (
    <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl'>

      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Dashboard</h1>
        <button className='bg-[#5737B4] text-white px-4 py-2 rounded-md'>Download report</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9 ">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl  shadow p-4">
            <h4 className="text-sm text-gray-500">{stat.title}</h4>
            <p className="text-3xl font-bold mt-3 text-right pr-5">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3  bg-white  my-6 w-full p-1 border  border-[#D8D8D8] rounded-2xl shadow-lg">
        {/* Sales Trends - spans 2/3 columns on large screens */}
        <div className="lg:col-span-2  text-white w-full">
          <SalesTrends />
        </div>

        {/* Right side (stacked vertically) */}
        <div className="flex flex-col w-full lg:col-span-1">
          <div className=" text-black  w-full">
            <TotalProfitCard />
            {/* <ProfitCard
  title="Admin Total Profit"
  profit={50200000}
  percentage={12.3}
  bars={[30, 42, 55, 50, 48, 45, 38, 60, 42, 40, 30, 48, 52, 45, 50, 38, 60, 50]}
  durationLabel="This Quarter"
  onDownload={() => console.log("Admin report download")}
/> */}

          </div>
          <hr className='border border-[#D8D8D8]' />

          <div className=" w-full">
            <RefundReturnStats />
          </div>
        </div>
      </div>

      {/* Users Overview */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Users Overview</h2>
        <button className="text-sm bg-[#5737B4] text-white px-4 py-1.5 rounded-full">
          Download Report
        </button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2 '>
        <div>
          <OverviewChart
            title="Total users"
            total={dashboardData?.total_users + dashboardData?.total_vendors || 0}
            breakdown={[
              { label: "Total Users", value: dashboardData?.total_users || 0, color: "#3b82f6" },
              { label: "Total Vendors", value: dashboardData?.total_vendors || 0, color: "#8b5cf6" },
            ]}
          />
        </div>
        <div className="">
          <RecentOrdersTable />
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard