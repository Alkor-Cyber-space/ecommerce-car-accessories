import React, { useEffect, useState } from "react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

export default function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const data = [
      {
        date: "2025-06-20",
        orderId: "#ORD1023",
        product: "Engine Oil",
        vendor: "AutoZone",
        buyer: "John Doe",
        qty: 2,
        price: 850,
        total: 1700,
        commission: 170,
        earnings: 1530,
      },
      {
        date: "2025-06-21",
        orderId: "#ORD1024",
        product: "Car Cover",
        vendor: "CoverPro",
        buyer: "Jane Smith",
        qty: 1,
        price: 1200,
        total: 1200,
        commission: 120,
        earnings: 1080,
      },
    ];
    setSalesData(data);
    setFilteredData(data);
  }, []);

  const filterDataByDate = () => {
    const filtered = salesData.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (
        (!from || itemDate >= from) &&
        (!to || itemDate <= to)
      );
    });
    setFilteredData(filtered);
  };

  const formatINR = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const getTotalRevenue = () =>
    filteredData.reduce((acc, item) => acc + item.total, 0);

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text("Sales Report - Car Accessories", 14, 20);
//     doc.setFontSize(11);
//     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

//     const headers = [
//       "Date", "Order ID", "Product", "Vendor", "Buyer", "Qty",
//       "Price", "Total", "Commission", "Earnings"
//     ];

//     const rows = filteredData.map((item) => [
//       item.date,
//       item.orderId,
//       item.product,
//       item.vendor,
//       item.buyer,
//       item.qty,
//       formatINR(item.price),
//       formatINR(item.total),
//       formatINR(item.commission),
//       formatINR(item.earnings),
//     ]);

//     // Add summary row
//     rows.push([
//       "", "", "", "", "", "", "", formatINR(getTotalRevenue()), "", "Total Revenue"
//     ]);

//     doc.autoTable({
//       startY: 35,
//       head: [headers],
//       body: rows,
//       theme: "striped",
//       styles: { fontSize: 10, overflow: "linebreak", cellPadding: 2 },
//       headStyles: { fillColor: [41, 128, 185] },
//       columnStyles: {
//         5: { halign: "right" },
//         6: { halign: "right" },
//         7: { halign: "right" },
//         8: { halign: "right" },
//         9: { halign: "right" },
//       },
//     });

//     doc.save("Sales_Report_Car_Accessories.pdf");
//   };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sales Report</h1>

      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          onClick={filterDataByDate}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Apply Filter
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Order ID</th>
            <th className="border px-2 py-1">Product</th>
            <th className="border px-2 py-1">Vendor</th>
            <th className="border px-2 py-1">Buyer</th>
            <th className="border px-2 py-1 text-right">Qty</th>
            <th className="border px-2 py-1 text-right">Price</th>
            <th className="border px-2 py-1 text-right">Total</th>
            <th className="border px-2 py-1 text-right">Commission</th>
            <th className="border px-2 py-1 text-right">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.date}</td>
              <td className="border px-2 py-1">{item.orderId}</td>
              <td className="border px-2 py-1">{item.product}</td>
              <td className="border px-2 py-1">{item.vendor}</td>
              <td className="border px-2 py-1">{item.buyer}</td>
              <td className="border px-2 py-1 text-right">{item.qty}</td>
              <td className="border px-2 py-1 text-right">{formatINR(item.price)}</td>
              <td className="border px-2 py-1 text-right">{formatINR(item.total)}</td>
              <td className="border px-2 py-1 text-right">{formatINR(item.commission)}</td>
              <td className="border px-2 py-1 text-right">{formatINR(item.earnings)}</td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-100">
            <td colSpan="7" className="border px-2 py-1 text-left">Total Revenue</td>
            <td className="border px-2 py-1 text-right">{formatINR(getTotalRevenue())}</td>
            {/* <td colSpan="2" className="border px-2 py-1 text-right">—</td> */}
          </tr>
        </tbody>
      </table>

      {/* <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={downloadPDF}
      >
        Download PDF
      </button> */}
    </div>
  );
}
