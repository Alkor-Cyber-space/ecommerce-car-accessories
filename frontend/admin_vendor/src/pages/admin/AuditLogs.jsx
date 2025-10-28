import React, { useState, useEffect, useRef } from "react";
import { getAuditLogsApi, exportReportApi } from "../../services/allAPI";
import { toast } from "react-toastify";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc"); // default newest first
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const dropdownRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogsApi();
        // your API returns { data: [...] }
        const data = Array.isArray(res.data) ? res.data : [];

        // Sort by timestamp newest first by default
        const sortedData = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setLogs(sortedData);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter + sort logs (derived)
  const filteredLogs = logs
    .filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      // consider vendor (id), action, description, timestamp
      return (
        String(log.vendor).toLowerCase().includes(q) ||
        String(log.action || "").toLowerCase().includes(q) ||
        String(log.description || "").toLowerCase().includes(q) ||
        String(log.timestamp || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const isAsc = sortOrder === "asc";
      if (sortBy === "date") {
        return isAsc
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === "action") {
        return isAsc
          ? String(a.description || "").localeCompare(String(b.description || ""))
          : String(b.description || "").localeCompare(String(a.description || ""));
      } else {
        return 0;
      }
    });

  // Pagination calculations
  const totalItems = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredLogs.slice(startIndex, endIndex);

  useEffect(() => {
    // reset page if filtered results become smaller than current page
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleSort = (key) => {
    const isSameKey = sortBy === key;
    setSortOrder(isSameKey && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(key);
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Download report (PDF / Excel)
  const handleDownloadReport = async (format) => {
    try {
      const tableData = filteredLogs.map((log, index) => ({
        id: index + 1,
        timestamp: new Date(log.timestamp).toLocaleString(),
        vendor: log.vendor || "N/A",
        description: log.description || "N/A",
        action: log.action || "N/A",
      }));

      const response = await exportReportApi("audit_logs", format, tableData);

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit_logs.${format === "pdf" ? "pdf" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowDownloadOptions(false);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download report.");
    }
  };

  const toggleDownloadOptions = () =>
    setShowDownloadOptions((s) => !s);

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Logs</h1>

        {/* Download dropdown */}
        <div className="relative download-dropdown" ref={dropdownRef}>
          <button
            onClick={toggleDownloadOptions}
            className="flex items-center gap-2 bg-[#5737B4] text-white px-3 py-2 rounded-md text-sm sm:text-base"
          >
            Download Report
          </button>

          {showDownloadOptions && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-50 w-40">
              <button
                onClick={() => handleDownloadReport("pdf")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Download as PDF
              </button>
              <button
                onClick={() => handleDownloadReport("excel")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Download as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search input */}
      <div className="flex gap-4 text-left px-2 items-center">
        <input
          className="bg-white px-4 py-2 rounded w-1/2"
          placeholder="Search by vendor, action, or timestamp..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
        />
        <button
          onClick={() => {
            setSearch("");
            setCurrentPage(1);
          }}
          className="border border-[#5737B4] text-[#5737B4] hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded transition duration-300"
        >
          Clear
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <p className="text-center text-gray-500">Loading logs...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-md text-sm shadow">
            <thead>
              <tr>
                <th className="py-3 px-2 text-center">SI.No</th>
                <th
                  className="py-4 text-left px-2 cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="py-4 text-left px-2">User</th>
                <th
                  className="py-4 text-left px-2 cursor-pointer"
                  onClick={() => handleSort("action")}
                >
                  Description {sortBy === "action" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="py-4 text-left px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((log, idx) => (
                  <tr key={log.id ?? idx} className="hover:bg-gray-50">
                    <td className="text-center py-3 px-2">{startIndex + idx + 1}</td>
                    <td className="py-4 px-2">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-4 px-2">{log.vendor}</td>
                    <td className="py-4 px-2">{log.description}</td>
                    <td className="py-4 px-2">{log.action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 px-2 text-center" colSpan="5">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-[#505050] font-medium">
          Showing {startIndex + 1} - {endIndex} of {totalItems}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="text-[#5737B4] px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="text-[#5737B4] px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
