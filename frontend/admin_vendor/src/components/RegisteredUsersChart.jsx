// import React, { useState } from 'react';
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from 'recharts';

// const monthlyData = [
//   { label: 'Jan', value: 0 }, { label: 'Feb', value: 80 }, { label: 'Mar', value: 20 },
//   { label: 'Apr', value: 100 }, { label: 'May', value: 30 }, { label: 'Jun', value: 90 },
//   { label: 'Jul', value: 10 }, { label: 'Aug', value: 110 }, { label: 'Sep', value: 40 },
//   { label: 'Oct', value: 0 }, { label: 'Nov', value: 70 }, { label: 'Dec', value: 20 },
// ];

// const dailyData = [
//   { label: 'Mon', value: 30 }, { label: 'Tue', value: 90 }, { label: 'Wed', value: 40 },
//   { label: 'Thu', value: 100 }, { label: 'Fri', value: 50 }, { label: 'Sat', value: 110 },
//   { label: 'Sun', value: 10 },
// ];

// const UserRegistrationChart = () => {
//   const [view, setView] = useState('Monthly');

//   const data = view === 'Monthly' ? monthlyData : dailyData;

//   return (
//     <div className=" p-1 w-full ">
//       <div className="flex justify-between items-start mb-3">
//         <div>
//           <h3 className="text-sm  flex items-center gap-1">
//             <div className="w-4 h-4 text-pink-600" />
//             <span className='font-bold'>Newly </span> Registered User's ({view})
//           </h3>
//           {/* <h1 className="text-2xl font-bold mt-1">Report</h1> */}
//         </div>
//         <select
//           value={view}
//           onChange={(e) => setView(e.target.value)}
//           className="border text-sm rounded-md px-2 py-1"
//         >
//           <option>Monthly</option>
//           <option>Daily</option>
//         </select>
//       </div>

//       <ResponsiveContainer width="100%" height={250}>
//         <LineChart data={data}>
//           <XAxis dataKey="label" stroke="#999" />
//           <YAxis stroke="#999" />
//           <Tooltip />
//           <Line
//             type="monotone"
//             dataKey="value"
//             stroke="#f72fff"
//             strokeWidth={2}
//             dot={false}
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>

//       {/* <div className="mt-4 text-right">
//         <p className="text-sm text-pink-600 hover:underline cursor-pointer">
//           Download Report
//         </p>
//       </div> */}
//     </div>
//   );
// };

// export default UserRegistrationChart;
