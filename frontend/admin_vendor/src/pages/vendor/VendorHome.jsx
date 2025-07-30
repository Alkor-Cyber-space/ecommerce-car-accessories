import React, { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaBoxOpen, FaListAlt, FaTruckLoading, FaChartBar,
  FaTags, FaUserCircle, FaChevronRight, FaChevronDown,
  FaSignOutAlt,
  FaRegQuestionCircle
} from "react-icons/fa";
import { MdNotificationsNone, MdOutlineDashboard } from "react-icons/md";
import { IoNotificationsOutline, IoSearchOutline, IoStarHalf, IoStarOutline } from "react-icons/io5";
import logo from "../../assets/logo.png";

import user from "../../assets/user.jpg";
import { RiUserSettingsLine } from "react-icons/ri";
import { PiBuildings } from "react-icons/pi";


const VendorHome = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/vendor/login");
  };

  const SidebarItem = ({ to, label, icon, activePath }) => (
    <li>
      <Link
        to={to}
        className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 
        ${activePath === to ? "bg-[#5737B4] text-white shadow-xl" : ""}`}
      >
        {icon} {label}
      </Link>
    </li>
  );

  return (
    <div className="flex min-h-screen gap-5 px-2">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`fixed top-1 z-50 text-xl p-2 rounded transition-all duration-500 ease-in-out ${showSidebar ? 'left-4' : 'left-0'}`}
      >
        <div className={`flex items-center gap-2 bg-white transition-all duration-500 ease-in-out ${showSidebar ? 'px-3 w-48' : 'w-12 justify-center'}`}>
          <img src={logo} alt="Logo" className="h-8" />
          {showSidebar && <p className="text-2xl font-semibold">carooa</p>}
        </div>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white text-slate-800 p-6 overflow-y-auto z-40 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <ul className="space-y-4 text-md py-10 font-medium">
          <SidebarItem to="/vendor/dashboard" label="Dashboard" icon={<MdOutlineDashboard />} activePath={activePath} />
          <SidebarItem to="/vendor/products" label="Product Management" icon={<FaBoxOpen />} activePath={activePath} />
          <SidebarItem to="/vendor/orders" label="Order Management" icon={<FaListAlt />} activePath={activePath} />
          <SidebarItem to="/vendor/returns" label="Returns & Refunds" icon={<FaTruckLoading />} activePath={activePath} />
          <SidebarItem to="/vendor/payments-earnings" label="Payments & Earnings" icon={<PiBuildings />} activePath={activePath} />
          <SidebarItem to="/vendor/reviews" label="Ratings & Reviews" icon={<IoStarHalf />} activePath={activePath} />
          <SidebarItem to="/vendor/promotions" label="Promotions" icon={<FaTags />} activePath={activePath} />
          <SidebarItem to="/vendor/settlements" label="Settlements" icon="💰" activePath={activePath} />
          <SidebarItem to="/vendor/performance" label="Performance Metrics" icon={<FaChartBar />} activePath={activePath} />
          <SidebarItem to="/vendor/profile" label="Profile & KYC" icon={<FaUserCircle />} activePath={activePath} />
          <SidebarItem to="/vendor/notification" label="Notifications" icon={<MdNotificationsNone />} activePath={activePath} />
          <SidebarItem to="/vendor/support-help" label="Support/Help" icon={<FaRegQuestionCircle />} activePath={activePath} />
          <SidebarItem to="/vendor/account-settings" label="Account Settings" icon={<RiUserSettingsLine />} activePath={activePath} />

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
      <div className={`flex-1 p-6 bg-white transition-all duration-300 ${showSidebar ? 'pl-72' : 'pl-14'}`}>
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-3xl">
            <IoSearchOutline className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl" />
            <input
              type="text"
              placeholder="Search"
              className="w-58/50 pl-16 pr-3 py-5 rounded-[2rem] text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#5737B4] shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.2),0_4px_8px_-4px_rgba(0,0,0,0.2)]"
            />
          </div>
          <div className="flex w-60 items-center gap-3">
            <img src={user} alt="profile" className="w-17 h-17 rounded-full object-cover" />
            <div className='flex flex-col font-semibold'>
              <div className="text-lg text-gray-700 font-medium">Rohit Ravikumar</div>
              <span>rohitgmail.com</span>
            </div>
          </div>
        </div>

        {/* Render Child Routes */}
        <Outlet />
      </div>
    </div>
  );
};


export default VendorHome;
