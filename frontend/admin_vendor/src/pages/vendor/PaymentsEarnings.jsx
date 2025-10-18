import React, { useEffect, useState } from 'react';
import SalesTrends from '../../components/admin/adminDashboard/SalesTrends';
import TotalProfitCard from '../../components/admin/adminDashboard/TotalProfitChart';
import RefundReturnStats from '../../components/admin/adminDashboard/RefundReturnStats';
import { PaymentsPayoutApi } from '../../services/allAPI';
import jsPDF from 'jspdf';
import 'jspdf-autotable';



const PaymentsEarnings = () => {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState("sales");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        const response = await PaymentsPayoutApi();
        console.log("Payments Response:", response);

        if (response?.sales && Array.isArray(response.sales)) {
          setSales(response.sales);
        } else {
          setSales([]);
        }

        if (response?.payouts && Array.isArray(response.payouts)) {
          setPayouts(response.payouts);
        } else {
          setPayouts([]);
        }
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

  // ✅ PDF Download using jsPDF like your Product Report
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = activeTab === "sales" ? "Sales Report" : "Payouts Report";
    doc.text(title, 14, 16);

    if (activeTab === "sales") {
      const tableColumn = [
        "Date", "Product", "Amount", "Vendor Amount", "Admin Commission",
        "Status", "Type", "Transaction ID", "Description"
      ];
      const tableRows = [];

      sales.forEach(sale => {
        const row = [
          sale.date || "-",
          sale.product || "-",
          `₹${sale.amount || 0}`,
          `₹${sale.vendor_amount || 0}`,
          `₹${sale.admin_commission || 0}`,
          sale.status || "-",
          sale.type || "-",
          sale.transaction_id || "-",
          sale.description || "-"
        ];
        tableRows.push(row);
      });

      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 25 });
    } else {
      const tableColumn = ["Payout ID", "Amount", "Status", "Date", "Description"];
      const tableRows = [];

      payouts.forEach(p => {
        const row = [
          p.payout_id || "-",
          `₹${p.amount || 0}`,
          p.status || "-",
          p.date || "-",
          p.description || "-"
        ];
        tableRows.push(row);
      });

      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 25 });
    }

    doc.save(`report_${activeTab}.pdf`);
    setShowDropdown(false);
  };

  // ✅ Excel (CSV) Download
  const downloadExcel = () => {
    const data = activeTab === "sales" ? sales : payouts;
    const keys = Object.keys(data[0] || {});
    let csv = keys.join(",") + "\n";
    data.forEach(row => {
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
    <>
      <div className="bg-[#ECECF0] px-6 py-10 rounded-2xl relative">
        <div className='flex mb-5 justify-between items-center'>
          <h1 className="text-[#232832] text-2xl font-semibold">Payments & Earnings</h1>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-[#5737B4] text-white px-4 py-2 rounded-full text-sm"
            >
              Download Report
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border w-40 z-20">
                <button
                  onClick={downloadPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white mb-4 w-full rounded-3xl p-1 shadow-md">
          <button
            className={`px-4 py-2 font-medium rounded-3xl w-1/2 ${activeTab === "sales"
              ? "bg-[#5737B4] text-white"
              : "bg-white text-gray-700"
              }`}
            onClick={() => setActiveTab("sales")}
          >
            Sales
          </button>
          <button
            className={`px-4 py-2 font-medium rounded-3xl w-1/2 ${activeTab === "payouts"
              ? "bg-[#5737B4] text-white"
              : "bg-white text-gray-700"
              }`}
            onClick={() => setActiveTab("payouts")}
          >
            Payouts
          </button>
        </div>

        {/* Sales Table */}
        {activeTab === "sales" && (
          <div className="overflow-x-auto rounded-lg max-h-[90vh] overflow-y-auto mt-10">
            <table className="min-w-full divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vendor Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Admin Commission</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-gray-200">
                {sales.length > 0 ? (
                  sales.map((sale, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{sale.date || "-"}</td>
                      <td className="px-4 py-2">{sale.product || "-"}</td>
                      <td className="px-4 py-2">₹{sale.amount || 0}</td>
                      <td className="px-4 py-2">₹{sale.vendor_amount || 0}</td>
                      <td className="px-4 py-2">₹{sale.admin_commission || 0}</td>
                      <td className="px-4 py-2">
                        <span className={getStatusBadge(sale.status)}>{sale.status || "-"}</span>
                      </td>
                      <td className="px-4 py-2">{sale.type || "-"}</td>
                      <td className="px-4 py-2">{sale.transaction_id || "-"}</td>
                      <td className="px-4 py-2">{sale.description || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                      No sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payouts Table */}
        {activeTab === "payouts" && (
          <div className="overflow-x-auto rounded-lg max-h-[90vh] overflow-y-auto mt-10">
            <table className="min-w-full divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Payout ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-gray-200">
                {payouts.length > 0 ? (
                  payouts.map((p, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{p.payout_id || "N/A"}</td>
                      <td className="px-4 py-2">₹{p.amount || 0}</td>
                      <td className="px-4 py-2">{p.status || "-"}</td>
                      <td className="px-4 py-2">{p.date || "-"}</td>
                      <td className="px-4 py-2">{p.description || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                      No payouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentsEarnings;
