import React from 'react';
import GMVChart from '../../components/admin/financialdashboard/GMVChart';
import RevenueBreakdown from '../../components/admin/financialdashboard/RevenueBreakdown';
import EarningsTable from '../../components/admin/financialdashboard/EarningsTable';
import FeeStatsCard from '../../components/admin/financialdashboard/FeesStatsCard';

export default function FinancialDashboard() {
  return (
    // <div className="p-6 bg-gray-100 min-h-screen">
    //   <h2 className="text-3xl font-semibold mb-6 text-gray-800">Financial Overview</h2>
    <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl h-full'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Financial Overview</h1>
        <button className='bg-[#5737B4] text-white px-4 py-2 rounded-md'>Download report</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6  mt-9">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-4">
          <GMVChart />
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <FeeStatsCard />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <RevenueBreakdown />
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-xl font-medium mb-4 text-gray-700">Earnings Table</h3>
        <EarningsTable />
      </div>
    </div>
  );
}
