import React, { useEffect, useMemo, useState } from 'react';
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
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getProductsApi, getVendorDashboardApi, VendorDocumentCheckApi } from '../../services/allAPI';
import OverviewChart from '../../components/OverviewChart';
import ProfitCard from '../../components/admin/adminDashboard/TotalProfitChart';
import TopProductsChart from '../../components/vendor/TopProductsChart';

// Add these imports for PDF/Excel downloads
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const VendorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [docStatus, setDocStatus] = useState();
  const [profit, setProfit] = useState();
  const [Orders, setOrders] = useState([]);
  const [totalSales, setTotalSales] = useState();
  const [totalProducts, setTotalProducts] = useState(0);
  const [topProducts, setTopProducts] = useState({});
  const [breakdown, setBreakdown] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]); // For SalesTrends chart
  const [monthFilter, setMonthFilter] = useState("Last 12 months"); // default
  const [showDropdown, setShowDropdown] = useState(false); // For Products Overview download
  const filterOptions = ["Last 3 months", "Last 6 months", "Last 12 months"];

  const { filteredBars, filteredLabels } = useMemo(() => {
    let count = 12; // default 12 months
    if (monthFilter === "Last 6 months") count = 6;
    if (monthFilter === "Last 3 months") count = 3;

    const recentOrders = Orders.slice(-count); // last N months
    return {
      filteredBars: recentOrders.map((item) => item.total_orders),
      filteredLabels: recentOrders.map((item) => item.month),
    };
  }, [Orders, monthFilter]);

  useEffect(() => {
    const fetchDocStatus = async () => {
      try {
        const response = await VendorDocumentCheckApi();
        setDocStatus(response.documents);
      } catch (error) {
        console.error("Error fetching vendor document status:", error);
      }
    };

    fetchDocStatus();
  }, []);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";

    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toString();
  };

  const stats = [
    { title: "Total Sales", value: formatNumber(totalSales), icon: <IoPricetagOutline /> },
    { title: "Total Products", value: formatNumber(totalProducts), icon: <PiToolboxLight /> },
    { title: "Total Profit", value: formatNumber(profit), icon: <CiBadgeDollar /> },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getVendorDashboardApi();
        setDashboardData(data);
        setTotalSales(data.total_sales);
        setTotalProducts(data.total_products);
        setProfit(data.total_profit);
        setOrders(data.monthly_orders || []);
        setTopProducts(data.monthly_top_products || {});
        const stock = data.stock_summary || { in_stock: 0, low_stock: 0, out_of_stock: 0 };
        setBreakdown([
          { label: "In Stock", value: stock.in_stock, color: "#C32AFF" },
          { label: "Low Stock", value: stock.low_stock, color: "#8E70FF" },
          { label: "Out of Stock", value: stock.out_of_stock, color: "#21D0FF" },
        ]);
        const salesData = (data.sales_trend || []).map((item) => {
          const date = new Date(item.month + "-01");
          return {
            month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            revenue: item.total_sales,
            expenses: item.total_profit,
          };
        });
        setSalesTrend(salesData);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };
    fetchDashboard();
  }, []);

  const totalOrders = Orders?.reduce((sum, item) => sum + item.total_orders, 0) || 0;

  if (!dashboardData) return <p className="text-center text-gray-500">Loading...</p>;

  const shouldShowBanner =
    docStatus &&
    docStatus.missing_count > 0 &&
    !(docStatus.incomplete_fields?.length === 1 && docStatus.incomplete_fields[0] === "financial_statement");
  const addresscheck = docStatus && docStatus.has_address === false;

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Products Overview Report", 14, 16);
    const tableColumn = ["Product", "Stock", "Price", "Category"];
    const tableRows = [];

    dashboardData.recent_products?.forEach(product => {
      const prodData = [
        product.name,
        product.stock,
        product.price,
        product.category?.name || "N/A",
      ];
      tableRows.push(prodData);
    });

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("products_report.pdf");
    setShowDropdown(false);
  };

  // Excel Download
  const downloadExcel = () => {
    const wsData = [
      ["Product", "Stock", "Price", "Category"],
      ...(dashboardData.recent_products || []).map(p => [
        p.name,
        p.stock,
        p.price,
        p.category?.name || "N/A",
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products_report.xlsx");
    setShowDropdown(false);
  };

  return (
    <div className='bg-gray-100 px-6 py-10 rounded-2xl'>
      {/* Banner */}
      {shouldShowBanner && (
        <div>
          <div className="bg-[#E2DBF4] border border-[#E0D0FF] text-[#5737B4] rounded-lg p-6 flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <AiOutlineInfoCircle className="text-3xl md:text-4xl" />
              <div>
                <h3 className="font-semibold text-md md:text-md text-black">
                  Complete Your Account Setup to Start Selling
                </h3>
                <p className="text-md md:text-sm text-gray-600">
                  You’ve skipped some required steps ({docStatus.missing_count} missing).
                  Please finish your account setup to add products and start selling on your store.
                </p>
              </div>
            </div>
            <button className="border border-[#5737B4] text-[#5737B4] px-4 py-1.5 lg:w-40 md:w-50 sm:w-40 rounded-md text-sm hover:bg-[#5737B4] hover:text-white transition">
              <Link to="/vendor/profile">Finish Setup</Link>
            </button>
          </div>
          {addresscheck && (
            <div className="bg-[#E2DBF4] border border-[#E0D0FF] text-[#5737B4] rounded-lg p-6 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <AiOutlineInfoCircle className="text-3xl md:text-4xl text-[#5737B4]" />
                <div>
                  <h3 className="font-semibold text-md md:text-md text-black">
                    Add Your Address
                  </h3>
                  <p className="text-md md:text-sm text-gray-600">
                    Please provide your business address to enable shipping, delivery, and accurate tax calculations.
                  </p>
                </div>
              </div>
              <button className="border border-[#5737B4] text-[#5737B4] px-4 py-1.5 lg:w-40 md:w-50 sm:w-40 rounded-md text-sm hover:bg-[#5737B4] hover:text-white transition">
                <Link to="/vendor/profile">Finish Setup</Link>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Dashboard</h1>
        <button className='bg-[#5737B4] text-white px-4 py-2 rounded-md'>Download report</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9 ">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl ">{stat.icon}</span>
              <h4 className="text-sm font-semibold text-gray-500">{stat.title}</h4>
            </div>
            <div className='flex text-center items-center'>
              <p className="text-3xl font-bold mt-2 text-center pr-2">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales & Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6 w-full p-1 border border-[#D8D8D8] rounded-2xl shadow-lg">
        <div className="lg:col-span-2 text-white w-full">
          <SalesTrends
            title="Sales Trends"
            totalValue={dashboardData?.total_sales || 0}
            growth={24.6}
            data={salesTrend}
            revenueLabel="Sales"
            expensesLabel="Profit"
          />
        </div>
        <div className="flex flex-col w-full lg:col-span-1">
          <ProfitCard
            title="Monthly Orders"
            profit={totalOrders}
            percentage={28.5}
            bars={filteredBars}
            xLabels={filteredLabels} 
          />
          <hr className='border border-[#D8D8D8] mt-4 mb-4' />
          <TopProductsChart monthly_top_products={topProducts} />
        </div>
      </div>

      {/* Users Overview with Download Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Products Overview</h2>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-sm bg-[#5737B4] text-white px-4 py-1.5 rounded-full"
          >
            Download Report
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={downloadPDF}
                >
                  PDF
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={downloadExcel}
                >
                  Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
        <div>
          <OverviewChart
            title="Total Products"
            total={totalProducts}
            breakdown={breakdown}
          />
        </div>
        <div>
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;
