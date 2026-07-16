import React, { useEffect, useState } from "react";
import { transactionReportApi, exportReportApi } from "../../../services/allAPI";

export default function TransactionReport() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await transactionReportApi();
        setTransactions(data);
        setFilteredData(data);
        console.log("Transaction report data:", data);
      } catch (error) {
        console.error("Transaction report error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const filterDataByDate = () => {
    const filtered = transactions.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

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

  const getTotalReceived = () =>
    filteredData.reduce(
      (acc, item) =>
        acc + (Number(item.amount || 0) - (Number(item.refund || 0) + Number(item.gateway_fee || 0))),
      0
    );

  const handleDownloadReport = async (format) => {
    try {
      setShowDownloadOptions(false);
      setIsDownloading(true);
      const tableData = filteredData.map((item) => {
        const netReceived = Number(item.amount || 0) - (Number(item.refund || 0) + Number(item.gateway_fee || 0));
        return {
          date: new Date(item.date).toLocaleDateString("en-GB"),
          order_id: item.order_id,
          buyer: item.buyer,
          payment_method: item.payment_method,
          status: item.status,
          amount: item.amount,
          refund: item.refund,
          gateway_fee: item.gateway_fee,
          net_received: netReceived
        };
      });

      const response = await exportReportApi(
        "transaction_report",
        format,
        tableData
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transaction_report.${format === "pdf" ? "pdf" : "xlsx"}`);
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
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-4">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Report</h1>

        <div className="flex flex-wrap items-end gap-4   ">
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
              className={`bg-[#5737B4] hover:bg-[#2f093d] text-white font-medium 
                         px-6 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-2 text-left">Date</th>
              <th className="py-4 px-2 text-left">Order ID</th>
              <th className="py-4 px-2 text-left">Buyer</th>
              <th className="py-4 px-2 text-left">Payment Method</th>
              <th className="py-4 px-2 ">Status</th>
              <th className="py-4 px-2 ">Amount</th>
              <th className="py-4 px-2 text-left">Refund</th>
              <th className="py-4 px-2 text-left">Gateway Fee</th>
              <th className="py-4 px-2 text-left">Net Received</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#5737B4] border-t-transparent rounded-full animate-spin"></div>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const netReceived =
                  Number(item.amount || 0) -
                  (Number(item.refund || 0) + Number(item.gateway_fee || 0));

                return (
                  <tr key={index} className="text-left hover:bg-gray-50">
                    <td className="py-3 px-2">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-2">{item.order_id}</td>
                    <td className="py-3 px-2">{item.buyer}</td>
                    <td className="py-3 px-2">{item.payment_method}</td>
                    <td
                      className={`py-3 px-2 font-medium ${item.status === "confirmed"
                          ? "text-green-600"
                          : item.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                    >
                      {item.status}
                    </td>
                    <td className="py-3 px-2">{formatINR(item.amount)}</td>
                    <td className="py-3 px-2">{formatINR(item.refund)}</td>
                    <td className="py-3 px-2">{formatINR(item.gateway_fee)}</td>
                    <td className="py-3 px-2">{formatINR(netReceived)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No transactions found 
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-semibold border-t border-gray-200">
              <td className="py-3 px-6 text-left">Total Received</td>
              <td colSpan={7}></td>
              <td className="py-3 px-6">{formatINR(getTotalReceived())}</td>
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
            className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i + 1
                ? "bg-[#5737B4] text-white"
                : "bg-gray-200"
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
