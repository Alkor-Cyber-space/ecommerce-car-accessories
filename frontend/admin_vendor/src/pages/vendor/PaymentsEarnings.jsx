import React, { useEffect, useState } from 'react';
import { PaymentsPayoutApi } from '../../services/allAPI';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PaymentsEarnings = () => {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState("sales");
  const [showDropdown, setShowDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        const response = await PaymentsPayoutApi();
        setSales(Array.isArray(response.sales) ? response.sales : []);
        setPayouts(Array.isArray(response.payouts) ? response.payouts : []);
      } catch (error) {
        console.error("Error fetching payments history:", error);
        setSales([]);
        setPayouts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionHistory();
  }, []);

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium inline-flex items-center";
    switch (status) {
      case 'Confirmed':
      case 'Settled':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'Pending':
      case 'Processing':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'Completed':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  // Pagination logic
  const data = activeTab === "sales" ? sales : payouts;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = activeTab === "sales" ? "Sales Report" : "Payouts Report";
    doc.text(title, 14, 16);

    if (activeTab === "sales") {
      const tableColumn = [
        "Date", "Product", "Amount", "Vendor Amount", "Admin Commission",
        "Status", "Type", "Transaction ID", "Description"
      ];
      const tableRows = paginatedData.map(sale => ([
        sale.date || "-",
        sale.product || "-",
        `₹${sale.amount || 0}`,
        `₹${sale.vendor_amount || 0}`,
        `₹${sale.admin_commission || 0}`,
        sale.status || "-",
        sale.type || "-",
        sale.transaction_id || "-",
        sale.description || "-"
      ]));
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 25 });
    } else {
      const tableColumn = ["Payout ID", "Amount", "Status", "Date", "Description"];
      const tableRows = paginatedData.map(p => ([
        p.payout_id || "-",
        `₹${p.amount || 0}`,
        p.status || "-",
        p.date || "-",
        p.description || "-"
      ]));
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 25 });
    }

    doc.save(`report_${activeTab}.pdf`);
    setShowDropdown(false);
  };

  // Excel Download
  const downloadExcel = () => {
    const keys = Object.keys(paginatedData[0] || {});
    let csv = keys.join(",") + "\n";
    paginatedData.forEach(row => {
      csv += keys.map(k => `"${row[k] || ''}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report_${activeTab}.csv`;
    link.click();
    setShowDropdown(false);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-2xl relative">
      <div className='flex mb-2  justify-between items-center'>
        <h1 className="text-[#5737B4] text-xl md:text-2xl font-bold">Payments & Earnings</h1>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-[#5737B4] text-white px-4 py-2 rounded-full text-sm"
          >
            Download Report
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border w-40 z-20">
              <button onClick={downloadPDF} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">PDF</button>
              <button onClick={downloadExcel} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Excel</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white mb-2 w-full rounded-3xl p-1 shadow-md">
        <button
          className={`px-4 py-2 font-medium rounded-3xl w-1/2 ${activeTab === "sales" ? "bg-[#5737B4] text-white" : "bg-white text-gray-700"}`}
          onClick={() => { setActiveTab("sales"); setCurrentPage(1); }}
        >
          Sales
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-3xl w-1/2 ${activeTab === "payouts" ? "bg-[#5737B4] text-white" : "bg-white text-gray-700"}`}
          onClick={() => { setActiveTab("payouts"); setCurrentPage(1); }}
        >
          Payouts
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg max-h-[90vh] overflow-y-auto mt-5 shadow ">
        <table className="min-w-full divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {activeTab === "sales" ? (
                <>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vendor Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Admin Commission</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Payout ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, i) => (
                <tr key={i}>
                  {activeTab === "sales" ? (
                    <>
                      <td className="px-4 py-2 w-[120px]">{item.date || "-"}</td>
                      <td className="px-4 py-2">{item.product || "-"}</td>
                      <td className="px-4 py-2">₹{item.amount || 0}</td>
                      <td className="px-4 py-2">₹{item.vendor_amount || 0}</td>
                      <td className="px-4 py-2">₹{item.admin_commission || 0}</td>
                      <td className="px-4 py-2"><span className={getStatusBadge(item.status)}>{item.status || "-"}</span></td>
                      <td className="px-4 py-2">{item.type || "-"}</td>
                      <td className="px-4 py-2">{item.transaction_id || "-"}</td>
                      <td className="px-4 py-2">{item.description || "-"}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{item.payout_id || "-"}</td>
                      <td className="px-4 py-2">₹{item.amount || 0}</td>
                      <td className="px-4 py-2">{item.status || "-"}</td>
                      <td className="px-4 py-2">{item.date || "-"}</td>
                      <td className="px-4 py-2">{item.description || "-"}</td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTab === "sales" ? 9 : 5} className="px-4 py-2 text-center text-gray-500">
                  No {activeTab} found.
                </td>
              </tr>
            )}
          </tbody>
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
            className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i + 1 ? "bg-[#5737B4] text-white" : "bg-gray-200"}`}
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
};

export default PaymentsEarnings;
