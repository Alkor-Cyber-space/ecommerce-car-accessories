import React, { useState, useRef, useEffect } from "react";
import { getAdminsList, getVendorList } from "../../services/allAPI";

const initialAdminNotifications = [
    {
        title: "Vendor #A45 uploaded a new product",
        date: "19 Sep 2025",
        time: "2:15 PM",
        message: 'The vendor added "Bosch Brake Pads  Swift" to their catalog.',
    },
    {
        title: "Order #98765 has been refunded",
        date: "19 Sep 2025",
        time: "4:00 PM",
        message: 'Refund for "Car Floor Mats  Honda City" has been processed.',
    },
    {
        title: "Vendor payout of ₹15,200 is pending approval",
        date: "18 Sep 2025",
        time: "6:45 PM",
        message: "Please review and approve the pending payout request.",
    },
    {
        isAlert: true,
        title: "System Maintenance Scheduled",
        date: "20 Sep 2025",
        time: "1:00 AM",
        message: "The admin dashboard will be unavailable from 1:003:00 AM IST.",
    },
    {
        title: "New dispute raised on Order #98600",
        date: "18 Sep 2025",
        time: "11:30 AM",
        message: "Customer has raised a dispute regarding damaged packaging.",
    },
];

const MultiSelectDropdown = ({
    label,
    options,
    selectedOptions,
    setSelectedOptions,
    lockedField,
    setLockedField,
    fieldName,
}) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setOpen(!open);

    const handleOptionChange = (option) => {
        if (!lockedField) setLockedField(fieldName);

        setSelectedOptions((prev) =>
            prev.some((o) => o.id === option.id)
                ? prev.filter((o) => o.id !== option.id)
                : [...prev, option]
        );
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                disabled={!!lockedField && lockedField !== fieldName}
                className="w-full border border-gray-300 rounded px-3 py-2 flex justify-between items-center bg-white"
            >
                <span>
                    {selectedOptions.length > 0
                        ? `${selectedOptions.length} selected`
                        : `Select ${label}`}
                </span>
                <span className="ml-2">▼</span>
            </button>

            {open && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
                    <div className="max-h-40 overflow-y-auto p-2">
                        {options.map((option) => (
                            <label key={option.id} className="flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={selectedOptions.some((o) => o.id === option.id)}
                                    onChange={() => handleOptionChange(option)}
                                />
                                {option.username}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NotificationAdmin = () => {
    const [notifications, setNotifications] = useState(initialAdminNotifications);

    // modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetGroup, setTargetGroup] = useState("");
    const [checkboxOption1, setCheckboxOption1] = useState([]);
    const [checkboxOption2, setCheckboxOption2] = useState([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [lockedField, setLockedField] = useState(null);

    const [vendorOptions, setVendorOptions] = useState([]);
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

    const [adminOptions, setAdminOptions] = useState([]);
    useEffect(() => {
        const fetchAdminStaff = async () => {
            try {
                const adminstaff = await getAdminsList();
                setAdminOptions(adminstaff);
            } catch (error) {
                console.error("Failed to load adminstaff:", error);
            }
        };
        fetchAdminStaff();
    }, []);

    const handleCreateNotification = () => {
        const now = new Date();
        const newItem = {
            title: title || "Untitled Notification",
            message: message || "",
            date: now.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAlert: false,
            group:
                targetGroup ||
                checkboxOption1.map((v) => v.username).join(", ") ||
                checkboxOption2.map((a) => a.username).join(", ") ||
                "All",
        };

        setNotifications((prev) => [newItem, ...prev]);

        // reset modal fields
        setTargetGroup("");
        setCheckboxOption1([]);
        setCheckboxOption2([]);
        setTitle("");
        setMessage("");
        setLockedField(null);
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-10 rounded-2xl">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Admin Notifications</h2>
                    <div className="flex items-center justify-between gap-4">
                        <select className="border border-gray-300 rounded px-3 py-2 bg-white">
                            <option>All</option>
                            <option>Unread</option>
                            <option>Read</option>
                        </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#5737B4] p-2 rounded border border-gray-300 text-[#5737B4] hover:bg-[#4228a4] transition"
                        aria-label="Create notification"
                    >
                        <b className="text-white">Add+</b>
                    </button>
                    </div>
                </div>

                {/* Notifications list */}
                <div className="space-y-4">
                    {notifications.map((item, idx) => (
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
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                            </div>
                            <button className="bg-[#5737B4] text-white text-[12px] px-4 py-[6px] rounded hover:bg-[#4228a4] transition whitespace-nowrap">
                                Mark as Read
                            </button>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 text-left space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xl font-semibold text-gray-800">Create Notification</h4>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setTargetGroup("");
                                        setCheckboxOption1([]);
                                        setCheckboxOption2([]);
                                        setTitle("");
                                        setMessage("");
                                        setLockedField(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                    aria-label="Close modal"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Radio buttons */}
                            <div className="flex flex-row justify-around items-center gap-4">
                                {["users", "vendors", "admin staff"].map((group) => (
                                    <label key={group} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="targetGroup"
                                            value={group}
                                            checked={targetGroup === group}
                                            onChange={(e) => {
                                                if (!lockedField) setLockedField("radio");
                                                setTargetGroup(e.target.value);
                                            }}
                                            disabled={!!lockedField && lockedField !== "radio"}
                                            className="w-4 h-4 text-[#5737B4] border-gray-300 focus:ring-[#5737B4]"
                                        />
                                        <span className="text-gray-700">{group.charAt(0).toUpperCase() + group.slice(1)}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Multi-select dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <MultiSelectDropdown
                                    label="Vendors"
                                    options={vendorOptions}
                                    selectedOptions={checkboxOption1}
                                    setSelectedOptions={setCheckboxOption1}
                                    lockedField={lockedField}
                                    setLockedField={setLockedField}
                                    fieldName="checkbox1"
                                />

                                <MultiSelectDropdown
                                    label="Admin Staff"
                                    options={adminOptions}
                                    selectedOptions={checkboxOption2}
                                    setSelectedOptions={setCheckboxOption2}
                                    lockedField={lockedField}
                                    setLockedField={setLockedField}
                                    fieldName="checkbox2"
                                />
                            </div>

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
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setTargetGroup("");
                                        setCheckboxOption1([]);
                                        setCheckboxOption2([]);
                                        setTitle("");
                                        setMessage("");
                                        setLockedField(null);
                                    }}
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
