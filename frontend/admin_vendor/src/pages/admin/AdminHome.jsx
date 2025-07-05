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
  FaTimes
} from 'react-icons/fa';
import { HiArrowTrendingUp } from "react-icons/hi2";
import { GrNotification, GrUserSettings } from "react-icons/gr";

import AdminDashboard from './AdminDashboard';
import { RiHomeFill } from 'react-icons/ri';
import { PiCalculatorDuotone, PiCurrencyDollarSimpleBold, PiPuzzlePieceFill, PiQuestion } from 'react-icons/pi';
import { AiOutlineAppstore, AiOutlineStock } from 'react-icons/ai';
import { MdOutlineInventory } from 'react-icons/md';
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
import AdminOverview from '../../components/userAndVendor/Adminsdata';
import { BsGraphUpArrow } from 'react-icons/bs';

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [openDropdown, setOpenDropdown] = useState('');
  const [showSidebar, setShowSidebar] = useState(true); // NEW

  const handleClick = (component) => {
    setActiveTab(component);
  };

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? '' : menuName);
  };

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
        {/* <h1 className='text-4xl font-semibold px-4 py-7'>carooa</h1> */}
        <ul className="space-y-4 py-10 text-md">


          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === 'Dashboard' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Dashboard')}>
            <AiOutlineAppstore />Dashboard
          </li>
          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === 'Sales Analytics' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Sales Analytics')}>
            <BsGraphUpArrow />Sales Analytics
          </li>
          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === 'Revenue Trends' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Revenue Trends')}>
            <HiArrowTrendingUp />Revenue Trends
          </li>

          <li>
            <div className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex justify-between items-center" onClick={() => toggleDropdown('Inventory Control')}>
              <span className="flex items-center gap-2">
                <FaStar />Inventory Control
              </span>
              {openDropdown === 'Inventory Control' ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === 'Inventory Control' && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl ${activeTab === 'Inventory' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Inventory')}>
                  <span className='flex gap-2 items-center'><MdOutlineInventory />Inventory Overview</span>
                </li>
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl ${activeTab === 'Stock Management' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Stock Management')}>
                  <span className='flex gap-2 items-center'><AiOutlineStock />Stock Management</span>
                </li>
              </ul>
            )}
          </li>

          <li>
            <div className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex justify-between items-center" onClick={() => toggleDropdown('User & Vendor')}>
              <span className="flex items-center gap-2"><FaUsers /> User & Vendor</span>
              {openDropdown === 'User & Vendor' ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === 'User & Vendor' && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl ${activeTab === 'User Overview' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('User Overview')}>
                  <span className='flex gap-2 items-center'><FaUser />User Overview</span>
                </li>
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl   ${activeTab === 'Vendor Overview' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Vendor Overview')}>
                  <span className='flex gap-2 items-center'><FaUserTie />Vendor Overview</span>
                </li>
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl   ${activeTab === 'Admin Overview' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white ' : ''}`} onClick={() => handleClick('Admin Overview')}>
                  <span className='flex gap-2 items-center'><FaUserTie />Admins</span>
                </li>
              </ul>
            )}
          </li>

          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === 'Financial Dashboard' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Financial Dashboard')}>
            <PiCurrencyDollarSimpleBold /> Financial Dashboard
          </li>

          <li>
            <div className="cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl flex justify-between items-center" onClick={() => toggleDropdown('Reports')}>
              <span className="flex items-center gap-2"><HiOutlineDocumentReport />
 Reports</span>
              {openDropdown === 'Reports' ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === 'Reports' && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl ${activeTab === 'Sales Report' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Sales Report')}>
                  Sales Report
                </li>
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl ${activeTab === 'Returns Report' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Returns Report')}>
                  Returns Report
                </li>
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl ${activeTab === 'Transaction Report' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Transaction Report')}>
                  Transaction Report
                </li>
                <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl ${activeTab === 'Tax Report' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Tax Report')}>
                  Tax Report
                </li>
              </ul>
            )}
          </li>

          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 ${activeTab === 'Audit Logs' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Audit Logs')}>
            {/* <PiPuzzlePieceFill />   */}
            <PiCalculatorDuotone />Audit Logs
          </li>

          {/* <hr className="my-4 border-gray-500" /> */}
          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl  flex items-center gap-2 ${activeTab === 'Notifications' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Notifications')}>
            <GrNotification />
 Notifications
          </li>


          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl  flex items-center gap-2 ${activeTab === 'Account Settings' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Account Settings')}>
            <GrUserSettings />
 Account Settings
          </li>
          <li className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2  rounded-3xl  flex items-center gap-2 ${activeTab === 'Support' ? 'bg-[#5737B4] rounded-3xl px-4 shadow-xl text-white' : ''}`} onClick={() => handleClick('Support')}>
            <PiQuestion /> Support/Help
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
          <div className="flex w-60 items-center gap-3">
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
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminHome;
