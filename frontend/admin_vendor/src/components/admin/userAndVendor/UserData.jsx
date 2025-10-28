import { useEffect, useState } from "react";
import { BsDownload } from "react-icons/bs";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";
import SearchFilter from "../../../pages/admin/SearchFilter";
import { getUserList, exportReportApi } from "../../../services/allAPI";

export default function UserDataTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    year: "",
    location: "",
    status: "",
    regDateFrom: "",
    regDateTo: "",
  });

  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Fetch user list
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const data = await getUserList();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };
    fetchUserList();
  }, []);

  // Filter users whenever `filters` or `users` change
  useEffect(() => {
    const filtered = users.filter((user) => {
      const userDate = user.date_joined ? new Date(user.date_joined) : null;

      const matchesYear =
        !filters.year || (userDate && userDate.getFullYear().toString() === filters.year);

      const matchesLocation =
        !filters.location ||
        (user.location ? user.location.toLowerCase().includes(filters.location.toLowerCase()) : true);

      const matchesStatus =
        !filters.status ||
        (filters.status.toLowerCase() === "active"
          ? user.is_active === true
          : user.is_active === false);

      const matchesRegDateFrom =
        !filters.regDateFrom || (userDate && userDate >= new Date(filters.regDateFrom));

      const matchesRegDateTo =
        !filters.regDateTo || (userDate && userDate <= new Date(filters.regDateTo));

      return matchesYear && matchesLocation && matchesStatus && matchesRegDateFrom && matchesRegDateTo;
    });

    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleReset = () => {
    setFilters({
      year: "",
      location: "",
      status: "",
      regDateFrom: "",
      regDateTo: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Inactive":
        return "bg-gray-100 text-gray-600";
      case "Suspended":
        return "bg-red-100 text-red-600";
      case "Pending Verification":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleDownloadReport = async (format) => {
    try {
      const tableData = filteredUsers.map((user) => ({
        id: user.id,
        username: user.username || "N/A",
        email: user.email || "N/A",
        phone_number: user.phone_number || "N/A",
        location: user.location || "N/A",
        status: user.is_active ? "Active" : "Inactive",
        date_joined: user.date_joined || "N/A",
        totalOrders: user.totalOrders || 0,
      }));

      const response = await exportReportApi("users_overview", format, tableData);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users_overview.${format === "pdf" ? "pdf" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowDownloadOptions(false);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const toggleDownloadOptions = () => setShowDownloadOptions(!showDownloadOptions);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".download-dropdown")) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center relative">
        <h1 className="text-[#232832] text-xl font-bold">Users Overview</h1>

        <div className="relative download-dropdown">
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

      {/* Summary */}
      <div className="bg-white rounded-xl w-full md:w-[28%] flex flex-col md:flex-row items-center justify-between px-4 py-4">
        <p className="text-base md:text-lg text-gray-700">Total User :</p>
        <h1 className="text-3xl font-semibold text-black mr-5 md:mr-2">
          {users?.length}
        </h1>
      </div>

      {/* Filters */}
      <SearchFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={() => {}} 
        onReset={handleReset}
        showYear={true}
        showLocation={false}
        showStatus={true}
        showBuyerName={false}
        showOrderId={false}
        showOrderStatus={false}
      />

      {/* Table */}
      <div className="overflow-x-auto scrollbar-none">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 text-left px-4 font-medium">User ID</th>
              <th className="py-4 text-left px-4 font-medium">Full Name</th>
              <th className="py-4 text-left px-4 font-medium">Email</th>
              <th className="py-4 text-left px-4 font-medium">Phone</th>
              <th className="py-4 text-left px-4 font-medium">Registration Date</th>
              <th className="py-4 text-left px-4 font-medium">Status</th>
              <th className="py-4 text-left px-4 font-medium">Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="text-left hover:bg-gray-50 border-b border-gray-100"
                >
                  <td className="py-3 px-4 font-medium text-[#5737B4]">
                    <Link to={`/admin/user-details/${user.id}`}>{user.id}</Link>
                  </td>
                  <td className="py-3 px-4">{user?.username || "N/A"}</td>
                  <td className="py-3 px-4">{user?.email || "N/A"}</td>
                  <td className="py-3 px-4">{user?.phone_number || "N/A"}</td>
                  <td className="py-3 px-4">
                    {user?.date_joined
                      ? new Date(user.date_joined).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        user?.is_active ? "Active" : "Inactive"
                      )}`}
                    >
                      {user?.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{user?.orders || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
