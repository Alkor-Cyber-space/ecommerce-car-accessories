import React, { useState } from "react";
import audi from "../../assets/Audi.jpg"; // sample image
import { FiAlertTriangle } from "react-icons/fi";
import { ImPlus } from "react-icons/im";


// 🔔 Admin notifications data
const adminNotifications = [
    {
        title: "Vendor #A45 uploaded a new product",
        date: "19 Sep 2025",
        time: "2:15 PM",
        message: 'The vendor added "Bosch Brake Pads – Swift" to their catalog.',
    },
    {
        title: "Order #98765 has been refunded",
        date: "19 Sep 2025",
        time: "4:00 PM",
        message: 'Refund for "Car Floor Mats – Honda City" has been processed.',
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
        message: "The admin dashboard will be unavailable from 1:00–3:00 AM IST.",
    },
    {
        title: "New dispute raised on Order #98600",
        date: "18 Sep 2025",
        time: "11:30 AM",
        message: "Customer has raised a dispute regarding damaged packaging.",
    },
];

const NotificationAdmin = () => {
    const [selectedType, setSelectedType] = useState("All");
    const [isMOdalOpen, setIsModalOpen] = useState(false);


    // 🔹 Action button label based on type
    const getButtonLabel = (title = "", isAlert = false) => {
        const lower = title.toLowerCase();
        if (isAlert || lower.includes("maintenance") || lower.includes("update"))
            return "Remind me later";
        if (lower.includes("uploaded") || lower.includes("added"))
            return "Review Product";
        if (lower.includes("refunded"))
            return "View Refund Details";
        if (lower.includes("payout") || lower.includes("payment"))
            return "Review Payout";
        if (lower.includes("dispute")) return "Resolve Dispute";
        return null;
    };

    // 🔹 Categorize notification
    const getCategoryFromTitle = (title = "", isAlert = false) => {
        const lower = title.toLowerCase();
        if (isAlert || lower.includes("maintenance") || lower.includes("update"))
            return "System Alerts";
        if (lower.includes("uploaded") || lower.includes("added"))
            return "Vendor";
        if (lower.includes("refunded"))
            return "Refunds";
        if (lower.includes("payout") || lower.includes("payment"))
            return "Payout Approvals";
        if (lower.includes("dispute")) return "Disputes";
        return "Others";
    };

    const dropdownOptions = [
        "All",
        "Vendor",
        "Refunds",
        "Payout Approvals",
        "Disputes",
        "System Alerts",
    ];

    // 🔹 Filter notifications
    const filteredNotifications =
        selectedType === "All"
            ? adminNotifications
            : adminNotifications.filter(
                (item) =>
                    getCategoryFromTitle(item.title, item.isAlert) === selectedType
            );

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-10 rounded-2xl">
            <div className="max-w-6xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Admin Notifications
                    </h2>
                    <div className="flex items-center gap-3">
                        <select
                            className="bg-white border border-gray-300 rounded px-4 py-2"
                            onChange={(e) => setSelectedType(e.target.value)}
                            value={selectedType}
                        >
                            {dropdownOptions.map((type, idx) => (
                                <option key={idx} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <button className="bg-[#5737B4]/85 p-2 rounded border border-gray-300 text-white hover:bg-[#5737B4]/100 transition">
                            <div className="flex items-center justify-center gap-2"
                            onClick={() => setIsModalOpen(true)}>
                                <b>Add + </b> </div>
                        </button>
                    </div>
                </div>

                {/* Notifications list */}
                <div className="space-y-4">
                    {filteredNotifications.map((item, idx) => {
                        const buttonLabel = getButtonLabel(item.title, item.isAlert);

                        return (
                            <div
                                key={idx}
                                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
                            >
                                {/* Left section: Icon/Image + Text */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        {item.isAlert ? (
                                            <FiAlertTriangle className="w-5 h-5 text-black" />
                                        ) : (
                                            <img
                                                src={audi}
                                                alt="icon"
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <h4 className="font-semibold text-gray-800">
                                                {item.title}
                                            </h4>
                                            <span className="text-gray-500">
                                                Date: {item.date}, Time: {item.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                                    </div>
                                </div>

                                {/* Right section: Action Button */}
                                {buttonLabel && (
                                    <button className="bg-[#5737B4] text-white text-[12px] px-4 py-[6px] rounded hover:bg-[#4228a4] transition whitespace-nowrap">
                                        {buttonLabel}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                {isMOdalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
                            <h4 className="text-xl font-semibold text-gray-800">Create Notification</h4>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                                <textarea
                                    placeholder="Message"
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                                <select className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="Vendor"  selected></option>
                                    <option value="Refunds">Refunds</option>
                                    <option value="Payout Approvals">Payout Approvals</option>
                                    <option value="Disputes">Disputes</option>
                                    <option value="System Alerts">System Alerts</option>
                                </select>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-[#5737B4] text-white text-[12px] px-4 py-2 rounded hover:bg-[#4228a4] transition"
                                >
                                    Create 
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-[#5737B4]/85 text-white text-[12px] px-4 py-2 rounded hover:bg-[#4228a4]/100 transition"
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
