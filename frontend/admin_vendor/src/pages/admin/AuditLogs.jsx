import React, { useState, useEffect } from "react";
import { getAuditLogsApi } from "../../services/allAPI";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogsApi();
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter + sort logs
  const filteredLogs = logs
    .filter((log) =>
      [
        String(log.vendor),
        log.action,
        log.description,
        log.timestamp,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const isAsc = sortOrder === "asc";
      if (sortBy === "date") {
        return isAsc
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === "action") {
        return isAsc
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      } else {
        return 0;
      }
    });

  // Pagination calculations
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentItems = filteredLogs.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Sorting function
  const handleSort = (key) => {
    const isSameKey = sortBy === key;
    setSortOrder(isSameKey && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(key);
  };

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Search input */}
      <div className="flex gap-4 text-left px-2 items-center">
        <input
          className=" bg-white px-4 py-2 rounded w-1/2"
          placeholder="Search by user, action, or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSearch("")}
          className="border border-[#5737B4] text-[#5737B4] hover:bg-[#5737B4] hover:text-white active:bg-[#5737B4] active:text-white px-4 py-2 rounded transition duration-300"
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
                <th>SI.No</th>
                <th
                  className="py-4 text-left px-2  cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  Date{" "}
                  {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="py-4 text-left px-2 ">User</th>
                <th
                  className="py-4 text-left px-2  cursor-pointer"
                  onClick={() => handleSort("action")}
                >
                  Description{" "}
                  {sortBy === "action" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="py-4 text-left px-2 "> Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="text-center">{startIndex + idx + 1}</td>
                    <td className="py-4 px-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
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
        <span className="text-[#505050] font-medium ">
          Showing {endIndex} of {totalItems}
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
