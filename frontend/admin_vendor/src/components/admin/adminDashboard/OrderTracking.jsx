import React, { useEffect, useState } from 'react';
import { getVendorDashboardApi } from '../../../services/allAPI';

const statusStyles = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-green-100 text-green-700',
  'order Processing': 'bg-green-200 text-green-800',
  'product Shipped': 'bg-emerald-200 text-emerald-800',
  'returned': 'bg-yellow-200 text-yellow-800',
  'delivered': 'bg-red-200 text-red-700',
  'canceled': 'bg-gray-300 text-gray-700',
};

const ITEMS_PER_PAGE = 7;

const RecentOrdersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // store selected month

const fetchOrders = async () => {
  try {
    const data = await getVendorDashboardApi();
    const allOrders = data.recent_orders || [];
    const last15Orders = allOrders.slice(-15).reverse(); // get the last 15, newest first
    setAllOrders(last15Orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};


  useEffect(() => {
    fetchOrders(); // initial load
    const interval = setInterval(fetchOrders, 10000); // refresh every 10 sec
    return () => clearInterval(interval); // cleanup
  }, []);

  // Filter orders by selected month
  const filteredOrders = selectedMonth
    ? allOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      const monthYear = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getFullYear()}`;
      return monthYear === selectedMonth;
    })
    : allOrders;

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  // Generate unique months dynamically from orders
  const monthOptions = React.useMemo(() => {
    const monthsSet = new Set(
      allOrders.map((order) => {
        const date = new Date(order.created_at);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      })
    );
    // Sort months descending (latest first)
    return Array.from(monthsSet).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateB - dateA;
    });
  }, [allOrders]);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
    if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        {/* <select
          className="border rounded-md text-sm px-2 py-1"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setCurrentPage(1); // reset page when changing month
          }}
        >
          <option value="">All Months</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select> */}

      </div>

      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-gray-600 bg-gray-100">
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
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-2">
                  <input type="checkbox" />
                </td>
                <td className="py-2 px-2 font-medium">{order.id}</td>
                <td className="py-2 px-2 text-gray-700">
                  {new Date(order.created_at).toLocaleDateString()}{" "}
                  {new Date(order.created_at).toLocaleTimeString()}
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`text-xs font-medium px-3 py-2 rounded-full ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-semibold">
                  ${order.total_price}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-6 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-gray-600">
          Page {currentPage} of {totalPages || 1}
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
            disabled={currentPage === totalPages || totalPages === 0}
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
