import React from "react";
import { FaStar, FaUndo, FaClock, FaPercent } from "react-icons/fa";

const sampleProductData = [
  {
    name: "Alloy Wheels",
    conversionRate: 3.5,
    returnRate: 1.2,
    avgRating: 4.6,
    dispatchTime: "1.2 days"
  },
  {
    name: "Seat Covers",
    conversionRate: 2.9,
    returnRate: 0.9,
    avgRating: 4.2,
    dispatchTime: "1.8 days"
  },
  {
    name: "LED Headlights",
    conversionRate: 4.1,
    returnRate: 2.1,
    avgRating: 4.8,
    dispatchTime: "1.0 days"
  },
  {
    name: "Floor Mats",
    conversionRate: 3.2,
    returnRate: 0.5,
    avgRating: 4.5,
    dispatchTime: "2.2 days"
  }
];

const ProductPerformanceTable = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Per-Product Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600"><FaPercent className="inline mr-1" /> Conversion Rate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600"><FaUndo className="inline mr-1" /> Return Rate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600"><FaStar className="inline mr-1" /> Avg Rating</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600"><FaClock className="inline mr-1" /> Dispatch Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sampleProductData.map((product, index) => (
              <tr key={index}>
                <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{product.name}</td>
                <td className="px-4 py-3 text-gray-600">{product.conversionRate}%</td>
                <td className="px-4 py-3 text-gray-600">{product.returnRate}%</td>
                <td className="px-4 py-3 text-gray-600">{product.avgRating} / 5</td>
                <td className="px-4 py-3 text-gray-600">{product.dispatchTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPerformanceTable;
