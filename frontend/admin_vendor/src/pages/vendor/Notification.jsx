import React, { useState, useEffect } from "react";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
} from "../../services/allAPI";
import { FiX } from "react-icons/fi";

const Notification = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [readStatus, setReadStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotificationsApi();
        setNotifications(data);
        setReadStatus(data.map(() => false));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark as read API
  const handleMarkAsRead = async (idx, id) => {
    try {
      await markNotificationAsReadApi(id);
      setReadStatus((prev) =>
        prev.map((status, i) => (i === idx ? true : status))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Open modal
  const handleOpenModal = (notification) => {
    setSelectedNotification(notification);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const filteredNotifications = notifications.filter((_, idx) => {
    if (selectedFilter === "Unread") return !readStatus[idx];
    if (selectedFilter === "Read") return readStatus[idx];
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 rounded-2xl">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Notifications
          </h2>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option>All</option>
            <option>Unread</option>
            <option>Read</option>
          </select>
        </div>

        {/* Notification List */}
        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-gray-500">No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => handleOpenModal(item)}
                className={`bg-white p-4 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition ${
                  readStatus[idx] ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <h4 className="font-semibold text-gray-800">
                        {item.heading || "No Title"}
                      </h4>
                      <span className="text-gray-500">
                        Date:{" "}
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </span>
                      <span className="text-gray-500 ml-2">
                        Time:{" "}
                        {new Date(item.created_at).toLocaleTimeString("en-IN", {
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.message || "No message"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent modal open
                    handleMarkAsRead(idx, item.id);
                  }}
                  className={`px-4 py-[6px] rounded text-[12px] transition whitespace-nowrap ${
                    readStatus[idx]
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#5737B4] text-white hover:bg-[#4228a4]"
                  }`}
                  disabled={readStatus[idx]}
                >
                  {readStatus[idx] ? "DONE" : "Mark as Read"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 flex justify-center items-center z-60 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[500px] relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedNotification.heading || "No Title"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Date:{" "}
              {new Date(selectedNotification.created_at).toLocaleDateString(
                "en-IN",
                { dateStyle: "medium" }
              )}{" "}
              | Time:{" "}
              {new Date(selectedNotification.created_at).toLocaleTimeString(
                "en-IN",
                { timeStyle: "short" }
              )}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedNotification.message || "No message content available."}
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-[#5737B4] text-white rounded-lg hover:bg-[#4228a4]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
