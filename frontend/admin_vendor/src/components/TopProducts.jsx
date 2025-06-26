import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa6';

const allProducts = {
  'Last 30 days': [
    { id: 1, name: 'Wireless Headphones', category: 'Electronics', unitsSold: 560, revenue: 84000 },
    { id: 2, name: 'Smart Watch', category: 'Gadgets', unitsSold: 470, revenue: 70500 },
    { id: 3, name: 'Gaming Keyboard', category: 'Accessories', unitsSold: 380, revenue: 45600 },
  ],
  'This Month': [
    { id: 1, name: 'Bluetooth Speaker', category: 'Audio', unitsSold: 240, revenue: 28800 },
    { id: 2, name: 'Wireless Mouse', category: 'Accessories', unitsSold: 210, revenue: 18900 },
  ],
  'This Year': [
    { id: 1, name: 'USB-C Charger', category: 'Electronics', unitsSold: 300, revenue: 22500 },
    { id: 2, name: 'Noise Cancelling Headphones', category: 'Audio', unitsSold: 600, revenue: 96000 },
    { id: 3, name: 'Laptop Stand', category: 'Office', unitsSold: 450, revenue: 40500 },
    { id: 4, name: 'Smart Light', category: 'Home', unitsSold: 380, revenue: 34200 },
  ],
};

const TopProductsTable = () => {
  const [filter, setFilter] = useState('Last 30 days');
  const products = allProducts[filter];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Top Products</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md text-sm px-2 py-1"
          >
            {Object.keys(allProducts).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-full" title="Download Report">
            <FaDownload size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <table className="w-full text-sm text-left border-t">
        <thead>
          <tr className="text-gray-600 border-b">
            <th className="py-2 px-2">#</th>
            <th className="py-2 px-2">Product</th>
            <th className="py-2 px-2">Category</th>
            <th className="py-2 px-2 text-right">Units Sold</th>
            <th className="py-2 px-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-2 text-gray-600">{product.id}</td>
              <td className="py-2 px-2 font-medium">{product.name}</td>
              <td className="py-2 px-2 text-gray-700">{product.category}</td>
              <td className="py-2 px-2 text-right">{product.unitsSold}</td>
              <td className="py-2 px-2 text-right font-semibold">${product.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;
