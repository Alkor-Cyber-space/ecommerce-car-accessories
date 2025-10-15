import React, { useEffect, useState } from 'react';

import SalesTrends from '../../components/admin/adminDashboard/SalesTrends';
import RegisteredUsersChart from '../../components/admin/adminDashboard/RegisteredUsersChart';
import TopProductsTable from '../../components/admin/adminDashboard/TopProducts';
import RecentOrdersTable from '../../components/admin/adminDashboard/OrderTracking';
import TotalProfitCard from '../../components/admin/adminDashboard/TotalProfitChart';
import UsersOverview from '../../components/admin/adminDashboard/UserOverview';
import TopSalesOverview from '../../components/admin/Top';
import RefundReturnStats from '../../components/admin/adminDashboard/RefundReturnStats';
import { salesAnalyticsApi } from '../../services/allAPI';

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState({});
  const [monthlyProducts, setMonthlyProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [formattedSales, setFormattedSales] = useState([]);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        const data = await salesAnalyticsApi(); // Assuming this API call works
        setSalesData(data);
        console.log(data);

        setMonthlyProducts(data?.top_products || []);
        setRecentOrders(data?.orders_today || []);

        // Prepare monthly chart data (Sales Trends)
        const formatted = (data?.sales_trends || []).map((item) => {
          const date = new Date(item.day);
          const monthName = date.toLocaleString("default", { month: "short" });

          return {
            month: monthName,
            revenue: item.total_sales,
            expenses: item.total_refunds, // You can adjust it to be profit if needed
          };
        });

        setFormattedSales(formatted);
        console.log("Formatted Sales Data:", formatted);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    fetchSalesAnalytics();
  }, []);

  const stats = [
    { title: "Orders Today", value: salesData?.orders_today || 0 },
    { title: "Products sold Today", value: salesData?.products_sold_today || 0 },
    // { title: "New Users", value: salesData?.new_users || 0 },
    { title: "Refunds Today", value: salesData?.refunds_today || 0 },
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
            <p className="text-2xl font-bold mt-3">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3  bg-white  my-6 w-full p-1 border  border-[#D8D8D8] rounded-2xl shadow-lg">
        {/* Sales Trends - spans 2/3 columns on large screens */}
        <div className="lg:col-span-2 text-white w-full">
          <SalesTrends
            data={formattedSales} 
            title="Sales & Refunds Overview"
            totalValue={salesData.total_profit || 0}
            growth={24.6} 
            revenueLabel="Sales"
            expensesLabel="Refunds"
            xKey="month"
            yFormatter={(v) => `${v / 1000}K`} 
            revenueColor="#5737B4"
            expensesColor="#00C2FF"
          />
        </div>


        {/* Right side (stacked vertically) */}
        <div className="flex flex-col w-full lg:col-span-1">
          <div className=" text-black  w-full">
                {/* <ProfitCard
            title="Monthly Products"
            profit={totalProducts}
            percentage={28.5}
            bars={filteredBars}
            xLabels={filteredLabels}
            filterOptions={filterOptions}
            durationLabels={filteredLabels.map(label => `${label} - Duration`)}

          /> */}
          </div>
          <hr className='border border-[#D8D8D8]' />

          <div className="  w-full">
            <RefundReturnStats />
          </div>
        </div>
      </div>


      {/* Users Overview */}
      <div>
        <TopSalesOverview />
      </div>
      {/* <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2 '>
        <div>
          <TopSalesOverview />
        </div>
        <div className=" rounded-xl  shadow">
          <TopProductsTable />
        </div>
      </div> */}

    </div>
  )
}

export default SalesAnalytics