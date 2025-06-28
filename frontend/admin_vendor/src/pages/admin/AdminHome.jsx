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
import AdminDashboard from './AdminDashboard';
import { RiHomeFill } from 'react-icons/ri';
import { PiCurrencyDollarSimpleBold, PiPuzzlePieceFill } from 'react-icons/pi';
import { AiOutlineStock } from 'react-icons/ai';
import { MdOutlineInventory } from 'react-icons/md';
import { IoSearchOutline } from 'react-icons/io5';
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
      case 'Inventory':
        return <InventoryOverview/>;
      case 'Stock Management':
        return <StockTable/>;
      case 'Financial Dashboard':
        return <FinancialDashboard/>;
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
      case 'Audit Logs':
        return <AuditLogs/>;
      case 'Role-Based Access':
        return <div>Role-Based Admin Access Content</div>;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
<div className='flex-1 px-1 bg-white transition-all duration-300 '>

      {/* Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-1 left-4 z-50 text-xl p-2 bg-white rounded shadow hover:bg-gray-100 transition"
      >
        {showSidebar ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-300 p-6 overflow-y-auto scrollbar-none z-40 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <h1 className='text-2xl font-semibold px-4 py-7'>DASHBOARD</h1>
        <ul className="space-y-4 text-sm">
          <li className="relative mb-4">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search for..."
              className="w-full pl-10 pr-3 py-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </li>

          <li className={`cursor-pointer hover:bg-gray-400 p-2 rounded flex items-center gap-2 ${activeTab === 'Dashboard' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Dashboard')}>
            <RiHomeFill /> Dashboard
          </li>

          <li>
            <div className="cursor-pointer hover:bg-gray-400 p-2 rounded flex justify-between items-center" onClick={() => toggleDropdown('Inventory Control')}>
              <span className="flex items-center gap-2">
                <FaStar />Inventory Control
              </span>
              {openDropdown === 'Inventory Control' ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === 'Inventory Control' && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Inventory' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Inventory')}>
                  <span className='flex gap-2 items-center'><MdOutlineInventory />Inventory Overview</span>
                </li>
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Stock Management' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Stock Management')}>
                  <span className='flex gap-2 items-center'><AiOutlineStock />Stock Management</span>
                </li>
              </ul>
            )}
          </li>

          <li>
            <div className="cursor-pointer hover:bg-gray-400 p-2 rounded flex justify-between items-center" onClick={() => toggleDropdown('User & Vendor')}>
              <span className="flex items-center gap-2"><FaUsers /> User & Vendor</span>
              {openDropdown === 'User & Vendor' ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === 'User & Vendor' && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'User Overview' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('User Overview')}>
                  <span className='flex gap-2 items-center'><FaUser />User Overview</span>
                </li>
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Vendor Overview' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Vendor Overview')}>
                  <span className='flex gap-2 items-center'><FaUserTie />Vendor Overview</span>
                </li>
              </ul>
            )}
          </li>

          <li className={`cursor-pointer hover:bg-gray-400 p-2 rounded flex items-center gap-2 ${activeTab === 'Financial Dashboard' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Financial Dashboard')}>
            <PiCurrencyDollarSimpleBold /> Financial Dashboard
          </li>

          <li>
            <div className="cursor-pointer hover:bg-gray-400 p-2 rounded flex justify-between items-center" onClick={() => toggleDropdown('Reports')}>
              <span className="flex items-center gap-2"><FaClipboardList /> Reports</span>
              {openDropdown === 'Reports' ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openDropdown === 'Reports' && (
              <ul className="pl-6 mt-2 space-y-2 text-sm">
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Sales Report' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Sales Report')}>
                  Sales Report
                </li>
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Returns Report' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Returns Report')}>
                  Returns Report
                </li>
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Transaction Report' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Transaction Report')}>
                  Transaction Report
                </li>
                <li className={`cursor-pointer hover:bg-gray-200 p-1 rounded ${activeTab === 'Tax Report' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Tax Report')}>
                  Tax Report
                </li>
              </ul>
            )}
          </li>

          <li className={`cursor-pointer hover:bg-gray-400 p-2 rounded flex items-center gap-2 ${activeTab === 'Audit Logs' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Audit Logs')}>
            <PiPuzzlePieceFill /> Audit Logs
          </li>

          <hr className="my-4 border-gray-500" />

          <li className={`cursor-pointer hover:bg-gray-400 p-2 rounded flex items-center gap-2 ${activeTab === 'Settings' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Settings')}>
            <FaCog /> Settings
          </li>

          <li className={`cursor-pointer hover:bg-gray-400 p-2 rounded flex items-center gap-2 ${activeTab === 'Role-Based Access' ? 'bg-white font-semibold' : ''}`} onClick={() => handleClick('Role-Based Access')}>
            <FaUserShield /> Role-Based Admin Access
          </li>

          <li className="mt-6 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer flex items-center gap-3">
            <img src="" alt="Profile" className="w-10 h-10 rounded-full" />
            <div className="text-sm">
              <div className="font-semibold">Rohit Ravikumar</div>
              <div className="text-gray-600">Account settings</div>
            </div>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 p-6 bg-white transition-all duration-300 ${showSidebar ? 'pl-72' : 'pl-4'
          }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminHome;
