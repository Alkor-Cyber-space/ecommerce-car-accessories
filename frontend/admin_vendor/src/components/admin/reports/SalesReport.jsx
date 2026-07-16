import React, { useEffect, useState } from "react";
import { salesReportApi, exportReportApi } from "../../../services/allAPI";

export default function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setIsLoading(true);
        const data = await salesReportApi()
        setSalesData(data);
        setFilteredData(data);
        console.log(data);

      } catch (error) {
        console.log("sales report", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalesReport()
  }, []);

  const filterDataByDate = () => {
    const filtered = salesData.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getTotalRevenue = () =>
    filteredData.reduce((acc, item) => acc + Number(item.total || 0), 0);

  // Pagination 
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownloadReport = async (format) => {
    try {
      setShowDownloadOptions(false);
      setIsDownloading(true);
      const tableData = filteredData.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-GB"),
        order_id: item.order_id,
        product: item.product,
        vendor: item.vendor,
        buyer: item.buyer,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        commission: item.commission,
        earnings: item.earnings
      }));

      const response = await exportReportApi(
        "sales_report",
        format,
        tableData
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales_report.${format === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-[#ECECF0] p-6 rounded-2xl w-full space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-[#5737B4]">Sales Report</h1>

        <div className="flex flex-wrap items-end  gap-4  ">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 
                 focus:ring-2 focus:ring-[#406EDC] focus:border-[#406EDC] 
                 transition-all duration-200 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 
                 focus:ring-2 focus:ring-[#406EDC] focus:border-[#406EDC] 
                 transition-all duration-200 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={filterDataByDate}
            className="bg-[#5737B4] hover:bg-[#2f093d] text-white font-medium 
               px-6 py-2.5 rounded-md shadow-md hover:shadow-lg 
               transition-all duration-200 whitespace-nowrap"
          >
            Apply Filter
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              disabled={isDownloading}
              className={`bg-[#5737B4] hover:bg-[#2f093d] text-white font-medium px-6 py-2.5 rounded-md md:sm shadow-md hover:shadow-lg transition-all ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isDownloading ? 'Downloading...' : 'Download Report'}
            </button>

            {showDownloadOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10 border border-gray-100">
                <button
                  onClick={() => handleDownloadReport("pdf")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md"
                >
                  Download as PDF
                </button>
                <button
                  onClick={() => handleDownloadReport("excel")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-md"
                >
                  Download as Excel
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-2 text-left">Date</th>
              <th className="py-4 px-2">Order ID</th>
              <th className="py-4 px-4 text-left">Product</th>
              <th className="py-4 px-4 text-left">Vendor</th>
              <th className="py-4 px-2 text-left">Buyer</th>
              <th className="py-4 px-2 text-left">Qty</th>
              <th className="py-4 px-2 text-left">Price</th>
              <th className="py-4 px-2 text-left">Total</th>
              <th className="py-4 px-1 text-left">Commission</th>
              <th className="py-4 px-2 text-left">Earnings</th>
            </tr>
          </thead>
        <tbody>
  {isLoading ? (
    <tr>
      <td
        colSpan="10"
        className="py-6 text-center text-gray-500 font-medium"
      >
        <div className="flex justify-center items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#5737B4] border-t-transparent rounded-full animate-spin"></div>
          Loading data...
        </div>
      </td>
    </tr>
  ) : paginatedData.length === 0 ? (
    <tr>
      <td
        colSpan="10"
        className="py-6 text-center text-gray-500 font-medium"
      >
        No sales data available.
      </td>
    </tr>
  ) : (
    paginatedData.map((item, index) => (
      <tr key={index} className="text-left hover:bg-gray-50 ">
        <td className="py-3 px-2 ">
          {new Date(item.date).toLocaleDateString("en-GB")}
        </td>
        <td className="py-3 px-2 ">{item.order_id}</td>
        <td className="py-3 px-2 min-w-[140px]">{item.product}</td>
        <td className="py-3 px-1 min-w-[140px]">{item.vendor}</td>
        <td className="py-3 px-1 min-w-[140px]">{item.buyer}</td>
        <td className="py-3 px-2">{item.quantity}</td>
        <td className="py-3 px-2">{formatINR(item.price)}</td>
        <td className="py-3 px-2">{formatINR(item.total)}</td>
        <td className="py-3 px-1">{formatINR(item.commission)}</td>
        <td className="py-3 px-2">{formatINR(item.earnings)}</td>
      </tr>
    ))
  )}
</tbody>

          <tfoot>
            <tr className="font-semibold border-t border-gray-200">
              <td className="py-3 px-6 text-left w-35">Total Revenue</td>
              <td colSpan={6}></td>
              <td className="py-3 px-6">{formatINR(getTotalRevenue())}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
        {/* Pagination */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i + 1 ? "bg-[#5737B4] text-white" : "bg-gray-200"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Next
          </button>
        </div>
    </div>
  );
}
