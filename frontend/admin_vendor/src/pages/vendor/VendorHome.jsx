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
import VendorProfile from "./VendorProfile";
// import ProductManager from "../components/vendor/ProductManager";
// import Orders from "../components/vendor/Orders";
// import Returns from "../components/vendor/Returns";
// import Promotions from "../components/vendor/Promotions";
// import Settlements from "../components/vendor/Settlements";
// import Performance from "../components/vendor/Performance";
// import VendorProfile from "../components/vendor/VendorProfile";

import logo from "../../assets/logo.png";
import ProductList from "../../components/vendor/products/manageProduct";
import ReturnsRefundsTable from "../../components/vendor/ReturnsRefundsTable";

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
      case "Product Manager": return <ProductList />;
      case "Orders": return <Orders />;
      case "Returns": return <ReturnsRefundsTable/>;
      case "Promotions": return <Promotions />;
      case "Settlements": return <Settlements />;
      case "Performance": return <PerformanceMetrics />;
      case "Profile": return <VendorProfile />;
      default: return <div>Select an option</div>;
    }
  };

  return (
    <div className="flex min-h-screen gap-5  px-2">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`fixed top-1 z-50 text-xl p-2 rounded transition-all duration-500 ease-in-out ${showSidebar ? 'left-4' : 'left-0'
          }`}
      >
        <div
          className={`flex items-center gap-2 bg-white transition-all duration-500 ease-in-out ${showSidebar ? 'px-3 w-48' : 'w-12 justify-center'
            }`}
        >
          <img src={logo} alt="Logo" className="h-8" />
          {showSidebar && <p className="text-2xl font-semibold transition-all duration-1000">carooa</p>}
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white text-slate-800 p-6 overflow-y-auto z-40 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* <h2 className="text-2xl font-bold text-[#5737B4] px-4 py-8">Vendor Panel</h2> */}
        <ul className="space-y-4 text-md py-10 font-medium">

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Dashboard" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Dashboard")}
          >
            <MdOutlineDashboard /> Dashboard
          </li>

          {/* Product Management */}
          <li>
            <div
              className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex justify-between items-center"
              onClick={() => toggleDropdown("Products")}
            >
              <span className="flex items-center gap-2"><FaBoxOpen /> Products</span>
              {openDropdown === "Products" ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === "Products" && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li
                  className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl ${activeTab === "Product Manager" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
                  onClick={() => handleClick("Product Manager")}
                >
                  Manage Products
                </li>
              </ul>
            )}
          </li>

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Orders" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Orders")}
          >
            <FaListAlt /> Orders
          </li>

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Returns" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Returns")}
          >
            <FaTruckLoading /> Returns & Refunds
          </li>

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Promotions" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Promotions")}
          >
            <FaTags /> Promotions
          </li>

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Settlements" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Settlements")}
          >
            💰 Settlements
          </li>

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Performance" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Performance")}
          >
            <FaChartBar /> Performance Metrics
          </li>

          <li
            className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === "Profile" ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
            onClick={() => handleClick("Profile")}
          >
            <FaUserCircle /> Vendor Profile
          </li>

          <hr className="my-4 border-gray-300" />

          <li
            className="cursor-pointer hover:bg-red-600 hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>


      {/* Main Content */}
      <div
        className={`flex-1 p-6 bg-white transition-all duration-300 ${showSidebar ? 'pl-72' : 'pl-14'}`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default VendorHome;
