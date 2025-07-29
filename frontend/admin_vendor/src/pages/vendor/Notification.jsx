import React, { useState } from "react";
import audi from "../../assets/Audi.jpg";
import { FiAlertTriangle } from "react-icons/fi";

const notifications = [
  {
    title: "Order #12456 has been shipped",
    date: "20 May 2025",
    time: "3.30 PM",
    message: 'Your product "Bosch Brake Pads - Swift" is on its way to the customer.',
  },
  {
    title: "Order #12460 has been delivered",
    date: "20 May 2025",
    time: "3.30 PM",
    message: 'Your product "Bosch Brake Pads - Swift" is on its way to the customer.',
  },
  {
    title: "Return Request for Order #12430",
    date: "20 May 2025",
    time: "3.30 PM",
    message:
      'Customer requested a return for "Car Floor Mats – Honda City - Reason - Product doesn’t fit properly".',
  },
  {
    title: "₹5,280 has been credited to your account",
    date: "20 May 2025",
    time: "3.30 PM",
    message: "Payout for orders delivered between July 1–15.",
  },
  {
    title: 'New review on "NGK Spark Plug – Alto"',
    date: "20 May 2025",
    time: "3.30 PM",
    message: "Quick delivery, working great so far. Worth the price!",
  },
  {
    isAlert: true,
    title: "Scheduled Maintenance Alert",
    date: "20 May 2025",
    time: "3.30 PM",
    message: "The dashboard will be unavailable on July 20 from 1:00 AM to 3:00 AM IST.",
  },
];

const Notification = () => {
  const [selectedType, setSelectedType] = useState("All");

  const getButtonLabel = (title = "", isAlert = false) => {
    const lower = title.toLowerCase();
    if (isAlert || lower.includes("maintenance") || lower.includes("update"))
      return "Remind me later";
    if (lower.includes("shipped") || lower.includes("delivered"))
      return "Track Order";
    if (lower.includes("request")) return "View Request";
    if (lower.includes("credited") || lower.includes("debited") || lower.includes("payment"))
      return "View Payment Summary";
    if (lower.includes("review")) return "View Review";
    return null;
  };

  const getCategoryFromTitle = (title = "", isAlert = false) => {
    const lower = title.toLowerCase();
    if (isAlert || lower.includes("maintenance") || lower.includes("update"))
      return "System Alerts";
    if (lower.includes("shipped") || lower.includes("delivered"))
      return "Order Updates";
    if (lower.includes("request")) return "Return Approvals";
    if (lower.includes("credited") || lower.includes("debited") || lower.includes("payment"))
      return "Payment Released";
    if (lower.includes("review")) return "New Review Received";
    return "Others";
  };

  const dropdownOptions = [
    "All",
    "Order Updates",
    "Return Approvals",
    "Payment Released",
    "New Review Received",
    "System Alerts",
  ];

  const filteredNotifications =
    selectedType === "All"
      ? notifications
      : notifications.filter((item) => getCategoryFromTitle(item.title, item.isAlert) === selectedType);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 rounded-2xl">
      <div className="max-w-6xl">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
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
        </div>

        <div className="space-y-4">
          {filteredNotifications.map((item, idx) => {
            const buttonLabel = getButtonLabel(item.title, item.isAlert);

            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
              >
                {/* Left: Icon/Image and Text */}
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
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <span className="text-gray-500"> Date: {item.date}, Time: {item.time}</span>
                  </div>
                   <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                  </div>
                </div>

                {/* Right: Action Button */}
                {buttonLabel && (
                  <button className="bg-[#5737B4] text-white text-[12px] px-4 py-[6px] rounded hover:bg-[#4228a4] transition whitespace-nowrap">
                    {buttonLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notification;
