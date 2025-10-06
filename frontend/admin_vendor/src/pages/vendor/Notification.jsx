import React, { useState, useEffect } from "react";
import { getNotificationsApi, markNotificationAsReadApi } from "../../services/allAPI"; 
import { FiAlertTriangle } from "react-icons/fi";

const Notification = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [readStatus, setReadStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotificationsApi();
        setNotifications(data);
        // If API already has read/unread field, use it instead of false
        setReadStatus(data.map(() => false));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // API call for mark as read
  const handleMarkAsRead = async (idx, id) => {
    try {
      await markNotificationAsReadApi(id); // call backend
      setReadStatus((prev) =>
        prev.map((status, i) => (i === idx ? true : status))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const filteredNotifications = notifications.filter((_, idx) => {
    if (selectedFilter === "Unread") return !readStatus[idx];
    if (selectedFilter === "Read") return readStatus[idx];
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 rounded-2xl">
      <div className="max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Notifications
          </h2>
          <div className="flex items-center gap-3">
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
        </div>

        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-gray-500">No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`bg-white p-4 rounded-lg shadow-sm flex items-center justify-between ${
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
                    <p className="text-sm text-gray-600 mt-1">
                      {item.message ? (
                        <div className="whitespace-pre-wrap">
                          {item.message.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i !== item.message.split("\n").length - 1 ? (
                                <br />
                              ) : null}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-gray-500">No message</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Replace the existing button with this new one */}
                <button
                  onClick={() => handleMarkAsRead(idx, item.id)}
                  className={`px-4 py-[6px] rounded text-[12px] transition whitespace-nowrap ${
                    readStatus[idx]
                      ? "bg-[#5737B4] text-white hover:bg-[#4228a4]"
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
    </div>
  );
};

export default Notification;
