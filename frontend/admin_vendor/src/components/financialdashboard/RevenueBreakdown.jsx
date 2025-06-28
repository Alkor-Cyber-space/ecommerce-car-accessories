// import React, { useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   FaArrowUp,
//   FaArrowDown,
// } from "react-icons/fa";

// // Mock dataset with multiple periods
// const revenueSets = {
//   "This Month vs Last Month": {
//     current: [
//       { name: "Product Sales", value: 500000 },
//       { name: "Shipping Revenue", value: 70000 },
//       { name: "Discounts Given", value: -20000 },
//       { name: "Returns", value: -10000 },
//     ],
//     previous: {
//       "Product Sales": 450000,
//       "Shipping Revenue": 80000,
//       "Discounts Given": -15000,
//       "Returns": -8000,
//     },
//   },
//   "This Year vs Last Year": {
//     current: [
//       { name: "Product Sales", value: 5600000 },
//       { name: "Shipping Revenue", value: 720000 },
//       { name: "Discounts Given", value: -240000 },
//       { name: "Returns", value: -120000 },
//     ],
//     previous: {
//       "Product Sales": 4800000,
//       "Shipping Revenue": 650000,
//       "Discounts Given": -200000,
//       "Returns": -100000,
//     },
//   },
// };

// const COLORS = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444"];

// function getChange(current, previous) {
//   const diff = current - previous;
//   const percent = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
//   return {
//     isNegative: diff < 0,
//     percent: Math.abs(percent.toFixed(1)),
//     arrow: diff < 0 ? <FaArrowDown className="text-red-500" /> : <FaArrowUp className="text-green-600" />,
//     colorClass: diff < 0 ? "text-red-500" : "text-green-600",
//   };
// }

// export default function RevenueBreakdown() {
//   const [range, setRange] = useState("This Month vs Last Month");
//   const currentData = revenueSets[range].current;
//   const previousData = revenueSets[range].previous;

//   const totalCurrent = currentData.reduce((sum, item) => sum + item.value, 0);
//   const totalPrevious = Object.values(previousData).reduce((sum, val) => sum + val, 0);
//   const totalChange = getChange(totalCurrent, totalPrevious);

//   return (
//     <div className="bg-white shadow p-4 rounded">
//       <div className="flex flex-wrap justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">Revenue Breakdown</h2>
//         <select
//           value={range}
//           onChange={(e) => setRange(e.target.value)}
//           className="border rounded px-2 py-1 text-sm text-gray-700"
//         >
//           {Object.keys(revenueSets).map((key) => (
//             <option key={key} value={key}>{key}</option>
//           ))}
//         </select>
//       </div>

//       {/* Total Comparison */}
//       <div className="mb-4 items-center text-right justify-between">
//         <div className="text-gray-700 font-medium ">Total Revenue:</div>
//         <div className="text-right flex flex-col items-end">
//           <div className="text-gray-800 font-semibold text-lg">₹{totalCurrent.toLocaleString()}</div>
//           <div className={`flex items-center gap-1 text-sm ${totalChange.colorClass}`}>
//             {totalChange.arrow}
//             {totalChange.percent}% vs previous
//           </div>
//         </div>
//       </div>

//       {/* Chart + Breakdown */}
//       <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//         {/* Pie Chart */}
//         <div className="w-full md:w-1/2">
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={currentData}
//                 dataKey="value"
//                 nameKey="name"
//                 outerRadius={120}
//                 labelLine={false}
//               >
//                 {currentData.map((entry, index) => (
//                   <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Description List */}
//         <div className="w-full md:w-1/2 space-y-4">
//           {currentData.map((item, index) => {
//             const prev = previousData[item.name] || 0;
//             const change = getChange(item.value, prev);
//             const absValue = Math.abs(item.value);
            

//             return (
//               <div key={index} className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <span
//                     className="w-3 h-3 rounded-full inline-block"
//                     style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                   ></span>
//                   <span className="text-gray-700 font-medium">{item.name}</span>
//                 </div>

//                 <div className="text-right">
//                   <div className="text-sm font-semibold text-gray-700">
//                     ₹{absValue.toLocaleString()}
//                   </div>
//                   <div className={`flex items-center gap-1 text-xs ${change.colorClass}`}>
//                     {change.arrow}
//                     {change.percent}% vs prev
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
