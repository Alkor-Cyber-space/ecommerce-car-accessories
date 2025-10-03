import React, { useEffect, useState } from 'react';
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

// const stats = [
//   { icon: <IoPricetagOutline />, title: "Total Sales", value: "50.8K" },
//   { icon: <PiToolboxLight />, title: "Total Orders", value: "200" },
//   { icon: <CiBadgeDollar />, title: "Revenue Summary", value: "50.8K" },

// ];


const VendorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [docStatus, setDocStatus] = useState();
  // const [totalProducts, setTotalProducts] = useState(0);
  //   const [breakdown, setBreakdown] = useState([]);
  const [profit, setProfit] = useState();
  const [totalSales, setTotatlSales] = useState()
  const [totalProducts, setTotalProducts] = useState();
  const [breakdown, setBreakdown] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      const products = await getProductsApi();
      const mapped = products.map((p) => ({
        stock: p.stock,
        status:
          p.stock === 0
            ? "Out of Stock"
            : p.stock < 15
              ? "Low Stock"
              : "In Stock",
      }));

      setTotalProducts(mapped.length);

      setBreakdown([
        {
          label: "In Stock",
          value: mapped.filter((p) => p.status === "In Stock").length,
          color: "#C32AFF",
        },
        {
          label: "Low Stock",
          value: mapped.filter((p) => p.status === "Low Stock").length,
          color: "#8E70FF",
        },
        {
          label: "Out of Stock",
          value: mapped.filter((p) => p.status === "Out of Stock").length,
          color: "#21D0FF",
        },
      ]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDocStatus = async () => {
      try {
        const response = await VendorDocumentCheckApi();
        setDocStatus(response.documents);
        console.log(response.documents);

      } catch (error) {
        console.error("Error fetching vendor document status:", error);
      }
    };

    fetchDocStatus();
  }, []);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0"; // fallback
  
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };
  
  const stats = [
    {
      title: "Total Sales",
      value: formatNumber(totalSales),
      icon: <IoPricetagOutline />,
    },
    {
      title: "Total Products",
      value: formatNumber(totalProducts),
      icon: <PiToolboxLight />,
    },
    {
      title: "Total Profit",
      value: formatNumber(profit),
      icon: <CiBadgeDollar />,
    },
  ];
    
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getVendorDashboardApi();
        console.log(data);

        setDashboardData(data);
        setTotatlSales(data.total_sales);
        setTotalProducts(data.total_products);
        setProfit(data.total_profit);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };
    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  const shouldShowBanner = docStatus && docStatus.missing_count > 0;


  return (
    <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl'>
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

      {/* Sales & Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6 w-full p-1 border border-[#D8D8D8] rounded-2xl shadow-lg">
        {/* Sales Trends */}
        <div className="lg:col-span-2 text-white w-full">
          <SalesTrends />
        </div>
        {/* Profit & Refund */}
        <div className="flex flex-col w-full lg:col-span-1">
          <div className="text-black w-full">
            {/* <TotalProfitCard /> */}
            <ProfitCard
              title="Monthly Profit"
              profit={profit}
              percentage={28.5}
              bars={[35, 45, 50, 40, 48, 38, 55, 44, 42, 40, 35, 45]}
              xLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              durationLabel="Last 12 months"
            />


          </div>
          <hr className='border border-[#D8D8D8]' />
          <div className="w-full">
            <RefundReturnStats />
          </div>
        </div>
      </div>

      {/* Users Overview */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Products Overview</h2>
        <button className="text-sm bg-[#5737B4] text-white px-4 py-1.5 rounded-full">
          Download Report
        </button>
      </div>
      {/* <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
        <div>
          <UsersOverview />
        </div>
        <div>
          <RecentOrdersTable />
        </div>
      </div> */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
        <div>
          <OverviewChart
            title="Total Products"
            total={totalProducts}
            breakdown={breakdown}
          /></div>
        <div>
          {/* order statics instead */}
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard;

// import React, { useEffect, useState } from "react";
// import { AiOutlineShoppingCart, AiOutlineUser, AiOutlineDollar } from "react-icons/ai";
// import { MdInventory } from "react-icons/md";
// import { getVendorDashboardApi } from "../../services/allAPI";
// const VendorDashboard = () => {
//   const [dashboardData, setDashboardData] = useState(null);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const data = await getVendorDashboardApi();
//         setDashboardData(data);
//       } catch (error) {
//         console.error("Error fetching dashboard:", error);
//       }
//     };
//     fetchDashboard();
//   }, []);

//   if (!dashboardData) {
//     return <p className="text-center text-gray-500">Loading...</p>;
//   }

//   const {
//     total_sales,
//     total_orders,
//     total_profit,
//     total_products,
//     total_users,
//     total_vendors,
//     registration_complete,
//     recent_products,
//   } = dashboardData;

//   return (
//     <div className="p-6 space-y-6">
//       {/* Banner */}
//       {!registration_complete && (
//         <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg p-4">
//           <p className="font-semibold">⚠️ Complete Your Registration</p>
//           <p className="text-sm">
//             Please finish your profile setup to unlock full dashboard features.
//           </p>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <StatCard
//           icon={<AiOutlineDollar className="text-3xl text-green-500" />}
//           label="Total Sales"
//           value={`₹${total_sales}`}
//         />
//         <StatCard
//           icon={<AiOutlineShoppingCart className="text-3xl text-blue-500" />}
//           label="Total Orders"
//           value={total_orders}
//         />
//         <StatCard
//           icon={<MdInventory className="text-3xl text-purple-500" />}
//           label="Total Products"
//           value={total_products}
//         />
//         <StatCard
//           icon={<AiOutlineDollar className="text-3xl text-indigo-500" />}
//           label="Total Profit"
//           value={`₹${total_profit}`}
//         />
//         <StatCard
//           icon={<AiOutlineUser className="text-3xl text-pink-500" />}
//           label="Total Users"
//           value={total_users}
//         />
//         <StatCard
//           icon={<AiOutlineUser className="text-3xl text-orange-500" />}
//           label="Total Vendors"
//           value={total_vendors}
//         />
//       </div>

//       {/* Recent Products */}
//       <div className="bg-white rounded-xl shadow p-6">
//         <h3 className="font-semibold text-lg mb-4">Recent Products</h3>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-sm text-gray-600">
//                 <th className="p-3">Image</th>
//                 <th className="p-3">Name</th>
//                 <th className="p-3">Price</th>
//                 <th className="p-3">Stock</th>
//                 <th className="p-3">Category</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recent_products.map((product) => (
//                 <tr key={product.id} className="border-b hover:bg-gray-50">
//                   <td className="p-3">
//                     {product.image_list.length > 0 ? (
//                       <img
//                         src={product.image_list[0].image}
//                         alt={product.name}
//                         className="w-12 h-12 rounded object-cover"
//                       />
//                     ) : (
//                       <span className="text-gray-400">No Image</span>
//                     )}
//                   </td>
//                   <td className="p-3">{product.name}</td>
//                   <td className="p-3">₹{product.price}</td>
//                   <td className="p-3">{product.stock}</td>
//                   <td className="p-3">{product.category?.name}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Reusable Stat Card Component
// const StatCard = ({ icon, label, value }) => (
//   <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
//     <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
//     <div>
//       <p className="text-gray-500 text-sm">{label}</p>
//       <h2 className="font-bold text-xl">{value}</h2>
//     </div>
//   </div>
// );

// export default VendorDashboard;
