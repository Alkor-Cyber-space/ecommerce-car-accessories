import React, { useEffect, useState } from "react";
import { taxReportApi } from "../../../services/allAPI"; 


export default function TaxReport() {
  const [taxData, setTaxData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTaxReport = async () => {
      try {
        const data = await taxReportApi();
        setTaxData(data);
        setFilteredData(data);
        console.log("Tax Report Data:", data);
      } catch (error) {
        console.error("Tax report fetch error:", error);
      }
    };

    fetchTaxReport();
  }, []);

  const filterDataByDate = () => {
    const filtered = taxData.filter((item) => {
      const itemDate = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const getTotalTax = () =>
    filteredData.reduce((acc, item) => acc + Number(item.tax || 0), 0);
  const getTotalBase = () =>
    filteredData.reduce((acc, item) => acc + Number(item.base_amount || 0), 0);
  const getTotalAmount = () =>
    filteredData.reduce((acc, item) => acc + Number(item.total || 0), 0);

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

  return (
    <div className="bg-[#ECECF0] p-6 rounded-2xl w-full space-y-4">

      <div className="flex justify-between items-start flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#5737B4]">Tax Report</h1>

        <div className="flex flex-wrap items-end gap-4">
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

          <button
            className="bg-[#5737B4] hover:bg-[#2f093d] text-white font-medium 
                       px-6 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all"
          >
            Download Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-6 text-left">Date</th>
              <th className="py-4 px-6 text-left">Invoice</th>
              <th className="py-4 px-6 text-left">Product</th>
              <th className="py-4 px-6 text-left">Tax Type</th>
              <th className="py-4 px-6 text-left">Base Amount</th>
              <th className="py-4 px-6 text-left">Tax</th>
              <th className="py-4 px-6 text-left">Total</th>
              <th className="py-4 px-6 text-left">State</th>
              <th className="py-4 px-6 text-left">Buyer Type</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="text-left hover:bg-gray-50">
                  <td className="py-3 px-6 min-w-[120px]">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3 px-6">{item.invoice}</td>
                  <td className="py-3 px-6">{item.product}</td>
                  <td className="py-3 px-6">{item.tax_type}</td>
                  <td className="py-3 px-6">{formatINR(item.base_amount)}</td>
                  <td className="py-3 px-6">{formatINR(item.tax)}</td>
                  <td className="py-3 px-6">{formatINR(item.total)}</td>
                  <td className="py-3 px-6">{item.state}</td>
                  <td className="py-3 px-6">{item.buyer_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No tax data found.
                </td>
              </tr>
            )}
          </tbody>
          {filteredData.length > 0 && (
            <tfoot>
              <tr className="font-semibold border-t border-gray-200">
                <td className="py-3 px-6 text-left">Total</td>
                <td colSpan={3}></td>
                <td className="py-3 px-6">{formatINR(getTotalBase())}</td>
                <td className="py-3 px-6">{formatINR(getTotalTax())}</td>
                <td className="py-3 px-6">{formatINR(getTotalAmount())}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalPages > 1 && (
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
              className={`px-3 py-1 border border-gray-300 rounded ${
                currentPage === i + 1
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
      )}
    </div>
  );
}
