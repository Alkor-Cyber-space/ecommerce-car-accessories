import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaEdit, FaTrash } from "react-icons/fa";

const dummyProducts = [
  {
    id: 1,
    name: "Car Floor Mats",
    image: "https://via.placeholder.com/80",
    category: "Interior Accessories",
    price: 999,
    stock: 20,
    status: "Active",
  },
  {
    id: 2,
    name: "LED Headlights",
    image: "https://via.placeholder.com/80",
    category: "Lighting",
    price: 3599,
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 3,
    name: "Wiper Blades",
    image: "https://via.placeholder.com/80",
    category: "Maintenance",
    price: 499,
    stock: 3,
    status: "Active",
  },
];

const COLORS = ["#34d399", "#fbbf24", "#f87171"];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Replace this with your API fetch
    setProducts(dummyProducts);
  }, []);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Chart Data: Stock Breakdown
  const stockStats = {
    inStock: products.filter((p) => p.stock >= 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const chartData = [
    { name: "In Stock", value: stockStats.inStock },
    { name: "Low Stock", value: stockStats.lowStock },
    { name: "Out of Stock", value: stockStats.outOfStock },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Products</h1>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Stock Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-green-600">In Stock: {stockStats.inStock}</span>
            <span className="text-yellow-600">Low Stock: {stockStats.lowStock}</span>
            <span className="text-red-600">Out: {stockStats.outOfStock}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border border-gray-300 p-2 rounded w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Product Table */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow-md">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">₹{product.price}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan="7">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
