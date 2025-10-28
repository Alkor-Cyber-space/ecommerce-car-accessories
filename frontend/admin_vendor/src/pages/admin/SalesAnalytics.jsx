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
  const [formattedSales, setFormattedSales] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyProducts, setMonthlyProducts] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        const data = await salesAnalyticsApi();
        setSalesData(data);
        console.log("Sales Analytics Data:", data);

        setMonthlyProducts(data?.top_products || []);
        setRecentOrders(data?.recent_orders || []);

        // ✅ Fixed template literal inside map
        const formatted = (data?.sales_trends || []).map((item) => {
          const date = new Date(item.day);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return {
            month: `${year}-${month}`, // ✅ Corrected template literal
            revenue: item.total_sales || 0,
            expenses: item.total_refunds || 0,
          };
        });

        setFormattedSales(formatted);

        const totalSales = formatted.reduce(
          (acc, curr) => acc + (curr.revenue || 0),
          0
        );
        const totalRefunds = formatted.reduce(
          (acc, curr) => acc + (curr.expenses || 0),
          0
        );

        setTotalSales(totalSales);
        setTotalRefunds(totalRefunds);

        console.log("Formatted Sales Trends:", formatted);
      } catch (error) {
        console.error("Error fetching sales analytics data:", error);
      }
    };

    fetchSalesAnalytics();
  }, []);

  const stats = [
    { title: "Orders Today", value: salesData?.orders_today || 0 },
    { title: "Products Sold Today", value: salesData?.products_sold_today || 0 },
    { title: "Refunds Today", value: salesData?.refunds_today || 0 },
  ];

  return (
    <div className="bg-[#ECECF0] px-6 py-10 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="bg-[#5737B4] text-white px-4 py-2 rounded-md">
          Download report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4">
            <h4 className="text-sm text-gray-500">{stat.title}</h4>
            <p className="text-2xl font-bold mt-3">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6 w-full p-1 border border-[#D8D8D8] rounded-2xl shadow-lg">
        {/* Sales & Refunds Chart */}
        <div className="lg:col-span-2 text-white w-full">
          <SalesTrends
            data={formattedSales.map((item) => ({
              month: item.month,
              revenue: item.revenue,
              expenses: item.expenses,
            }))}
            title="Sales & Refunds Overview"
            totalValue={totalSales} // ✅ use totalSales instead of total_profit
            growth={24.6}
            revenueLabel="Sales"
            expensesLabel="Refunds"
            xKey="month"
            yFormatter={(v) => (v ? `${(v / 1000).toFixed(1)}K` : "0")} // ✅ fixed template literal
            revenueColor="#5737B4"
            expensesColor="#00C2FF"
          />
        </div>

        {/* Right side (stacked vertically) */}
        <div className="flex flex-col w-full lg:col-span-1">
          <div className="text-black w-full">
            {/* <ProfitCard
              title="Monthly Products"
              profit={totalProducts}
              percentage={28.5}
              bars={filteredBars}
              xLabels={filteredLabels}
              filterOptions={filterOptions}
              durationLabels={filteredLabels.map(label => `${label} - Duration`)} // ✅ corrected
            /> */}
          </div>

          <hr className="border border-[#D8D8D8]" />

          <div className="w-full">
            <RefundReturnStats />
          </div>
        </div>
      </div>

      {/* Users Overview */}
      <div>
        <TopSalesOverview />
      </div>

      {/* Optional Section (commented) */}
      {/* <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2 '>
        <div>
          <TopSalesOverview />
        </div>
        <div className="rounded-xl shadow">
          <TopProductsTable />
        </div>
      </div> */}
    </div>
  );
};

export default SalesAnalytics;
