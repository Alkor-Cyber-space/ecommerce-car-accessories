import React, { useEffect, useState } from "react";
import user from "../../../assets/user.jpg";
import { BsStar, BsStarFill } from "react-icons/bs";
import {
  getProductReviewsApi,
  replyToReviewApi,
  updatereplyToReviewApi,
} from "../../../services/allAPI";
import { baseUrl } from "../../../services/serverURL";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [replyView, setReplyView] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState({});
  const serverurl = baseUrl;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getProductReviewsApi();
      setReviews(data.reviews);

      const replyPromises = data.reviews.map(async (review) => {
        try {
          const res = await replyToReviewApi(review.id);
          return { id: review.id, reply: res };
        } catch {
          return { id: review.id, reply: null };
        }
      });

      const allReplies = await Promise.all(replyPromises);
      const repliesObj = {};
      allReplies.forEach((r) => {
        repliesObj[r.id] = r.reply;
      });
      setReplies(repliesObj);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Render Rating Stars
  const renderStars = (rating) => {
    const totalStars = 5;
    return (
      <div className="flex gap-1">
        {[...Array(totalStars)].map((_, i) =>
          i < Math.floor(rating) ? (
            <BsStarFill key={i} className="text-yellow-500" />
          ) : (
            <BsStar key={i} className="text-gray-300" />
          )
        )}
      </div>
    );
  };

  const handleOpenModal = async (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
    try {
      const data = await replyToReviewApi(review.id);
      if (data && data.message) {
        setReplyView(data);
      } else {
        setReplyView(null);
      }
    } catch (err) {
      console.error("Error fetching reply:", err);
      setReplyView(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setReply("");
    setSelectedReview(null);
    setReplyView(null);
  };

  const handleSubmitReply = async () => {
    if (!reply.trim()) {
      alert("Please enter a reply before submitting.");
      return;
    }

    setLoading(true);
    try {
      const replyData = { message: reply };
      await updatereplyToReviewApi(selectedReview?.id, replyData);
      alert("Reply sent successfully!");

      setReplies((prev) => ({
        ...prev,
        [selectedReview.id]: {
          message: reply,
          created_at: new Date().toISOString(),
        },
      }));

      handleCloseModal();
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to send reply. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination setup
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5; 
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  return (
    <div className="mt-10">
      <p className="font-medium my-3 text-lg">Customer Reviews</p>

      <div className="space-y-4 w-full">
        {currentReviews.map((review) => {
          const replyData = replies[review.id];
          return (
            <div key={review.id} className="bg-white shadow rounded p-5">
              <div className="flex justify-between items-center">
                <div className="flex gap-8 items-center flex-wrap">
                  <img
                    src={
                      review.product?.product_image
                        ? `${serverurl}${review.product.product_image}`
                        : user
                    }
                    className="w-11 h-11 rounded-lg object-cover"
                    alt={review.product?.name}
                  />
                  <p className="font-medium lg:text-lg sm:text-sm">
                    {review.user_name}
                  </p>
                  <span className="lg:text-lg sm:text-sm font-medium text-[#5737B4]">
                    {review.product?.name}
                  </span>
                  <p className="lg:text-lg sm:text-sm text-gray-700">
                    Date: {new Date(review.created_at).toLocaleDateString()} , Time:{" "}
                    {new Date(review.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenModal(review)}
                  className="bg-[#5737B4] text-white rounded-lg px-2.5 py-2 cursor-pointer lg:text-md sm:text-sm hover:bg-[#442b91] transition"
                >
                  Reply to Review
                </button>
              </div>

              <div className="flex gap-4 py-2">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {review.rating}
                  </span>
                </div>
                <p className="font-semibold">
                  {review.comment?.length > 50
                    ? review.comment.substring(0, 50) + "..."
                    : review.comment}
                </p>
              </div>

              <p className="lg:w-3xl sm:w-lg">
                {expandedReviews[review.id]
                  ? review.comment
                  : review.comment?.substring(0, 100) +
                    (review.comment?.length > 100 ? "..." : "")}
              </p>

              {review.comment?.length > 100 && (
                <button
                  onClick={() =>
                    setExpandedReviews((prev) => ({
                      ...prev,
                      [review.id]: !prev[review.id],
                    }))
                  }
                  className="text-[#5737B4] font-thin mt-1"
                >
                  {expandedReviews[review.id] ? "View less" : "View more"}
                </button>
              )}

              {replyData?.message && (
                <div className="mt-3 bg-gray-100 rounded-md p-3 border border-gray-200">
                  <p className="text-gray-800">
                    <span className="font-semibold text-[#5737B4]">
                      Your Reply:
                    </span>{" "}
                    {replyData.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Replied on:{" "}
                    {new Date(replyData.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? "bg-[#5737B4] text-white" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Reply Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#ECECF0] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h2 className="text-lg font-semibold mb-4 text-[#5737B4]">
              Reply to {selectedReview?.user_name}'s Review
            </h2>

            {replyView?.message && replyView.message !== "No reply yet" ? (
              <div className="bg-gray-100 rounded-md p-3 border border-gray-200">
                <p className="text-gray-800">
                  <span className="font-semibold text-[#5737B4]">
                    Your Reply:
                  </span>{" "}
                  {replyView.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Replied on:{" "}
                  {new Date(replyView.created_at).toLocaleString()}
                </p>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCloseModal}
                    className="bg-[#5737B4] text-white px-3 py-2 rounded-lg hover:bg-[#442b91] transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
                  rows="4"
                  placeholder="Write your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                ></textarea>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-300 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={loading}
                    className={`${
                      loading
                        ? "bg-gray-400"
                        : "bg-[#5737B4] hover:bg-[#442b91]"
                    } text-white px-3 py-2 rounded-lg transition`}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
