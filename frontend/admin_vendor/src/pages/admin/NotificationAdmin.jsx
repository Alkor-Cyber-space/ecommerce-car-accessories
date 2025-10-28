import React, { useState, useRef, useEffect } from "react";
import {
  getAdminsList,
  getVendorList,
  notificationApi,
  getNotificationsApi,
} from "../../services/allAPI";

// ----------------- MultiSelectDropdown -----------------
const MultiSelectDropdown = ({
  label,
  options,
  selectedOptions,
  setSelectedOptions,
  lockedField,
  setLockedField,
  fieldName,
  disabled = false,
  setTargetGroup,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!disabled) setOpen(!open);
  };

  const handleOptionChange = (option) => {
    if (!lockedField) setLockedField(fieldName);

    const isSelected = selectedOptions.some((o) => o.id === option.id);
    const newSelected = isSelected
      ? selectedOptions.filter((o) => o.id !== option.id)
      : [...selectedOptions, option];

    setSelectedOptions(newSelected);

    //  Auto-assign group based on which dropdown was used
    if (newSelected.length > 0) {
      if (label.toLowerCase() === "vendors") {
        setTargetGroup("vendors");
      } else if (label.toLowerCase() === "admin staff") {
        setTargetGroup("admin staff");
      }
    }

    if (newSelected.length === 0) {
      setLockedField(null);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full border rounded px-3 py-2 flex justify-between items-center ${disabled
          ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
          : "bg-white border-gray-300 text-gray-800"
          }`}
      >
        <span>
          {selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : `Select ${label}`}
        </span>
        <span className="ml-2">▼</span>
      </button>

      {open && !disabled && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
          <div className="max-h-40 overflow-y-auto p-2">
            {options.map((option) => {
              const isChecked = selectedOptions.some((o) => o.id === option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center mb-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isChecked}
                    onChange={() => handleOptionChange(option)}
                  />
                  {option.username}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------- Main Component -----------------
const NotificationAdmin = () => {
  // ----------------- State -----------------
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [active, setActive] = useState("received");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState(null);
  const [checkboxOption1, setCheckboxOption1] = useState([]);
  const [checkboxOption2, setCheckboxOption2] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [lockedField, setLockedField] = useState(null);

  // Dropdown options
  const [vendorOptions, setVendorOptions] = useState([]);
  const [adminOptions, setAdminOptions] = useState([]);

  // ----------------- Fetch Vendor Options -----------------
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendors = await getVendorList();
        setVendorOptions(vendors);
      } catch (error) {
        console.error("Failed to load vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  // ----------------- Fetch Admin Options -----------------
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const admins = await getAdminsList();
        setAdminOptions(admins);
      } catch (error) {
        console.error("Failed to load admins:", error);
      }
    };
    fetchAdmins();
  }, []);

  // ----------------- Fetch Backend Notifications -----------------
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsApi();
        const formatted = data.map((n) => {
          const createdAt = new Date(n.created_at);
          return {
            title: n.heading,
            message: n.message,
            date: createdAt.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            time: createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            group: n.group, // keep original group
          };
        });

        // Show all notifications instead of only group === 2
        setSentNotifications(formatted);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // ----------------- Handle Create Notification -----------------
  const handleCreateNotification = async () => {
    let groupNumber = null;
    if (targetGroup === "users") groupNumber = 1;
    else if (targetGroup === "vendors") groupNumber = 2;
    else if (targetGroup === "admin staff") groupNumber = 3;

    const vendorIds = checkboxOption1.map((v) => v.id);

    const payload = {
      heading: title || "Untitled Notification",
      message: message || "",
      group: groupNumber,
      vendors: vendorIds.length > 0 ? vendorIds : [],
    };

    try {
      await notificationApi(payload);

      const now = new Date();
      const newItem = {
        title: payload.heading,
        message: payload.message,
        date: now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        group: targetGroup === "vendors" ? 2 : null,
      };

      // Add to sentNotifications if group is vendors
      if (newItem.group === 2) {
        setSentNotifications((prev) => [newItem, ...prev]);
      }

      // Reset modal
      setTargetGroup(null);
      setCheckboxOption1([]);
      setCheckboxOption2([]);
      setTitle("");
      setMessage("");
      setLockedField(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create notification:", error);
      alert("Error creating notification. Check console.");
    }
  };

  // ----------------- Determine Notifications to Show -----------------
  const notificationsToShow = Array.isArray(
    active === "received" ? receivedNotifications : sentNotifications
  )
    ? active === "received"
      ? receivedNotifications
      : sentNotifications
    : [];

  // ----------------- Render -----------------
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Admin Notifications
          </h2>
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded px-3 py-2 bg-white">
              <option>All</option>
              <option>Unread</option>
              <option>Read</option>
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5737B4] p-2 rounded border border-gray-300 hover:bg-[#4228a4] transition"
            >
              <b className="text-white">Add+</b>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={() => setActive("received")}
            className={`flex-1 py-3 px-6 font-semibold rounded-lg shadow transition-colors ${active === "received"
              ? "bg-[#5737B4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Received
          </button>
          <button
            onClick={() => setActive("sending")}
            className={`flex-1 py-3 px-6 font-semibold rounded-lg shadow transition-colors ${active === "sending"
              ? "bg-[#5737B4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Send
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notificationsToShow.length === 0 ? (
            <p className="text-gray-500 text-center">No notifications.</p>
          ) : (
            notificationsToShow.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <span className="text-gray-500">
                      Date: {item.date}, Time: {item.time}
                    </span>
                    {/* Group tag */}
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                      {item.group === 1 ? "Users" : item.group === 2 ? "Vendors" : "Admin"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                </div>
                <button className="bg-[#5737B4] text-white text-[12px] px-4 py-[6px] rounded hover:bg-[#4228a4] transition whitespace-nowrap">
                  Mark as Read
                </button>
              </div>

            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 text-left space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-semibold text-gray-800">
                  Create Notification
                </h4>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Group Selection */}
              <div className="flex flex-row justify-around items-center gap-4">
                {["users", "vendors", "admin staff"].map((group) => (
                  <label
                    key={group}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={group}
                      checked={targetGroup === group}
                      onChange={() =>
                        setTargetGroup(targetGroup === group ? null : group)
                      }
                      className="w-4 h-4 text-[#5737B4] border-gray-300 focus:ring-[#5737B4]"
                    />
                    <span className="text-gray-700">
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Multi-Select Dropdowns */}
              <MultiSelectDropdown
                label="Vendors"
                options={vendorOptions}
                selectedOptions={checkboxOption1}
                setSelectedOptions={setCheckboxOption1}
                lockedField={lockedField}
                setLockedField={setLockedField}
                fieldName="checkbox1"
                disabled={checkboxOption2.length > 0}
                setTargetGroup={setTargetGroup} // ✅ Add this line
              />
              <MultiSelectDropdown
                label="Admin Staff"
                options={adminOptions}
                selectedOptions={checkboxOption2}
                setSelectedOptions={setCheckboxOption2}
                lockedField={lockedField}
                setLockedField={setLockedField}
                fieldName="checkbox2"
                disabled={checkboxOption1.length > 0}
                setTargetGroup={setTargetGroup} // ✅ Add this line
              />


              {/* Title & Message */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <textarea
                  placeholder="Message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCreateNotification}
                  className="bg-[#5737B4] text-white px-6 py-2 rounded hover:bg-[#4228a4] transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationAdmin;
