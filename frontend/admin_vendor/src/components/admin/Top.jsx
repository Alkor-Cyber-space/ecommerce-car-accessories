import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { salesAnalyticsApi } from "../../services/allAPI";


const vendorData = [
  { name: "AutoSpire", value: 55000 },
  { name: "TorqueLine", value: 72000 },
  { name: "DriveDeck", value: 96000 },
  { name: "MotoMend", value: 79000 },
  { name: "FixNDrive", value: 101000 },
];

const productData = [
  { name: "AutoGrip", value: 7000 },
  { name: "ProLux H...", value: 12000 },
  { name: "XenoTrac...", value: 28000 },
  { name: "SpeedFlus...", value: 26000 },
  { name: "RoadMax...", value: 18000 },
];

export default function TopSalesOverview() {
  const [topVendors, setTopVendors] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchTopList = async () => {
      try {
        const data = await salesAnalyticsApi(); // Assuming this API call works
        setTopVendors(data?.top_vendors || []); // Safeguard for empty data
        setTopProducts(data?.top_products || []); // Safeguard for empty data
        console.log("toplist", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTopList();
  }, []);
  const shortenName = (name) => {
    const maxLength = 8;  // You can adjust this length
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Vendors Card */}
      <div className="bg-white rounded-2xl p-6 shadow border border-[#D8D8D8] flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 text-md">Top 5 Vendors By Sales</h3>
          <button className="text-sm bg-[#5737B4] text-white px-4 py-1.5 rounded-full">
            Download Full Report
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topVendors}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" tickFormatter={(v) => `₹ ${v / 1000}K`} />
              <YAxis
                type="category"
                dataKey="vendor_email"
                width={100}
                tickFormatter={(value) => shortenName(value)}  // Corrected here
              />
              <Tooltip formatter={(val) => [`₹ ${val.toLocaleString()}`, "Sales"]} />
              <Bar dataKey="total_sales" radius={[0, 6, 6, 0]} fill="#D65CFF">
                {topVendors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#D65CFF" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>
      </div>

      {/* Products Card */}
      <div className="bg-white rounded-2xl p-6 shadow border border-[#D8D8D8] flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 text-md">Top 5 Products By Sales</h3>
          <button className="text-sm bg-[#5737B4] text-white px-4 py-1.5 rounded-full">
            Download Full Report
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" tickFormatter={(v) => `₹ ${v / 1000}K`} />
              <YAxis type="category" dataKey="product_name" width={100} tickFormatter={(value) => shortenName(value)} />
              <Tooltip formatter={(val) => [`₹ ${val.toLocaleString()}`, "Sales"]} />
              <Bar dataKey="total_sales" radius={[0, 6, 6, 0]} fill="#3BB8FF">
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3BB8FF" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
