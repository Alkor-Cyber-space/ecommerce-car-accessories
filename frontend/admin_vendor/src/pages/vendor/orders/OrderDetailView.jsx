import React from 'react';
import bmw from '../../../assets/bmw.jpg';
import { Link, useLocation, useParams } from 'react-router-dom';
import { baseUrl } from "../../../services/serverURL";


// const timelineLabels = [
//   "Order Placed",
//   "Order Confirmed",
//   "Processing",
//   "Shipped",
//   "Out For Delivery",
//   "Delivered",
//   "Return Initiated",
//   "Returned",
//   "Refund Initiated",
//   "Refunded",
// ];

const orderItems = [
  {
    name: "Alloy Wheel XZR15",
    description: "Color - Black, Size - XL",
    quantity: 2,
    price: 5200,
    image: bmw
  },
  {
    name: "LED Fog Light Pro",
    description: "Color - White, Power - 50W",
    quantity: 1,
    price: 1500,
    image: bmw
  },
  {
    name: "LED Fog Light Pro",
    description: "Color - White, Power - 50W",
    quantity: 1,
    price: 1500,
    image: bmw
  },
  {
    name: "LED Fog Light Pro",
    description: "Color - White, Power - 50W",
    quantity: 1,
    price: 1500,
    image: bmw
  },
  {
    name: "Seat Cover Leather",
    description: "Color - Brown, Size - Universal",
    quantity: 3,
    price: 2400,
    image: bmw
  }
];

const OrderDetailView = () => {
  const location = useLocation();
  const { id } = useParams();
  const order = location.state?.order;
  const serverUrl = baseUrl;
  if (!order) {
    return (
      <div className="p-6 text-gray-500">
        No order data found. Please go back.
      </div>
    );
  }
  const orderItems = order.items || [];
  const orderStatusMap = {
    pending: "current",
    completed: "done",
    refunded: "done",
  };

  const timelineLabels = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
  ];

  const statusOrder = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
  ];

  // Find current order index in timeline
  const currentIndex = statusOrder.indexOf(order.status);


  const grandTotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const subtotal = orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const discount = 34;
  const delivery = 14;
  const platform = 5;
  const total = subtotal - discount + delivery + platform;

  return (
    <div className="bg-[#ECECF0] px-4 sm:px-6 py-8 rounded-2xl text-sm text-[#3C3C3C]">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-semibold mb-1">
          <Link to="/vendor/orders" className="text-[#5737B4] hover:underline pr-3">
            Order Management
          </Link>
          / Order ID : {order.id}
        </h1>
        <button className="bg-[#5737B4] hover:bg-[#432d9c] text-white px-4 py-2 rounded">Print Invoice</button>
      </div>
      <p className="text-md text-gray-600 mb-6 tracking-wide"> Date: {new Date(order.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}, Time:{" "}
        {new Date(order.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer + Address */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='bg-white mt-4 p-6 rounded shadow'>
              <h2 className="font-medium mb-4 text-lg">Customer Details</h2>
              <div className=" grid grid-cols-2 gap-y-5">
                <p className="font-medium">Name</p>
                <p>{order.customer_name || "N/A"} </p>
                <p className="font-medium">Email</p>
                <p className='text-[#5737B4] underline cursor-pointer'>{order.customer_email || "N/A"}</p>
                <p className="font-medium">Phone</p>
                <p>{order.customer_phone || "N/A"}</p>
              </div>
            </div>
            
            <div className='bg-white mt-4 p-6 rounded shadow'>
              <h2 className="font-medium mb-4 text-lg">Shipping Details</h2>
              <div className="grid grid-cols-2 gap-y-5">
                <p className="font-medium">Courier Name</p>
                <p>{order.courier_name || "N/A"}</p>
                <p className="font-medium">AWB Code</p>
                <p>{order.awb_code || "N/A"}</p>
                <p className="font-medium">Tracking Link</p>
                <p>
                  {order.tracking_url ? (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[#5737B4] hover:underline">
                      Track Order
                    </a>
                  ) : "N/A"}
                </p>
                <p className="font-medium">Shiprocket Order ID</p>
                <p>{order.shiprocket_order_id || "N/A"}</p>
                <p className="font-medium">Shipment ID</p>
                <p>{order.shipment_id || "N/A"}</p>
              </div>
            </div>

            <div className='bg-white p-6 rounded shadow md:col-span-2'>
              <h2 className="font-medium mb-4 text-lg">Delivery Address</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5">
                <p className="font-medium">Address Line 1</p>
                <p className="md:col-span-3">{order.shipping_address_details?.line1 || "N/A"}</p>
                <p className="font-medium">Address Line 2</p>
                <p className="md:col-span-3">{order.shipping_address_details?.line2 || "N/A"}</p>
                <p className="font-medium">City</p>
                <p>{order.shipping_address_details?.city || "N/A"}</p>
                <p className="font-medium">State / Country</p>
                <p>{order.shipping_address_details ? `${order.shipping_address_details.state}, ${order.shipping_address_details.country}` : "N/A"}</p>
                <p className="font-medium">Pincode</p>
                <p>{order.shipping_address_details?.postal_code || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white px-5 py-5 rounded shadow">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="overflow-y-auto max-h-80 mt-4 scrollbar-none">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th></th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 flex gap-3 items-center">
                        <img src={`${serverUrl}${item.product_image}`} alt="product" className="w-14 h-14 object-cover rounded" />
                        <div>
                          <p className="font-medium text-[#5737B4]">{item.product_name}</p>
                          {item.product_size && (
                            <p className="text-sm text-gray-500">Size: {item.product_size}</p>
                          )}
                          <p className="text-xs text-gray-400">Status: {item.status || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">₹{item.product_price}</td>
                      <td className="py-3">₹{item.quantity * item.product_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order History */}
        {/* <div className="bg-white p-6 rounded shadow h-fit">
          <h2 className="font-semibold mb-2 text-lg">Order History</h2>
          <ul className="relative border-l-2 border-gray-200 ml-2 space-y-4">
            {orderHistory.map((item, idx) => (
              <li key={idx} className="ml-4">
                <div className="flex items-start gap-2">
                  <span
                    className={`w-3 h-3 rounded-full mt-1 ${item.status === 'done'
                      ? 'bg-green-500'
                      : item.status === 'current'
                        ? 'bg-[#5737B4]'
                        : 'bg-gray-300'
                      }`}
                  ></span>
                  <div>
                    <p className={`${item.status === 'current' ? 'text-[#5737B4] font-semibold' : 'text-black'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div> */}

        <div className="bg-white p-6 rounded shadow h-fit">
          <h2 className="font-semibold mb-2 text-lg">Order History</h2>
          <ul className="relative border-l-2 border-gray-200 ml-2 space-y-4">
            {timelineLabels.map((label, idx) => {
              let statusClass = "bg-gray-300";
              let labelColor = "text-gray-700";
              let showDate = false;
              let dateToUse = order.updated_at || order.created_at;

              // Determine behavior if cancelled
              const isCancelled = order.status === "cancelled";

              if (isCancelled) {
                if (idx === 0) {
                  statusClass = "bg-green-500";
                  labelColor = "text-green-600 font-medium";
                  showDate = true;
                  dateToUse = order.created_at;
                } else {
                  statusClass = "bg-gray-300";
                  labelColor = "text-gray-400";
                }
              } else {
                // Normal order flow (not cancelled)
                if (idx < currentIndex) {
                  statusClass = "bg-green-500";
                  labelColor = "text-green-600 font-medium";
                  showDate = true;
                  // We don't have history, so just use updated_at for past steps
                } else if (idx === currentIndex) {
                  statusClass = "bg-[#5737B4]";
                  labelColor = "text-[#5737B4] font-semibold";
                  showDate = true;
                }
                
                // Pending always uses created_at
                if (idx === 0) {
                  dateToUse = order.created_at;
                }
              }

              return (
                <li key={idx} className="ml-4">
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-3 h-3 rounded-full mt-1 transition-all duration-300 ${statusClass}`}
                    ></span>
                    <div>
                      <p className={`${labelColor}`}>{label}</p>
                      {showDate && (
                        <p className="text-xs text-gray-500">
                          {new Date(dateToUse).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          {new Date(dateToUse).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {order.status === "cancelled" && (
              <li className="ml-4">
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full mt-1 transition-all duration-300 bg-red-500"></span>
                  <div>
                    <p className="text-red-600 font-semibold">Cancelled</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updated_at || order.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {new Date(order.updated_at || order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="w-full md:w-8/12 bg-white lg:p-4 md:p-10 sm:p-5 rounded shadow mt-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
        <table className="min-w-full text-sm table-auto">
          <tbody>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Payment Method:</td>
              <td className="py-2 text-left text-gray-800" style={{ textTransform: 'uppercase' }}>
                {order.payment_method || "N/A"}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Subtotal:</td>
              <td className="py-2 text-left text-gray-800">
                ₹{order.vendor_total_price || "0.00"}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Delivery Charges:</td>
              <td className="py-2 text-left text-gray-800">
                ₹{order.vendor_shipping_cost || "0.00"}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Tax:</td>
              <td className="py-2 text-left text-gray-800">
                ₹{order.vendor_tax || "0.00"}
              </td>
            </tr>
            <tr className="border-t border-gray-200 text-base font-bold">
              <td className="py-3 pr-4">Total</td>
              <td className="py-3 text-left">
                ₹{
                  (
                    parseFloat(order.vendor_total_price || 0) +
                    parseFloat(order.vendor_tax || 0) +
                    parseFloat(order.vendor_shipping_cost || 0)
                  ).toFixed(2)
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Back Button */}
      <div className="mt-6">
        <Link to="/vendor/orders">
          <button className="border border-[#5737B4] text-[#5737B4] w-25  py-2 rounded hover:bg-[#5737B4] hover:text-white">Back</button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailView;
