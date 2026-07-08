import React from 'react';
import bmw from '../../../assets/bmw.jpg';
import { Link, useLocation } from 'react-router-dom';




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

const handleClick = (tab) => {
  setActiveTab(tab);
};

const orderItems = [
  {
    name: "Alloy Wheel XZR15",
    description: "Color - Black, Size - XL",
    quantity: 2,
    price: 5200,
    image: bmw // ✅ use imported image directly
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



const OrderDetailEdit = () => {
  const location = useLocation();
  const order = location.state?.order || {};
  const currentOrderItems = order.items || orderItems;

  const subtotal = currentOrderItems.reduce((acc, item) => acc + item.quantity * (item.product_price || item.price), 0);
  const discount = 34;
  const delivery = order.vendor_shipping_cost || 14;
  const platform = 5;
  const total = subtotal - discount + parseFloat(delivery) + platform;

  return (
    <div className="bg-[#ECECF0] px-4 sm:px-6 py-8 rounded-2xl text-sm text-[#3C3C3C]">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-semibold mb-1">
          <Link to="/vendor/orders" className="text-[#5737B4] hover:underline pr-3">
            Order Management
          </Link>
          / Edit Order ID : {order.id || "12323566"}
        </h1>
        <button className="bg-[#5737B4] hover:bg-[#432d9c] text-white px-4 py-2 rounded">Print Invoice</button>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        {order.created_at ? (
          `Date : ${new Date(order.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })} , Time : ${new Date(order.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        ) : (
          "Date : 20 May 2025 , Time : 3:30 PM"
        )}
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
                <p>{order.customer_name || "Rahul Mehta"}</p>
                <p className="font-medium">Email</p>
                <p className='text-[#5737B4] underline cursor-pointer'>{order.customer_email || "rahulmehta@gmail.com"}</p>
                <p className="font-medium">Phone</p>
                <p>{order.customer_phone || "+91 8879654231"}</p>
              </div>
            </div>
            <div className='bg-white mt-4 p-6 rounded shadow'>
              <h2 className="font-medium mb-4 text-lg">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-y-5  ">
                <p className="font-medium">Address Line 1</p>
                <p>{order.shipping_address_details?.line1 || "Manjakkara (h)"}</p>
                <p className="font-medium">Address Line 2</p>
                <p>{order.shipping_address_details?.line2 || "Koothattukulam PO"}</p>
                <p className="font-medium">City</p>
                <p>{order.shipping_address_details?.city || "Kallushaap Road"}</p>
                <p className="font-medium">State / Country</p>
                <p>{order.shipping_address_details ? `${order.shipping_address_details.state}, ${order.shipping_address_details.country}` : "685541"}</p>
                <p className="font-medium">Pincode</p>
                <p>{order.shipping_address_details?.postal_code || "685541"}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white px-5 py-5 rounded shadow">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {/* Scrollable area with max height */}
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
                  {currentOrderItems.map((item, index) => {
                    const name = item.product_name || item.name;
                    const price = item.product_price || item.price;
                    const image = item.product_image ? `http://127.0.0.1:8000${item.product_image}` : item.image;
                    return (
                      <tr key={index}>
                        <td className="py-3 flex gap-3 items-center">
                          <img src={image} alt="product" className="w-14 h-14 object-cover rounded" />
                          <div>
                            <p className="font-medium text-[#5737B4]">{name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3">₹{price}</td>
                        <td className="py-3">₹{item.quantity * price}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Order History */}
        <div className="bg-white p-6 rounded shadow h-fit">
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
        </div>
      </div>

      <div className="w-full md:w-8/12 bg-white lg:p-4 md:p-10 rounded shadow mt-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

        <table className="min-w-full text-sm table-auto">
          <tbody>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Payment Method:</td>
              <td className="py-2 text-left text-gray-800" style={{ textTransform: 'uppercase' }}>
                {order.payment_method || "Card - **** 1234"}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Subtotal:</td>
              <td className="py-2 text-left text-gray-800">
                ₹{order.vendor_total_price !== undefined ? order.vendor_total_price : subtotal}
              </td>
            </tr>
            {order.vendor_total_price === undefined && (
              <tr>
                <td className="py-2 pr-4 font-medium text-gray-700">Discount:</td>
                <td className="py-2 text-left text-gray-600">-₹{discount}</td>
              </tr>
            )}
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Delivery Charges:</td>
              <td className="py-2 text-left text-gray-800">
                ₹{order.vendor_shipping_cost !== undefined ? order.vendor_shipping_cost : delivery}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700">Tax:</td>
              <td className="py-2 text-left text-gray-800">
                ₹{order.vendor_tax !== undefined ? order.vendor_tax : "0.00"}
              </td>
            </tr>
            {order.vendor_total_price === undefined && (
              <tr>
                <td className="py-2 pr-4 font-medium text-gray-700">Platform Charges:</td>
                <td className="py-2 text-left text-gray-800">₹{platform}</td>
              </tr>
            )}
            <tr className="border-t border-gray-200 text-base font-bold">
              <td className="py-3 pr-4">Total</td>
              <td className="py-3 text-left">
                ₹{
                  order.vendor_total_price !== undefined ? (
                    (
                      parseFloat(order.vendor_total_price || 0) +
                      parseFloat(order.vendor_tax || 0) +
                      parseFloat(order.vendor_shipping_cost || 0)
                    ).toFixed(2)
                  ) : (
                    total
                  )
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link to="/vendor/orders">
          <button className="border border-[#5737B4] text-[#5737B4] w-25 py-2 rounded hover:bg-[#5737B4] hover:text-white">Back</button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailEdit;
