import React, { useEffect, useState } from "react";
import SalesTrends from "../../components/admin/adminDashboard/SalesTrends";
import RefundReturnStats from "../../components/admin/adminDashboard/RefundReturnStats";
import { getAdminDashboardApi } from "../../services/allAPI";
import OverviewChart from "../../components/OverviewChart";
import ProfitCard from "../../components/admin/adminDashboard/TotalProfitChart";
import RecentOrdersStats from "../../components/admin/adminDashboard/RecentOrdersStats";
import TopProductsTable from "../../components/admin/adminDashboard/TopProducts";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [monthlyProducts, setMonthlyProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const data = await getAdminDashboardApi();
        setDashboardData(data);
        setMonthlyProducts(data?.monthly_products || []);
        setRecentOrders(data?.recent_orders || []);

        const formattedSales = (data?.monthly_sales || []).map((item) => {
          const date = new Date(item.month + "-01");
          const monthName = date.toLocaleString("default", { month: "short" });

          return {
            month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            revenue: item.total_sales,
            expenses: item.total_profit,
          };
        });

        setSalesData(formattedSales);
        console.log("Admin Dashboard Data:", data);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    fetchAdminDashboard();
  }, []);
  const filterOptions = ["Last 3 months", "Last 6 months", "Last 12 months"];

  const totalProducts =
    monthlyProducts?.reduce((sum, item) => sum + item.total_products, 0) || 0;

  //  Create bar data for ProfitCard
  const filteredBars = monthlyProducts?.map((item) => item.total_products) || [];
  const filteredLabels =
    monthlyProducts?.map((item) => {
      const date = new Date(item.month + "-01");
      return date.toLocaleString("default", { month: "short" });
    }) || [];

  if (!dashboardData) return <div>Loading...</div>;

  const stats = [
    { title: "Recent orders", value: dashboardData?.recent_orders.length || 0 },
    { title: "Recent Products", value: dashboardData?.recent_products.length || 0 },
    { title: "New Users", value: dashboardData?.new_users || 0 },
    { title: "New Vendors", value: dashboardData?.new_vendors || 0 },
  ];

  return (
    <div className="bg-[#ECECF0] px-6 py-6 rounded-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#5737B4]">Dashboard</h1>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4">
            <h4 className="text-sm text-gray-500">{stat.title}</h4>
            <p className="text-3xl font-bold mt-3 text-right pr-5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6 w-full p-1 border border-[#D8D8D8] rounded-2xl shadow-lg">
        <div className="lg:col-span-2 w-full">
          <SalesTrends
            data={salesData}
            title="Sales & Profit Overview"
            totalValue={dashboardData?.total_sales || 0}
            growth={24.6}
            revenueLabel="Sales"
            expensesLabel="Profit"
            xKey="month"
            yFormatter={(v) => `${v / 1000}K`}
            revenueColor="#5737B4"
            expensesColor="#00C2FF"
          />
        </div>

        {/* Right Side */}
        <div className="flex flex-col w-full lg:col-span-1">
          <ProfitCard
            title="Monthly Products"
            profit={totalProducts}
            percentage={28.5}
            bars={filteredBars}
            xLabels={filteredLabels}
            filterOptions={filterOptions}
            durationLabels={filteredLabels.map(label => `${label} - Duration`)}

          />
          <hr className="border border-[#D8D8D8]" />
          <div className="w-full">
            {/* <RefundReturnStats /> */}
            <RecentOrdersStats recentOrders={recentOrders} />
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

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2 px-9">
        <div>
          <OverviewChart
            title="Total Users"
            total={
              (dashboardData?.total_users || 0) +
              (dashboardData?.total_vendors || 0)
            }
            breakdown={[
              {
                label: "Total Users",
                value: dashboardData?.total_users || 0,
                color: "#3b82f6",
              },
              {
                label: "Total Vendors",
                value: dashboardData?.total_vendors || 0,
                color: "#8b5cf6",
              },
            ]}
          />
        </div>
        <div>
          <TopProductsTable/>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
