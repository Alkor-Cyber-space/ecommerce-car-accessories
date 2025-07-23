import React from 'react';

import SalesTrends from '../../components/admin/adminDashboard/SalesTrends';
import RegisteredUsersChart from '../../components/admin/adminDashboard/RegisteredUsersChart';
import TopProductsTable from '../../components/admin/adminDashboard/TopProducts';
import RecentOrdersTable from '../../components/admin/adminDashboard/OrderTracking';
import TotalProfitCard from '../../components/admin/adminDashboard/TotalProfitChart';
import UsersOverview from '../../components/admin/adminDashboard/UserOverview';
import RefundReturnStats from '../../components/admin/adminDashboard/RefundReturnStats';
import { IoPricetagOutline } from 'react-icons/io5';
import { CiBadgeDollar } from "react-icons/ci";
import { FiArrowUpRight } from 'react-icons/fi';
import { PiToolboxLight } from 'react-icons/pi';

const stats = [
  { icon: <IoPricetagOutline />, title: "Total Sales", value: "50.8K" },
  { icon: <PiToolboxLight />, title: "Total Orders", value: "200" },
  { icon: <CiBadgeDollar />, title: "Revenue Summary", value: "50.8K" },
];
const AdminDashboard = () => {
  return (
    <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl'>
      {/* <div>
        <h1 className='text-3xl'>Welcome back, Rohit Ravikumar</h1>
        <span className='text-sm'>Measure your advertising ROI and report website traffic.</span>
      </div> */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Dashboard</h1>
        <button className='bg-[#5737B4] text-white px-4 py-2 rounded-md'>Download report</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9 ">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl  shadow p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl ">
                {stat.icon}
              </span>
              <h4 className="text-sm font-semibold text-gray-500">{stat.title}</h4>
            </div>
            <div className='flex text-center items-center'>
              <p className="text-3xl font-bold mt-2 text-center pr-2">{stat.value}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm sm:text-base mt-1 bg-[#e6fff0] px-2 py-1 rounded">
                24.6%
                <FiArrowUpRight className="w-4 h-4" />
              </div>
            </div>
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
          <UsersOverview />
        </div>
        <div className="">
          <RecentOrdersTable />
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard