// import React from 'react'
// import SalesTrends from '../components/SalesTrends';
// import TotalProfitCard from '../components/TotalProfitChart';
// import RegisteredUsersChart from '../components/RegisteredUsersChart';
// import RecentOrdersTable from '../components/OrderTracking';
// import TopProductsTable from '../components/TopProducts';
// const stats = [
//   { title: "Orders Today", value: 53 },
//   { title: "Products sold- Today", value: "42" },
//   { title: "nw users", value: 20 },
//   { title: "Refunds", value: 3 },
// ];
// const AdminDashboard = () => {
//   return (
//     <div className='bg-gray-100 p-5'>
//       <div>
//         <h1 className='text-3xl'>Welcome back, Rohit Ravikumar</h1>
//         <span className='text-sm'>Measure your advertising ROI and report website traffic.</span>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-9 ">
//         {stats.map((stat, i) => (
//           <div key={i} className="bg-white rounded-2xl  shadow p-4">
//             <h4 className="text-sm text-gray-500">{stat.title}</h4>
//             <p className="text-2xl font-bold mt-3">{stat.value}</p>
//           </div>
//         ))}
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 w-full">
//         {/* Sales Trends - spans 2/3 columns on large screens */}
//         <div className="lg:col-span-2 bg-[#1C1C2D] p-6 rounded-xl text-white w-full">
//           <SalesTrends />
//         </div>

//         {/* Right side (stacked vertically) */}
//         <div className="flex flex-col gap-4 w-full lg:col-span-1">
//           <div className="p-1 rounded-xl text-black shadow w-full">
//             <TotalProfitCard />
//           </div>
//           <div className="p-1 rounded-xl shadow w-full">
//             <RegisteredUsersChart />
//           </div>
//         </div>
//       </div>

//       {/* Users Overview */}
//       <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2 '>
//         <div>
//           <TopProductsTable />
//         </div>
//         <div className=" rounded-xl  shadow">
//           <RecentOrdersTable />
//         </div>
//       </div>

//     </div>
//   )
// }

// export default AdminDashboard