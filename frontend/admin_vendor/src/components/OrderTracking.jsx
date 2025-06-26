import React, { useState } from 'react';

const allOrders = [
  { id: '#1532', date: 'Dec 30, 10:06 AM', status: 'Order Placed', amount: 3290.40 },
  { id: '#1531', date: 'Dec 29, 2:59 AM', status: 'Order Processing', amount: 1170.24 },
  { id: '#1530', date: 'Dec 29, 12:54 AM', status: 'Product Shipped', amount: 5200.16 },
  { id: '#1529', date: 'Dec 28, 2:32 PM', status: 'Returned', amount: 35000.52 },
  { id: '#1528', date: 'Dec 27, 2:20 PM', status: 'Delivered', amount: 2460.78 },
  { id: '#1527', date: 'Dec 26, 9:48 AM', status: 'Delivered', amount: 1990.10 },
  { id: '#1526', date: 'Dec 25, 10:12 AM', status: 'Canceled', amount: 1490.00 },
  { id: '#1525', date: 'Dec 24, 11:42 AM', status: 'Canceled', amount: 780.50 },
];

const statusStyles = {
  'Order Placed': 'bg-green-100 text-green-700',
  'Order Processing': 'bg-green-200 text-green-800',
  'Product Shipped': 'bg-emerald-200 text-emerald-800',
  'Returned': 'bg-yellow-200 text-yellow-800',
  'Delivered': 'bg-red-200 text-red-700',
  'Canceled': 'bg-gray-300 text-gray-700',
};

const ITEMS_PER_PAGE = 5;

const RecentOrdersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = allOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        <select className="border rounded-md text-sm px-2 py-1">
          <option>Jan 2024</option>
          <option>Feb 2024</option>
        </select>
      </div>

      <table className="w-full text-sm text-left border-t">
        <thead>
          <tr className="text-gray-600 border-b">
            <th className="py-2 px-2">
              <input type="checkbox" />
            </th>
            <th className="py-2 px-2">Order</th>
            <th className="py-2 px-2">Date</th>
            <th className="py-2 px-2">Status</th>
            <th className="py-2 px-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="py-2 px-2">
                <input type="checkbox" />
              </td>
              <td className="py-2 px-2 font-medium">{order.id}</td>
              <td className="py-2 px-2 text-gray-700">{order.date}</td>
              <td className="py-2 px-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-2 px-2 text-right font-semibold">${order.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
