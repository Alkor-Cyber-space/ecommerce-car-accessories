import React from 'react';
import bmw from '../../../assets/bmw.jpg';
import { Link, useLocation, useParams } from 'react-router-dom';

const orderHistory = [
  { label: 'Order placed', date: '24 May 2025', status: 'done' },
  { label: 'Order Confirmed', date: '24 May 2025', status: 'current' },
  { label: 'Processing', date: '24 May 2025', status: 'pending' },
  { label: 'Shipped', date: '24 May 2025', status: 'pending' },
  { label: 'Out For Delivery', date: '24 May 2025', status: 'pending' },
  { label: 'Delivered', date: '24 May 2025', status: 'pending' },
  { label: 'Return Initiated', date: '24 May 2025', status: 'pending' },
  { label: 'Returned', date: '24 May 2025', status: 'pending' },
  { label: 'Refund Initiated', date: '24 May 2025', status: 'pending' },
  { label: 'Refunded', date: '24 May 2025', status: 'pending' },
];
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
  const serverUrl = "http://127.0.0.1:8000/";
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
    "Paid",
    "Processing",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const statusOrder = [
    "pending",
    "paid",
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
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
                <p>Rahul Mehta</p>
                <p className="font-medium">Email</p>
                <p className='text-[#5737B4] underline cursor-pointer'>rahulmehta@gmail.com</p>
                <p className="font-medium">Phone</p>
                <p>+91 8879654231</p>
              </div>
            </div>
            <div className='bg-white mt-4 p-6 rounded shadow'>
              <h2 className="font-medium mb-4 text-lg">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-y-5  ">
                <p className="font-medium">Address Line 1</p>
                <p>Manjakkara (h)</p>
                <p className="font-medium">Address Line 2</p>
                <p>Koothattukulam PO</p>
                <p className="font-medium">Landmark</p>
                <p>Kallushaap Road</p>
                <p className="font-medium">Pincode</p>
                <p>685541</p>
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
                          <p className="text-sm text-gray-500">{item.description}</p>
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
          <h2 className="font-semibold mb-2 text-lg">Order- History</h2>
          <ul className="relative border-l-2 border-gray-200 ml-2 space-y-4">
            {timelineLabels.map((label, idx) => {
              const statusKey = statusOrder[idx];
              let statusClass = "bg-gray-300";
              let labelColor = "text-gray-700";

              // Determine behavior if cancelled
              const isCancelled = order.status === "cancelled";
              const cancelledIndex = statusOrder.indexOf("cancelled");

              if (isCancelled) {
                if (idx < cancelledIndex) {
                  // Before cancelled - grey (not completed)
                  statusClass = "bg-gray-300";
                  labelColor = "text-gray-500";
                } else if (idx === cancelledIndex) {
                  // Cancelled step
                  statusClass = "bg-red-500";
                  labelColor = "text-red-600 font-semibold";
                } else {
                  // After cancelled - grey (not applicable)
                  statusClass = "bg-gray-300";
                  labelColor = "text-gray-400";
                }
              } else {
                // Normal order flow (not cancelled)
                if (idx < currentIndex) {
                  statusClass = "bg-green-500";
                  labelColor = "text-green-600 font-medium";
                } else if (idx === currentIndex) {
                  statusClass = "bg-[#5737B4]";
                  labelColor = "text-[#5737B4] font-semibold";
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
              );
            })}
          </ul>
        </div>
      </div>

      <div className="w-full md:w-8/12 bg-white lg:p-4 md:p-10 sm:p-5 rounded shadow mt-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
        <table className="min-w-full text-sm table-auto">
          <tbody>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Payment Method:</td>
              <td className="py-2 text-left text-gray-800">{order.payment_method}- **** 1234</td>
            </tr>
            {orderItems
              .map(item => item.quantity * item.product_price)
              .reduce((acc, total) => acc + total, 0) !== parseFloat(order.total_price) && (
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-700">Subtotal:</td>
                  <td className="py-2 text-left text-gray-800">
                    ₹{
                      orderItems
                        .map(item => item.quantity * item.product_price)
                        .reduce((acc, total) => acc + total, 0)
                    }
                  </td>
                </tr>
              )}

            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Discount:</td>
              <td className="py-2 text-left text-gray-600">-₹{discount}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Delivery Charges:</td>
              <td className="py-2 text-left text-gray-800">₹{order.shipping_cost}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Tax :</td>
              <td className="py-2 text-left text-gray-800">₹{order.tax}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Platform Charges:</td>
              <td className="py-2 text-left text-gray-800">₹{platform}</td>
            </tr>
            <tr className="border-t border-gray-200 text-base font-bold">
              <td className="py-3 pr-4">Total</td>
              <td className="py-3 text-left">₹{order.total_price}</td>
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
