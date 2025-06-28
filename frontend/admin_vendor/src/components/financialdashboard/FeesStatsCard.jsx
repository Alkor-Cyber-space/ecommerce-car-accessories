// // src/components/FeeStatsCard.jsx
// import React from "react";

// export default function FeeStatsCard() {
//   const stats = {
//     commissionEarned: 52000,
//     transactionFees: 3500,
//     refundsDeducted: 8000,
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       {Object.entries(stats).map(([key, value]) => (
//         <div key={key} className="bg-white shadow p-4 rounded">
//           <h3 className="text-md text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</h3>
//           <p className="text-xl font-bold text-blue-600">₹{value.toLocaleString()}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
