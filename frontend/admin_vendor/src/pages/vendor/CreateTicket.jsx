import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supportTicketApi } from "../../services/allAPI"; // import API
import { toast } from "react-toastify";

const CreateTicket = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);  

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      setLoading(true);
      await supportTicketApi(formData);
      toast("Ticket created successfully!");
      navigate("/vendor/support-help"); 
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast("Failed to create ticket. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#ECECF0] min-h-screen py-6 px-4 md:px-6 rounded-2xl w-full">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <h1 className="text-[#232832] text-lg md:text-xl font-semibold">
          <span className="text-[#5737B4]">Support or Help</span> / Create a
          Ticket
        </h1>
      </div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full md:w-3/4 p-6 rounded-xl shadow-md"
      >
        {/* Row 1: Subject + Category */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Subject */}
          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4] text-[#5737B4]"
            />
          </div>

          {/* Category */}
          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4]"
            >
              <option value="" disabled hidden>
                Select a category
              </option>
              <option value="order_issue">Order Issue</option>
              <option value="product_listing">Product Listing</option>
              <option value="payments_earnings">Payment & Earnings</option>
              <option value="returns_refunds">Returns and Refunds</option>
              <option value="accounts_kyc">Account / KYC</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="app_feedback">App Feedback / Suggestions</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 2: Priority Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4]"
          >
            <option value="" disabled hidden>
              Select priority
            </option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Row 3: Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border border-[#5737B4] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B4]"
            rows="5"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Link to="/vendor/support-help">
            <button
              type="button"
              className="w-full sm:w-auto border border-[#5737B4] text-[#5737B4] px-6 py-2 rounded-md text-sm hover:bg-[#5737B4] hover:text-white transition"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#5737B4] text-white px-6 py-2 rounded-md text-sm hover:bg-[#432d9c] transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
