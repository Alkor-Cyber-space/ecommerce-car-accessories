import React, { useState } from 'react';
import {
  FaTachometerAlt,
  FaBoxes,
  FaMoneyCheckAlt,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaCog,
  FaChevronRight,
  FaChevronDown,
  FaUserShield,
  FaStar,
  FaUserTie,
  FaUser,
  FaBars,
  FaTimes,
  FaTags,
  FaSignOutAlt
} from 'react-icons/fa';
import { HiArrowTrendingUp } from "react-icons/hi2";
import { GrNotification, GrUserSettings } from "react-icons/gr";

import AdminDashboard from './AdminDashboard';
import { RiHomeFill } from 'react-icons/ri';
import { PiCalculatorDuotone, PiCurrencyDollarSimpleBold, PiPuzzlePieceFill, PiQuestion } from 'react-icons/pi';
import { AiOutlineAppstore, AiOutlineStock } from 'react-icons/ai';
import { MdOutlineCategory, MdOutlineInventory } from 'react-icons/md';
import { IoSearchOutline } from 'react-icons/io5';
import { HiOutlineDocumentReport } from "react-icons/hi";

import user from '../../assets/user.jpg';
import logo from '../../assets/logo.png';
// import UserDataTable from './components/userAndVendor/UserData';
// import VendorDataTable from './components/userAndVendor/VendorData';
// import SalesReport from './components/reports/SalesReport';
// import ReturnsReport from './components/reports/ReturnsReport';
// import Transaction from './components/reports/TransactionReports';
// import TaxReport from './components/reports/TaxReport';
// import InventoryOverview from './components/inventoryControl/InventoryOverview';
// import StockTable from './components/inventoryControl/StockManagement';
import UserDataTable from '../../components/admin/userAndVendor/UserData';
import VendorDataTable from '../../components/admin/userAndVendor/VendorData';
import AdminOverview from '../../components/admin/userAndVendor/AdminsData';
import SalesReport from '../../components/admin/reports/SalesReport';
import ReturnsReport from '../../components/admin/reports/ReturnsReport';
import Transaction from '../../components/admin/reports/TransactionReports';
import TaxReport from '../../components/admin/reports/TaxReport';
import InventoryOverview from '../../components/admin/inventoryControl/InventoryOverview';
import StockTable from '../../components/admin/inventoryControl/StockManagement';

import FinancialDashboard from './FinancialDashboard';
import AuditLogs from './AuditLogs';
import SalesAnalytics from './SalesAnalytics';
import RevenueTrends from './RevenueTrends';
import { BsGraphUpArrow } from 'react-icons/bs';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [openDropdown, setOpenDropdown] = useState('');
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true); // NEW

  const handleClick = (component) => {
    setActiveTab(component);
  };

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? '' : menuName);
  };
  const location = useLocation();

  const activePath = location.pathname;

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

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <AdminDashboard />;
      case 'Sales Analytics':
        return <SalesAnalytics />;
      case 'Revenue Trends':
        return <RevenueTrends />;
      case 'Inventory':
        return <InventoryOverview />;
      case 'Stock Management':
        return <StockTable />;
      case 'Financial Dashboard':
        return <FinancialDashboard />;
      case 'Sales Report':
        return <SalesReport />;
      case 'Returns Report':
        return <ReturnsReport />;
      case 'Transaction Report':
        return <Transaction />;
      case 'Tax Report':
        return <TaxReport />;
      case 'User Overview':
        return <UserDataTable />;
      case 'Vendor Overview':
        return <VendorDataTable />;
      case 'Admin Overview':
        return <AdminOverview />
      case 'Audit Logs':
        return <AuditLogs />;
      case 'Notifications':
        return <div>Notifications Content</div>;
      case 'Account Settings':
        return <div>Account Settings Content</div>;
      case 'Support':
        return <div>Support Content</div>;

      default:
        return <div>Select a tab</div>;
    }
  };
  const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  navigate("/signin", { replace: true });
};

  return (
    <div className='flex-1 px-1 bg-white transition-all duration-500 '>

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
        className={`fixed top-0 left-0 h-full w-72  p-6 overflow-y-auto scrollbar-none z-40 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <ul className="space-y-4 text-md py-10 ">
          <SidebarItem to="/admin/dashboard" label="Dashboard" icon={<AiOutlineAppstore />} activePath={activePath} />
          <SidebarItem to="/admin/sales-analytics" label="Sales Analytics" icon={<BsGraphUpArrow />} activePath={activePath} />
          <SidebarItem to="/admin/revenue-trends" label="Revenue Trends" icon={<HiArrowTrendingUp />} activePath={activePath} />
          
          <li>
            <div
              className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex justify-between items-center"
              onClick={() => toggleDropdown("Inventory Control")}
            >
              <span className="flex items-center gap-2">
                <FaStar /> Inventory Control
              </span>
              {openDropdown === "Inventory Control" ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === "Inventory Control" && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <SidebarItem to="/admin/inventory-overview" label="Inventory Overview" activePath={activePath} />
                <SidebarItem to="/admin/inventory-stock" label="Stock Management" activePath={activePath} />
              </ul>
            )}
          </li>

          <li>
            <div
              className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex justify-between items-center"
              onClick={() => toggleDropdown("User & Vendor")}
            >
              <span className="flex items-center gap-2">
                <FaUsers /> User & Vendor
              </span>
              {openDropdown === "User & Vendor" ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === "User & Vendor" && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <SidebarItem to="/admin/users" label="User Overview" activePath={activePath} />
                <SidebarItem to="/admin/vendors" label="Vendor Overview" activePath={activePath} />
                <SidebarItem to="/admin/admins" label="Admin Overview" activePath={activePath} />
              </ul>
            )}
          </li>

          <SidebarItem to="/admin/settlements" label="Financial Dashboard" icon={<PiCurrencyDollarSimpleBold />} activePath={activePath} />

          <li>
            <div
              className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex justify-between items-center"
              onClick={() => toggleDropdown("Reports")}
            >
              <span className="flex items-center gap-2">
                <HiOutlineDocumentReport /> Reports
              </span>
              {openDropdown === "Reports" ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === "Reports" && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <SidebarItem to="/admin/Sales-Report" label="Sales Report" activePath={activePath} />
                <SidebarItem to="/admin/returns" label="Returns Report" activePath={activePath} />
                <SidebarItem to="/admin/transaction" label="Transaction Report" activePath={activePath} />
                <SidebarItem to="/admin/tax-reports" label="Tax Report" activePath={activePath} />
              </ul>
            )}
          </li>
          <SidebarItem to="/admin/promotions" label="Promotions" icon={<FaTags />} activePath={activePath} />
          <SidebarItem to="/admin/index-catogery" label="Manage Category" icon={<MdOutlineCategory />} activePath={activePath} />
          <SidebarItem to="/admin/auditlogs" label="Audit Logs" icon={<PiCalculatorDuotone />} activePath={activePath} />
          <SidebarItem to="/admin/notification-admin" label="Notifications" icon={<GrNotification />} activePath={activePath} />
          <SidebarItem to="/admin/account-settings-admin" label="Account Settings" icon={<GrUserSettings />} activePath={activePath} />

          <SidebarItem to="/admin/support-admin" label="Support/Help" icon={<PiQuestion />} activePath={activePath} />

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
        {/* 🔍 Search bar */}
        <div className="flex items-center justify-between mb-6 ">
          {/* Search Bar */}
          <div className="relative w-full max-w-3xl">
            <IoSearchOutline className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl" />
            <input
              type="text"
              placeholder="Search"
              className="w-58/50 pl-16 pr-3 py-5 rounded-[2rem] text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#5737B4] shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.2),0_4px_8px_-4px_rgba(0,0,0,0.2)]"
            />

          </div>

          {/* Profile Info */}
          <div className="flex w-60 items-center gap-3"
          onClick={() => navigate('/admin/account-settings')}
          >
            <img
              src={user}
              alt="profile"
              className="w-17 h-17 rounded-full object-cover"
            />
            <div className='flex flex-col font-semibold'>
              <div className="text-lg text-gray-700 font-medium">Rohit Ravikumar</div>
              <span>rohitgmail.com</span>
            </div>
          </div>
        </div>

        {/* Dynamic Component Render */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminHome;
