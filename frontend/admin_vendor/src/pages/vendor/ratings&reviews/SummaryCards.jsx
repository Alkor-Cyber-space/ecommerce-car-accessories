import React from 'react';
import { BsStar } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import userImage from '../../../assets/user.jpg';
import car from '../../../assets/car.jpeg'
import { Link } from 'react-router-dom';

const data = [
    { month: 'Jan', reviews: 90 },
    { month: 'Feb', reviews: 100 },
    { month: 'Mar', reviews: 85 },
    { month: 'Apr', reviews: 120 },
    { month: 'May', reviews: 95 },
    { month: 'Jun', reviews: 130 },
];

const ratings = [
    { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
    { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
    { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
    { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
];

const SummaryCards = () => {
    return (
 <div className="flex flex-col lg:flex-row gap-6">
  {/* Total Reviews Card */}
  <div className="bg-white w-full lg:w-1/2 sm:w-xl p-6 rounded-xl shadow">
    <div className="flex items-center gap-2 font-semibold">
      <BsStar /> Total Reviews
    </div>
    <div className="text-xl font-bold mb-6">
      43 <span className="text-red-500 text-sm">(-12.6%)</span>
    </div>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="reviews"
            fill="#A66CFF"
            radius={[4, 4, 0, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <hr className="text-[#D8D8D8] my-3" />
    <div className="mt-3 text-right">
      <Link className="text-sm text-[#5737B4]">Download Report</Link>
    </div>
  </div>

  {/* Total Ratings Card */}
  <div className="bg-white w-full lg:w-1/2 sm:w-xl p-6 rounded-xl shadow">
    <div className="flex gap-2 items-center font-semibold mb-6">
      <BsStar /> Total Ratings
    </div>
    <div className="overflow-auto max-h-60 scrollbar-none">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">User Details</th>
            <th className="py-2">Product Image</th>
            <th className="py-2">Product Details</th>
            <th className="py-2">Ratings</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((entry, index) => (
            <tr key={index} className="border-b align-middle">
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <img src={userImage} alt="User" className="w-10 h-10 rounded" />
                  <span>{entry.name}</span>
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center justify-center">
                  <img src={car} className="w-12 h-12" alt="" />
                </div>
              </td>
              <td className="py-3">{entry.product}</td>
              <td className="py-3 text-[#5737B4] font-semibold">
                <div className="flex items-center gap-1">
                  {entry.rating} <span className="text-yellow-400">⭐</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

    );
};

export default SummaryCards;
