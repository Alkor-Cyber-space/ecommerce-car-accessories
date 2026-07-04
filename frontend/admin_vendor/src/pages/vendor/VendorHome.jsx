import React, { useState, useEffect } from "react";
import { getMeApi } from "../../services/allAPI";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaListAlt,
  FaTruckLoading,
  FaChartBar,
  FaTags,
  FaUserCircle,
  FaChevronRight,
  FaChevronDown,
  FaSignOutAlt,
  FaRegQuestionCircle,
  FaBars,
} from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import { MdNotificationsNone, MdOutlineDashboard } from "react-icons/md";
import { IoStarHalf } from "react-icons/io5";
import logo from "../../assets/logo.png";
import { TbUsersGroup } from "react-icons/tb";
import { HiArrowTrendingUp } from "react-icons/hi2";
import user from "../../assets/user.jpg";
import { RiUserSettingsLine } from "react-icons/ri";
import { PiBuildings, PiChartLine } from "react-icons/pi";

const serverUrl = "http://127.0.0.1:8000/";

const VendorHome = () => {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [profileData, setProfileData] = useState({
    profile_image: null,
    username: "",
    email: "",
  });

  // ✅ Fetch profile when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMeApi();
        if (res) {
          setProfileData({
            profile_image: res.profile_image || null,
            username: res.username || "Vendor",
            email: res.email || "vendor@example.com",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleProfileEvent = (e) => {
      const { profile_image, username } = e.detail;
      setProfileData((prev) => ({
        ...prev,
        profile_image,
        username,
      }));
    };
    window.addEventListener("vendorProfileUpdated", handleProfileEvent);
    return () =>
      window.removeEventListener("vendorProfileUpdated", handleProfileEvent);
  }, []);


  const activePath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", { replace: true });
  };

  const SidebarItem = ({ to, label, icon, activePath }) => (
    <li>
      <Link
        to={to}
        onClick={() => {
          if (window.innerWidth < 1024) setShowSidebar(false);
        }}
        className={`cursor-pointer hover:bg-[#5737B4] hover:text-white px-4 py-2 rounded-3xl flex items-center gap-2 
        ${activePath === to
            ? "bg-[#5737B4] text-white shadow-xl"
            : "text-gray-700"
          }`}
      >
        {icon} {label}
      </Link>
    </li>
  );

  return (
    <div className="flex min-h-screen gap-5 px-2">
      {/* Overlay for mobile and medium screens */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`fixed top-1 z-50 text-xl p-2 rounded transition-all duration-500 ease-in-out ${showSidebar ? "left-4" : "left-0"
          }`}
      >
        <div
          className={`flex items-center gap-2 bg-white transition-all duration-500 ease-in-out ${showSidebar ? "px-3 py-2 w-60" : "w-12 justify-center"
            }`}
        >
          <img src={logo} alt="Logo" className="h-8" />
          {showSidebar && <p className="text-2xl font-semibold">carooa</p>}
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-70 bg-white text-slate-800 p-6 overflow-y-auto scrollbar-none z-40 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <ul className="space-y-3 text-md py-10 font-medium">
          <SidebarItem
            to="/vendor/dashboard"
            label="Dashboard"
            icon={<MdOutlineDashboard />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/products"
            label="Product Management"
            icon={<PiChartLine />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/orders"
            label="Order Management"
            icon={<HiArrowTrendingUp />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/returns"
            label="Returns & Refunds"
            icon={<TbUsersGroup />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/stock-management"
            label="Inventory Management"
            icon={<GiProgression />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/payments-earnings"
            label="Payments & Earnings"
            icon={<PiBuildings />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/reviews"
            label="Ratings & Reviews"
            icon={<IoStarHalf />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/profile"
            label="Profile & KYC"
            icon={<FaUserCircle />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/notification"
            label="Notifications"
            icon={<MdNotificationsNone />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/support-help"
            label="Support/Help"
            icon={<FaRegQuestionCircle />}
            activePath={activePath}
          />
          <SidebarItem
            to="/vendor/account-settings"
            label="Account Settings"
            icon={<RiUserSettingsLine />}
            activePath={activePath}
          />

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
        className={`flex-1 min-w-0 p-6 bg-white transition-all duration-300 ${showSidebar ? "lg:pl-72 pl-14" : "pl-14"
          }`}
      >
        {/* Profile Info */}
        <div
          className="flex w-40 items-center gap-3 z-50 cursor-pointer relative ml-auto"
          onClick={() => navigate("/vendor/account-settings")}
        >
          <img
            src={
              profileData.profile_image
                ? typeof profileData.profile_image === "string" &&
                  profileData.profile_image.startsWith("http")
                  ? profileData.profile_image
                  : `${serverUrl}${profileData.profile_image}`
                : user
            }
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex flex-col font-semibold">
            <div className="text-lg text-gray-700 font-medium">
              {profileData.username}
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
