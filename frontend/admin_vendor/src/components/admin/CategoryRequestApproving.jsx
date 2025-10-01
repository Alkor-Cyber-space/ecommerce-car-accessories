import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCategoriesApi, approveOrRejectCategoryApi } from "../../services/allAPI";

const CategoryRequestApproving = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getCategoriesApi();
        const pendingRequests = data.filter((cat) => cat.available === false);
        setRequests(pendingRequests);
      } catch (error) {
        console.error("Error fetching category requests:", error);
        toast.error("Failed to load category requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // 🔹 Approve category
  const handleApprove = async (id) => {
    try {
      await approveOrRejectCategoryApi(id, "approved");
      toast.success("Category approved successfully");
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Error approving category:", error);
      toast.error("Failed to approve category");
    }
  };

  // 🔹 Reject button click
  const handleRejectClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  // 🔹 Confirm reject
  const confirmReject = async () => {
    try {
      await approveOrRejectCategoryApi(selectedId, "rejected");
      toast.success("Category rejected successfully");
      setRequests((prev) => prev.filter((req) => req.id !== selectedId));
    } catch (error) {
      console.error("Error rejecting category:", error);
      toast.error("Failed to reject category");
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  // 🔹 Cancel modal
  const cancelReject = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Category Requests</h2>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full min-w-[350px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((req, index) => (
                <tr
                  key={req.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2">{req.name}</td>


                  <td className="px-4 py-2">
                    <DescriptionWithToggle description={req.discription} />
                  </td>

                  <td className="px-4 py-2">
                    <img
                      src={req.image}
                      alt={req.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>

                  <td className="px-4 py-5 flex justify-center">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="bg-[#5727B4] hover:bg-[#4a1f99] text-white px-3 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(req.id)}
                      className="bg-[red]/80 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-600 py-4 border-b"
                >
                  No pending requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-3">
              Are you sure you want to reject this category?
            </h3>
            <p className="text-gray-600 mb-5">This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmReject}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes, Reject
              </button>
              <button
                onClick={cancelReject}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DescriptionWithToggle = ({ description }) => {
  const [showFull, setShowFull] = useState(false);
  const words = description.split(" ");
  const shortText = words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");

  return (
    <div>
      <span>{showFull ? description : shortText}</span>
      {words.length > 6 && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-blue-500 font-medium ml-2 hover:underline"
        >
          {showFull ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export default CategoryRequestApproving;
