import React, { useState, useEffect, useRef } from "react";
import bmw from "../../../assets/bmw.jpg";
import { PiCreditCardBold } from "react-icons/pi";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import {
  getOrdersApi,
  ConfirmOrderStatusApi,
  exportReportApi,
  CancelOrderApi,
} from "../../../services/allAPI";
import { toast } from "react-toastify";
import SearchFilter from "../../admin/SearchFilter";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../services/serverURL";

const OrderManagement = ({ order }) => {
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const serverurl = "http://127.0.0.1:8000/";
  const navigate = useNavigate();

  const [filteredOrders, setFilteredOrders] = useState([]);

  const [filters, setFilters] = useState({
    regDateFrom: "",
    regDateTo: "",
    orderId: "",
    buyerName: "",
    orderStatus: "",
  });
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  const fetchOrders = async () => {
    try {
      const response = await getOrdersApi();
      const sorted = response ? [...response].sort((a, b) => b.id - a.id) : [];
      setUserOrders(sorted);
      setFilteredOrders(sorted);
      console.log(sorted);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmOrder = async (order) => {
    setLoading(true);
    try {
      const response = await ConfirmOrderStatusApi(order.id);
      console.log(response);

      if (response && response.message) {
        if (response.message.includes("failed")) {
          toast.warning(response.message);
        } else {
          toast.success(response.message);
        }
      } else {
        toast.success("Order status confirmed successfully");
      }

      if (fetchOrders) fetchOrders();
    } catch (error) {
      toast.error("Failed to confirm order status");
      console.error("Error confirming order status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    setLoading(true);
    try {
      const response = await CancelOrderApi(order.id);
      console.log(response);
      if (fetchOrders) fetchOrders();
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error canceling order", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  useEffect(() => {
    const filtered = userOrders.filter((order) => {
      const orderDate = order.created_at ? new Date(order.created_at) : null;

      const matchesStatus = !filters.orderStatus
        ? true
        : order.status?.toLowerCase() === filters.orderStatus.toLowerCase();

      const matchesDateFrom = !filters.regDateFrom
        ? true
        : orderDate && orderDate >= new Date(filters.regDateFrom);

      const matchesDateTo = !filters.regDateTo
        ? true
        : orderDate && orderDate <= new Date(filters.regDateTo);

      const matchesOrderId = !filters.orderId
        ? true
        : order.id.toString().includes(filters.orderId);

      const matchesBuyerName = !filters.buyerName
        ? true
        : order.buyerName
          ?.toLowerCase()
          .includes(filters.buyerName.toLowerCase());

      return (
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesOrderId &&
        matchesBuyerName
      );
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [filters, userOrders]);

  const handleReset = () => {
    setFilters({
      regDateFrom: "",
      regDateTo: "",
      orderId: "",
      buyerName: "",
      orderStatus: "",
    });
    setFilteredOrders(userOrders);
    setCurrentPage(1);
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Download report 
  const handleDownloadReport = async (format) => {
    try {
      const tableData = filteredOrders.map((order) => ({
        id: order.id,
        user: order.user?.username || order.buyerName || "N/A",
        email: order.user?.email || "N/A",
        total_amount: order.total_price || 0,
        payment_method: order.payment_method || "N/A",
        order_status: order.status || "Pending",
        date: order.created_at ? order.created_at.split("T")[0] : "N/A",
      }));

      const response = await exportReportApi(
        "orders_overview",
        format,
        tableData
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `orders_overview.${format === "pdf" ? "pdf" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download report.");
    }
  };

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-[#5737B4]">
          Order Management
        </h2>

        {/* Download dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="bg-[#5737B4] text-white px-3 py-2 rounded-md text-sm sm:text-base flex items-center gap-2"
          >
            Download Report
          </button>

          {showDownloadOptions && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleDownloadReport("pdf")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Download as PDF
              </button>
              <button
                onClick={() => handleDownloadReport("excel")}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Download as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <SearchFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={() => { }}
        onReset={handleReset}
        showStatus={false}
        showYear={false}
        showLocation={false}
        showBuyerName={false}
      />

      {/* Orders list */}
      <div className="space-y-3 mt-4">
        {currentOrders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          currentOrders.map((order) => (
            <div key={order.id} className="border-b border-gray-200">
              <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex flex-col md:flex-row flex-wrap sm:gap-2 md:gap-6 lg:gap-6 items-start md:items-center w-full md:w-auto gap-1">
                  <div className="font-medium">Order Number: {order.id}</div>
                  <div className="font-medium">
                    Order Placed At:{" "}
                    <span className="text-gray-500">
                      {/* {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("en-GB") // en-GB gives dd/mm/yyyy
                        : "N/A"} */}

                      Date:{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "N/A"}{" "}
                      , Time:{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "N/A"}
                    </span>
                  </div>

                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 md:px-4 lg:px-4 py-1 md:py-2 text-sm rounded text-left
                  ${order.status?.includes("pending")
                          ? "bg-red-100 text-red-800"
                          : order.status?.includes("returned")
                            ? "bg-green-100 text-green-800"
                            : order.status?.includes("confirmed")
                              ? "bg-green-200 text-green-900"
                              : order.status?.includes("expired")
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-black"
                        }`}
                    >
                      <span className="mr-1">•</span>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-2 md:mt-0 gap-3">
                  <div
                    onClick={() =>
                      navigate(`/vendor/orders/${order.id}`, {
                        state: { order },
                      })
                    }
                    className="hover:text-[#3c10c1] hover:underline cursor-pointer"
                  >
                    View Details
                  </div>

                  <div
                    className={`text-right font-semibold px-2 py-1 rounded  transition-all duration-200
      ${order.status?.toLowerCase() !== "pending"
                        ? "text-gray-400 cursor-not-allowed opacity-60"
                        : "text-[#5737B4] hover:text-[#3c10c1] cursor-pointer"
                      }
      ${loading ? "opacity-50 pointer-events-none" : ""}
    `}
                    onClick={() => {
                      if (order.status?.toLowerCase() === "pending" && !loading) {
                        handleConfirmOrder(order);
                      }
                    }}
                  >
                    {loading ? "Updating..." : "Confirm Order"}
                  </div>

                  <div
                    className={`mr-1 text-right font-semibold px-2 py-1 rounded  transition-all duration-200
      ${order.status?.toLowerCase() !== "pending"
                        ? "text-gray-400 cursor-not-allowed opacity-60"
                        : "text-[#ee0000] hover:text-[#c70000] cursor-pointer"
                      }
      ${loading ? "opacity-50 pointer-events-none" : ""}
    `}
                    onClick={() => {
                      if (order.status?.toLowerCase() === "pending" && !loading) {
                        handleCancelOrder(order);
                      }
                    }}
                  >
                    {loading ? "Updating..." : "Cancel"}
                  </div>

                  {/* Expand/Collapse Icon */}
                  {expandedOrder === order.id ? (
                    <BsChevronUp className="text-gray-500" />
                  ) : (
                    <BsChevronDown className="text-gray-500" />
                  )}
                </div>

              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="p-4 bg-gray-50">
                  {/* Order details table */}
                  <div className="flex flex-col md:flex-row font-semibold justify-between md:justify-evenly gap-2 md:gap-0 mb-4">
                    <p>
                      Amount Total : <span>₹ {order.total_price}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="flex gap-1 md:gap-3 items-center">
                        Payment Method :
                        <span className="flex gap-1 md:gap-3 items-center">
                          <PiCreditCardBold className="w-5 h-5" />
                        </span>
                        {order.payment_method}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100 text-left">
                        <tr>
                          <th className="px-4 py-2">Product</th>
                          <th className="px-4 py-2"></th>
                          <th className="px-4 py-2">Qty</th>
                          <th className="px-4 py-2">Price</th>
                          <th className="px-4 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-2 py-2">
                              {item.product_image && (
                                <img
                                  src={`${baseUrl}${item.product_image}`}
                                  alt={item.product_name}
                                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                                />
                              )}
                            </td>
                            <td className="px-2 py-2 md:py-8 font-bold text-[#5737B4]">
                              {item.product_name}
                              <span className="block font-semibold text-gray-600">
                                Size: {item.product_size}
                              </span>
                            </td>
                            <td className="px-2 py-2">{item.quantity}</td>
                            <td className="px-2 py-2">₹{item.product_price}</td>
                            <td className="px-2 py-2">
                              ₹
                              {(
                                item.quantity * parseFloat(item.product_price)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        )) || (
                            <tr>
                              <td className="px-2 py-2" colSpan={5}>
                                No items
                              </td>
                            </tr>
                          )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-2 text-right font-medium"
                          >
                            Shipping Cost:
                          </td>
                          <td className="px-4 py-2">₹{order.shipping_cost}</td>
                        </tr>
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-2 text-right font-medium"
                          >
                            Tax:
                          </td>
                          <td className="px-4 py-2">₹{order.tax}</td>
                        </tr>
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-2 text-right font-bold"
                          >
                            Grand Total:
                          </td>
                          <td className="px-4 py-2 font-bold text-[#5737B4]">
                            ₹{order.total_price}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
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
              className={`px-3 py-1 border rounded ${currentPage === page ? "bg-[#5737B4] text-white" : ""
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

      {/* <div className="mt-6">
        <button className="border border-[#5737B4] text-[#5737B4] px-4 py-2 rounded hover:bg-[#5737B4] hover:text-white">
          Back
        </button>
      </div> */}
    </div>
  );
};

export default OrderManagement;
