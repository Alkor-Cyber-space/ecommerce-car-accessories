// import React from "react";
// import { FaBell, FaSyncAlt } from "react-icons/fa";

// // Dummy data for inventory
// const dummyData = [
//   {
//     id: 1,
//     name: "Air Filter",
//     sku: "AF-124",
//     category: "Engine",
//     carModel: "Swift 2018",
//     stock: 32,
//     status: "In Stock",
//     lastRestocked: "2025-06-12",
//     vendor: "XYZ Motors",
//     cost: 450,
//     price: 650,
//     image: "/img/airfilter.jpg",
//   },
//   {
//     id: 2,
//     name: "Brake Pad",
//     sku: "BP-567",
//     category: "Brakes",
//     carModel: "Innova 2020",
//     stock: 3,
//     status: "Low Stock",
//     lastRestocked: "2025-06-10",
//     vendor: "Autoplus",
//     cost: 700,
//     price: 950,
//     image: "/img/brakepad.jpg",
//   },
// ];

// export default function InventoryDashboard() {
//   const statusColor = {
//     "In Stock": "bg-green-100 text-green-700",
//     "Low Stock": "bg-yellow-100 text-yellow-700",
//     "Out of Stock": "bg-red-100 text-red-700",
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Inventory Control</h1>
//         <div className="flex items-center gap-4">
//           <FaBell className="text-xl text-gray-600 cursor-pointer" />
//           <FaSyncAlt className="text-xl text-gray-600 cursor-pointer" />
//         </div>
//       </div>

//       {/* Filter Panel */}
//       <div className="bg-white p-4 rounded shadow mb-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <input
//             type="text"
//             placeholder="Search by product name..."
//             className="p-2 border rounded w-full"
//           />
//           <select className="p-2 border rounded w-full">
//             <option>All Categories</option>
//             <option>Engine</option>
//             <option>Brakes</option>
//             <option>Electrical</option>
//           </select>
//           <select className="p-2 border rounded w-full">
//             <option>Status: All</option>
//             <option>In Stock</option>
//             <option>Low Stock</option>
//             <option>Out of Stock</option>
//           </select>
//           <select className="p-2 border rounded w-full">
//             <option>All Vendors</option>
//             <option>XYZ Motors</option>
//             <option>Autoplus</option>
//           </select>
//         </div>
//       </div>

//       {/* Inventory Table */}
//       <div className="bg-white rounded shadow overflow-x-auto">
//         <table className="w-full table-auto text-sm text-left">
//           <thead className="bg-gray-100 text-gray-700">
//             <tr>
//               <th className="p-3">Image</th>
//               <th className="p-3">Product</th>
//               <th className="p-3">Category</th>
//               <th className="p-3">Car Model</th>
//               <th className="p-3">Stock</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Restocked</th>
//               <th className="p-3">Vendor</th>
//               <th className="p-3">Cost</th>
//               <th className="p-3">Price</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {dummyData.map((item) => (
//               <tr key={item.id} className="border-t hover:bg-gray-50">
//                 <td className="p-3">
//                   <img
//                     src={item.image}
//                     alt={item.name}
//                     className="w-12 h-12 object-cover rounded"
//                   />
//                 </td>
//                 <td className="p-3">
//                   <div className="font-semibold">{item.name}</div>
//                   <div className="text-xs text-gray-500">SKU: {item.sku}</div>
//                 </td>
//                 <td className="p-3">{item.category}</td>
//                 <td className="p-3">{item.carModel}</td>
//                 <td className="p-3">{item.stock} pcs</td>
//                 <td className="p-3">
//                   <span
//                     className={`px-2 py-1 rounded text-xs font-medium ${statusColor[item.status]}`}
//                   >
//                     {item.status}
//                   </span>
//                 </td>
//                 <td className="p-3">{item.lastRestocked}</td>
//                 <td className="p-3">{item.vendor}</td>
//                 <td className="p-3">₹{item.cost}</td>
//                 <td className="p-3">₹{item.price}</td>
//                 <td className="p-3">
//                   <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
//                     Update
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
