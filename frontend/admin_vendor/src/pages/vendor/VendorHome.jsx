import React, { useState } from "react";
import {
  FaBoxOpen, FaListAlt, FaTruckLoading, FaChartBar,
  FaTags, FaUserCircle, FaChevronRight, FaChevronDown,
  FaSignOutAlt, FaBars, FaTimes
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import VendorDashboard from "./VendorDashboard";
import PerformanceMetrics from "../../components/vendor/perfomanceMetrics/PerformanceMetrics";
// import ProductManager from "../components/vendor/ProductManager";
// import Orders from "../components/vendor/Orders";
// import Returns from "../components/vendor/Returns";
// import Promotions from "../components/vendor/Promotions";
// import Settlements from "../components/vendor/Settlements";
// import Performance from "../components/vendor/Performance";
// import VendorProfile from "../components/vendor/VendorProfile";

const VendorHome = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [openDropdown, setOpenDropdown] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? "" : name);
  };

  const handleClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/vendor");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard": return <VendorDashboard />;
      case "Product Manager": return <ProductManager />;
      case "Orders": return <Orders />;
      case "Returns": return <Returns />;
      case "Promotions": return <Promotions />;
      case "Settlements": return <Settlements />;
      case "Performance": return <PerformanceMetrics />;
      case "Profile": return <VendorProfile />;
      default: return <div>Select an option</div>;
    }
  };

  return (
    <div className="flex h-screen gap-5  px-2">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-2 left-4 z-50 text-xl p-2 bg-white rounded shadow hover:bg-gray-100"
      >
        {showSidebar ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-slate-800 text-white p-6 overflow-y-auto z-40 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h2 className="text-2xl font-semibold px-4 py-10">Vendor Panel</h2>
        <ul className="space-y-4 text-sm">

          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Dashboard" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Dashboard")}
          >
            <MdOutlineDashboard /> Dashboard
          </li>

          {/* Product Management */}
          <li>
            <div
              className="cursor-pointer hover:bg-slate-700 p-2 rounded flex justify-between items-center"
              onClick={() => toggleDropdown("Products")}
            >
              <span className="flex items-center gap-2"><FaBoxOpen /> Products</span>
              {openDropdown === "Products" ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === "Products" && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li
                  className={`cursor-pointer hover:bg-slate-600 p-1 rounded ${activeTab === "Product Manager" ? "bg-white text-slate-800 font-semibold" : ""}`}
                  onClick={() => handleClick("Product Manager")}
                >
                  Manage Products
                </li>
              </ul>
            )}
          </li>

          {/* Orders & Returns */}
          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Orders" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Orders")}
          >
            <FaListAlt /> Orders
          </li>
          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Returns" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Returns")}
          >
            <FaTruckLoading /> Returns & Refunds
          </li>

          {/* Promotions */}
          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Promotions" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Promotions")}
          >
            <FaTags /> Promotions
          </li>

          {/* Settlements */}
          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Settlements" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Settlements")}
          >
            💰 Settlements
          </li>

          {/* Performance */}
          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Performance" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Performance")}
          >
            <FaChartBar /> Performance Metrics
          </li>

          {/* Profile */}
          <li
            className={`cursor-pointer hover:bg-slate-700 p-2 rounded flex items-center gap-2 ${activeTab === "Profile" ? "bg-white text-slate-800 font-semibold" : ""}`}
            onClick={() => handleClick("Profile")}
          >
            <FaUserCircle /> Vendor Profile
          </li>

          <hr className="my-4 border-gray-600" />

          {/* Logout */}
          <li
            className="cursor-pointer hover:bg-red-600 p-2 rounded flex items-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-6 bg-gray-100 transition-all duration-300 ${showSidebar ? "pl-72" : "pl-4"}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default VendorHome;
