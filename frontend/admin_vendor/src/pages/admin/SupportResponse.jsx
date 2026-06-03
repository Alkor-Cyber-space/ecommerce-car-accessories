import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BsArrowLeft, BsCheck2Circle } from 'react-icons/bs';
import { AiOutlineMessage, AiOutlineEye } from 'react-icons/ai';
import { 
  markTicketResolvedApi, 
  markTicketInProgressApi, 
  updateSupportTicketApi 
} from '../../services/allAPI';
import { toast } from 'react-toastify';

const SupportResponse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [answerText, setAnswerText] = useState('');
  const [ticket, setTicket] = useState(null);
  const [isAnswerMode, setIsAnswerMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load ticket from state or fallback
  useEffect(() => {
    const ticketFromState = location.state?.ticket;
    const action = searchParams.get('action');
    const ticketId = searchParams.get('ticketId');

    if (ticketFromState) {
      setTicket(ticketFromState);
      setIsAnswerMode(action === 'answer');
    } else if (ticketId) {
      setTicket({
        id: ticketId,
        vendorName: "Unknown Vendor",
        subject: "Ticket not found",
        description: "Ticket data not available",
        status: "Unknown",
        priority: "Medium",
        category: "General",
        submittedAt: "Unknown",
        responses: []
      });
      setIsAnswerMode(action === 'answer');
    }
  }, [location.state, searchParams]);

  // Handle submitting answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;

    try {
      setLoading(true);
      const payload = { answer: answerText };
      await updateSupportTicketApi(ticket.id, payload);

      toast.success("Response submitted successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        toast.info("Please click 'Mark as Resolved' to complete the process.", {
          position: "top-right",
          autoClose: 3000,
        });
      }, 2200);

    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Error submitting response", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'In Progress':
        return 'bg-blue-100 text-blue-600';
      case 'Resolved':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Priority color helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-orange-100 text-orange-600';
      case 'Low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);

      if (newStatus === 'Resolved') {
        await markTicketResolvedApi(ticket.id);
        toast.success("Ticket marked as resolved successfully!", {
          position: "top-right",
          autoClose: 2500,
        });
      } else if (newStatus === 'In Progress') {
        await markTicketInProgressApi(ticket.id);
        toast.info("Ticket marked as In Progress!", {
          position: "top-right",
          autoClose: 2500,
        });
      } else {
        const payload = { status: newStatus };
        await updateSupportTicketApi(ticket.id, payload);
        toast.info(`Ticket status updated to ${newStatus}`, {
          position: "top-right",
          autoClose: 2500,
        });
      }

      setTimeout(() => {
        navigate('/admin/support-admin');
      }, 2600);

    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Error updating ticket status", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full">
        <div className="text-center">
          <p>Loading ticket data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/support-admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#5737B4]"
        >
          <BsArrowLeft className="text-lg" />
          Back to Support Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl p-6">
        {/* Ticket Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              {isAnswerMode ? (
                <AiOutlineMessage className="text-[#5737B4] text-xl" />
              ) : (
                <AiOutlineEye className="text-[#5737B4] text-xl" />
              )}
            </div>
            <div className="flex gap-2 mb-2">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
            </div>
            <p className="text-gray-600">Ticket ID: <span className="font-medium text-[#5737B4]">{ticket.id}</span></p>
          </div>
          
          <div className="flex gap-3">
  <button
    onClick={() => handleStatusUpdate('Resolved')}
    disabled={ticket.status === "Resolved" || loading}
    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
      ticket.status === "Resolved" || loading
        ? "bg-gray-300 cursor-not-allowed text-white"
        : "bg-green-600 hover:bg-green-700 text-white"
    }`}
  >
    <BsCheck2Circle />
    Mark Resolved
  </button>
</div>

        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Vendor Information</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{ticket.vendorName}</p>
                <p className="text-sm text-gray-600">{ticket.vendorId}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <p className="bg-gray-50 p-3 rounded-lg">{ticket.category}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Submitted Date</label>
              <p className="bg-gray-50 p-3 rounded-lg">{ticket.submittedAt}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
              <p className="bg-gray-50 p-3 rounded-lg">{ticket.lastUpdated || ticket.submittedAt}</p>
            </div>
          </div>
        </div>

        {/* Ticket Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Issue Description</label>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed">{ticket.description}</p>
          </div>
        </div>

        {/* Previous Responses */}
        {ticket.responses && ticket.responses.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-3">Previous Responses</label>
            <div className="space-y-3">
              {ticket.responses.map((response, index) => (
                <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-800">Admin Response</span>
                    <span className="text-sm text-blue-600">{response.timestamp}</span>
                  </div>
                  <p className="text-blue-900">{response.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer Section */}
        {isAnswerMode && (
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-[#5737B4] to-[#7B68EE] text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AiOutlineMessage />
                Compose Your Response
              </h3>
            </div>
            
            <div className="bg-white border border-t-0 border-gray-200 p-6 rounded-b-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response to {ticket.vendorName}
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your detailed response here. Be clear and helpful in addressing the vendor's concern..."
                  rows="8"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5737B4] focus:border-transparent resize-vertical"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {answerText.length} characters
                  </p>
                  <p className="text-sm text-gray-500">
                    Tip: Provide clear, actionable solutions
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || loading}
                  className="bg-[#5737B4] text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A2B9F] transition-colors flex items-center gap-2"
                >
                  <AiOutlineMessage />
                  Send Response
                </button>
                <button
                  onClick={() => setIsAnswerMode(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Actions */}
        {!isAnswerMode && (
          <div className="flex gap-3 pt-6 border-t">
            <button
  onClick={() => setIsAnswerMode(true)}
  disabled={isAnswerMode || (ticket.responses && ticket.responses.length > 0) || loading}
  className={`bg-[#5737B4] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
    isAnswerMode || (ticket.responses && ticket.responses.length > 0) || loading
      ? "bg-gray-300 cursor-not-allowed"
      : "hover:bg-[#4A2B9F]"
  }`}
>
  <AiOutlineMessage />
  Answer This Ticket
</button>

            <button
              onClick={() => handleStatusUpdate('In Progress')}
              disabled={ticket.status === "In Progress" || loading}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                ticket.status === "In Progress" ||"Answered" || "Resolved" || loading
                  ? "bg-gray-300 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Mark In Progress
            </button>
            <button
              onClick={() => handleStatusUpdate('Resolved')}
              disabled={ticket.status === "Resolved" || loading}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                ticket.status === "Resolved" || loading
                  ? "bg-gray-300 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Mark Resolved
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportResponse;
