import React, { useState } from "react";

// Initial mock data
const initialLogs = [
  { date: "2025-06-20", user: "Admin1", action: "Deleted product", ip: "192.168.1.10" },
  { date: "2025-06-18", user: "VendorX", action: "Updated price", ip: "192.168.1.12" },
  { date: "2025-06-19", user: "Admin2", action: "Approved vendor", ip: "192.168.1.13" },
  { date: "2025-06-17", user: "VendorY", action: "Added product", ip: "192.168.1.14" },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // Filter + sort logs
  const filteredLogs = logs
    .filter((log) =>
      [log.user, log.action, log.ip].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      const isAsc = sortOrder === "asc";
      if (sortBy === "date") {
        return isAsc
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else {
        return isAsc
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      }
    });

  // Sorting function
  const handleSort = (key) => {
    const isSameKey = sortBy === key;
    setSortOrder(isSameKey && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(key);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Search input */}
      <div className="flex gap-2 items-center">
        <input
          className="border px-4 py-2 rounded w-1/2"
          placeholder="Search by user, action, or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSearch("")}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>

      {/* Logs table */}
      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="p-2 border cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="p-2 border">User</th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => handleSort("action")}
              >
                Action{" "}
                {sortBy === "action" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="p-2 border">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border">{log.date}</td>
                  <td className="p-2 border">{log.user}</td>
                  <td className="p-2 border">{log.action}</td>
                  <td className="p-2 border">{log.ip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 border text-center" colSpan="4">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
