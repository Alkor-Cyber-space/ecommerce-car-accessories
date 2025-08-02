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
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Search input */}
      <div className="flex gapy-4 text-left px-2 items-center">
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

      {/* Logs table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead>
            <tr >
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
                Action{" "}
                {sortBy === "action" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="py-4 text-left px-2 ">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-4 text-left px-2 ">{log.date}</td>
                  <td className="py-4 text-left px-2 ">{log.user}</td>
                  <td className="py-4 text-left px-2 ">{log.action}</td>
                  <td className="py-4 text-left px-2 ">{log.ip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 text-left px-2  text-center" colSpan="4">
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
