import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { getAdminDashboardApi } from "../../../services/allAPI";

const fallbackProducts = {
  "Last 30 days": [
    { id: 1, name: "Wireless Headphones", category: "Electronics", unitsSold: 560, revenue: 84000 },
    { id: 2, name: "Smart Watch", category: "Gadgets", unitsSold: 470, revenue: 70500 },
    { id: 3, name: "Gaming Keyboard", category: "Accessories", unitsSold: 380, revenue: 45600 },
  ],
  "This Month": [
    { id: 1, name: "Bluetooth Speaker", category: "Audio", unitsSold: 240, revenue: 28800 },
    { id: 2, name: "Wireless Mouse", category: "Accessories", unitsSold: 210, revenue: 18900 },
  ],
  "This Year": [
    { id: 1, name: "USB-C Charger", category: "Electronics", unitsSold: 300, revenue: 22500 },
    { id: 2, name: "Noise Cancelling Headphones", category: "Audio", unitsSold: 600, revenue: 96000 },
    { id: 3, name: "Laptop Stand", category: "Office", unitsSold: 450, revenue: 40500 },
    { id: 4, name: "Smart Light", category: "Home", unitsSold: 380, revenue: 34200 },
  ],
};

const TopProductsTable = () => {
  const [filter, setFilter] = useState("Last 30 days");
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopProducts = async () => {
    try {
      const data = await getAdminDashboardApi();
      const fetchedProducts = data?.most_sold_products || [];
      setTopProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      // fallback if API fails
      setTopProducts(fallbackProducts[filter]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [filter]);

  const productsToShow = topProducts.length ? topProducts : fallbackProducts[filter];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Top Products</h2>
        {/* <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md text-sm px-2 py-1"
          >
            {Object.keys(fallbackProducts).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-full" title="Download Report">
            <FaDownload size={18} className="text-gray-600" />
          </button>
        </div> */}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-4">Loading top products...</p>
      ) : (
        <table className="w-full text-sm text-left ">
          <thead>
            <tr className="text-gray-600 bg-gray-100 ">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Product</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2 text-right">Units Sold</th>
              <th className="py-2 px-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {productsToShow.map((product, index) => (
              <tr key={product.id || index} className=" hover:bg-gray-50">
                <td className="py-2 px-2 text-gray-600">{index + 1}</td>
                <td className="py-2 px-2 font-medium">{product.product_name}</td>
                <td className="py-2 px-2 text-gray-700">{product.category || "-"}</td>
                <td className="py-2 px-2 text-right">{product.total_sold ||  0}</td>
                <td className="py-2 px-2 text-right font-semibold">
                  ₹{(product.revenue || product.total_revenue || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopProductsTable;
