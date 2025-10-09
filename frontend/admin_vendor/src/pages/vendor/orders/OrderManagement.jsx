import React, { useState, useEffect, useRef } from "react";
import bmw from "../../../assets/bmw.jpg";
import { PiCreditCardBold } from "react-icons/pi";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import {
  getOrdersApi,
  updateOrderStatusApi,
  exportReportApi,
} from "../../../services/allAPI";
import { toast } from "react-toastify";
import SearchFilter from "../../admin/SearchFilter";
import OrderDetailView from "./OrderDetailView";
import { data, useNavigate } from "react-router-dom";

// dummydata (kept as-is from your original file)
const orders = [
  {
    id: "12345769087",
    date: "20 May 2025",
    time: "3.30 PM",
    status: "Return Initiated",
    total: "41600 ₽",

    products: [
      {
        name: "Alloy Wheel XZR15",
        img: bmw,
        details: "Color - Black, Size - XL",
        quantity: 4,
        price: "800₹",
        totalPrice: "20800₹",
      },
      {
        name: "Alloy Wheel XZR15",
        img: bmw,
        details: "Color - Black, Size - XL",
        quantity: 4,
        price: "800₹",
        totalPrice: "20800₹",
      },
    ],
    refundStatus: "Waiting For Product Delivery",
    refundMethod: "Mastercard ending 3035",
  },
  {
    id: "12345769088",
    date: "21 May 2025",
    time: "10.15 AM",
    status: "Returned",
    total: "32500 ₽",
    paymentMethod: "Visa ending 4242",
    products: [
      {
        name: "Car Seat Cover",
        details: "Material - Leather, Color - Beige",
        quantity: 2,
        price: "1200₹",
        totalPrice: "2400₹",
      },
      {
        name: "Steering Wheel Cover",
        details: "Material - Rubber, Color - Black",
        quantity: 1,
        price: "500₹",
        totalPrice: "500₹",
      },
    ],
    refundStatus: "Refund Processed",
    refundMethod: "Visa ending 4242",
  },
  {
    id: "12345769089",
    date: "22 May 2025",
    time: "12:00 PM",
    status: "Approved",
    total: "15400 ₽",
    paymentMethod: "UPI ID: user@upi",
    products: [
      {
        name: "LED Headlights",
        details: "Model - H4, White Light",
        quantity: 2,
        price: "7700₹",
        totalPrice: "15400₹",
      },
    ],
    refundStatus: "Not Applicable",
    refundMethod: "—",
  },
  {
    id: "12345769090",
    date: "23 May 2025",
    time: "5:45 PM",
    status: "Expired",
    total: "9800 ₽",
    paymentMethod: "Cash on Delivery",
    products: [
      {
        name: "Car Perfume",
        details: "Color - Black, Size - XL, Any other important details",
        quantity: 4,
        price: "2450₹",
        totalPrice: "9800₹",
      },
    ],
    refundStatus: "Not Applicable",
    refundMethod: "—",
  },
];

const OrderManagement = ({ order }) => {
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const serverurl = "http://127.0.0.1:8000/";
  const navigate = useNavigate();

  const [filteredOrders, setFilteredOrders] = useState([]); // new state for filtered data
  const [filters, setFilters] = useState({
    regDateFrom: "",
    regDateTo: "",
    orderId: "",
    buyerName: "",
    orderStatus: "",
  });

  // Download dropdown state + ref
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const dropdownRef = useRef(null); // <-- FIX: declare dropdownRef

  // Search handler
  const handleSearch = () => {
    const filtered = userOrders.filter((order) => {
      const matchesStatus = filters.orderStatus
        ? order.status?.toLowerCase() === filters.orderStatus.toLowerCase()
        : true;

      const matchesDateFrom = filters.regDateFrom
        ? new Date(order.created_at) >= new Date(filters.regDateFrom)
        : true;

      const matchesDateTo = filters.regDateTo
        ? new Date(order.created_at) <= new Date(filters.regDateTo)
        : true;

      const matchesOrderId = filters.orderId
        ? order.id.toString().includes(filters.orderId)
        : true;

      const matchesBuyerName = filters.buyerName
        ? order.buyerName
            ?.toLowerCase()
            .includes(filters.buyerName.toLowerCase())
        : true;

      return (
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesOrderId &&
        matchesBuyerName
      );
    });

    setFilteredOrders(filtered);
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await getOrdersApi();
      setUserOrders(response);
      setFilteredOrders(response); // initialize filtered list
      console.log(response);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (order) => {
    setLoading(true);
    try {
      const response = await updateOrderStatusApi(order.id);
      console.log(response);

      toast.success("Order status updated successfully");

      if (fetchOrders) fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    setFilters({
      regDateFrom: "",
      regDateTo: "",
      orderId: "",
      buyerName: "",
      orderStatus: "",
    });
    setFilteredOrders(userOrders);
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

  // Download report handler (uses your backend export endpoint)
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Order Management
        </h2>

        {/* Download dropdown (placed without removing anything else) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="bg-[#5737B4] text-white px-3 py-2 rounded-md text-sm sm:text-base flex items-center gap-2"
          >
            Download Report
            {/* <FiDownload className="text-white text-lg" /> */}
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

      <SearchFilter
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        showStatus={false}
        showYear={false}
        showLocation={false}
      />
      <div className="space-y-4 mt-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="border-b border-gray-200">
              <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex flex-col md:flex-row flex-wrap sm:gap-2 md:gap-6 lg:gap-12 items-start md:items-center w-full md:w-auto gap-15">
                  <div className="font-medium">Order Number: {order.id}</div>
                  <div className="font-medium">
                    Order Placed At:{" "}
                    <span className="text-gray-500">
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
                      className={`inline-block px-2 md:px-4 py-1 md:py-2 text-sm rounded text-left
                  ${
                    order.status?.includes("pending")
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
                    className={`mr-4 text-right text-[#5737B4] font-semibold cursor-pointer ${
                      loading ? "opacity-50 pointer-events-none" : ""
                    }`}
                    onClick={() => handleUpdateStatus(order)}
                  >
                    {loading ? "Updating..." : "Update Status"}
                  </div>
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
                                  src={`${serverurl}${item.product_image}`}
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
      <hr className="h-4" />

      {/* dummy */}
      <div className="space-y-4 py-2">
        {orders.map((order) => (
          <div key={order.id} className="border-b border-gray-200 ">
            {/* Order Summary */}
            <div
              className="flex justify-between items-center bg-white p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleOrder(order.id)}
            >
              <div className="flex gap-26 items-center ">
                <div className="font-medium">Order Number: {order.id}</div>
                <div className="font-medium ">
                  Order Placed At:{" "}
                  <span className="text-gray-500">
                    Date: {order.date}, Time: {order.time}
                  </span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block w-40 px-4 py-2 text-sm rounded text-left
      ${
        order.status.includes("Initiated")
          ? "bg-red-100 text-red-800"
          : order.status.includes("Returned")
          ? "bg-green-100 text-green-800"
          : order.status.includes("Approved")
          ? "bg-blue-100 text-blue-800"
          : order.status.includes("Expired")
          ? "bg-orange-100 text-orange-800"
          : "bg-gray-100 text-black"
      }`}
                  >
                    <span className="mr-1">•</span>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 text-right text-[#5737B4] font-semibold">
                  <div className="font-medium" />
                  Update Status
                </div>
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
                <div className="flex  font-semibold justify-between ">
                  <p className="fl">
                    Amount Total : <span>₹ 410000</span>{" "}
                  </p>
                  <div className="ml-5">
                    <p className="pr-113 flex gap-3">
                      PaymentMethod :{" "}
                      <span className="flex gap-3">
                        <PiCreditCardBold className="w-5 h-5 mt-1" />
                      </span>
                      {order.refundMethod}{" "}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <table className="min-w-full  divide-gray-200 text-sm align-items-lg-end">
                    <thead className="bg-black-100 text-left">
                      <tr>
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2">Qty</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-gray-200">
                      {order.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            {product.img && (
                              <img
                                src={product.img}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                          </td>
                          <td className="px-2 py-8 font-bold text-[#5737B4]">
                            {product.name}
                            <span className="block font-semibold text-gray-600">
                              {product.details}
                            </span>
                            <span className="block font-semibold  text-gray-600">
                              Any other important details
                            </span>
                          </td>
                          <td className="px-4 py-2">{product.quantity}</td>
                          <td className="px-4 py-2">{product.price}</td>
                          <td className="px-4 py-2">{product.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className=" items-right gap-4">
                  <div className="flex gap-8">
                    <h3 className="font-medium mb-1 ">Refund Info</h3>
                    <span
                      className={`px-2 py-1 text-sm ${
                        order.refundStatus.includes("Waiting")
                          ? "bg-blue-100 text-blue-500"
                          : order.refundStatus.includes("Processed")
                          ? "bg-blue-100 text-blue-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.refundStatus}
                    </span>
                    <div className="ml-5">
                      <p className="pr-90 flex gap-3">
                        Refund Method :{" "}
                        <span className="flex gap-3">
                          <PiCreditCardBold className="w-5 h-5 mt-1" />
                        </span>
                        {order.refundMethod}{" "}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end items-end">
                    <div className="mr-4 text-right text-[#5737B4] font-semibold">
                      Update Status
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="border border-[#5737B4] text-[#5737B4] px-4 py-2 rounded hover:bg-[#5737B4] hover:text-white">
          Back
        </button>
      </div>
    </div>
  );
};

export default OrderManagement;
