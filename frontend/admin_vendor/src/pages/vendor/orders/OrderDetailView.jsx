import React from 'react';
import bmw from '../../../assets/bmw.jpg';
import { Link } from 'react-router-dom';



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

const OrderDetailView = () => {
  const subtotal = orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const discount = 34;
  const delivery = 14;
  const platform = 5;
  const total = subtotal - discount + delivery + platform;

  return (
    <div className="bg-[#ECECF0] px-4 sm:px-6 py-8 rounded-2xl text-sm text-[#3C3C3C]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-[#3C3C3C]">
          <span className="text-[#5737B4] font-bold text-3xl">Order Management</span> / Order ID : <span className="text-black">12323566</span>
        </h1>
        <button className="bg-[#5737B4] hover:bg-[#432d9c] text-white px-4 py-2 rounded">Print Invoice</button>
      </div>
      <p className="text-sm text-gray-600 mb-6">Date : 20 May 2025 , Time : 3:30 PM</p>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer + Address */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold mb-2 text-lg">Customer Details</h2>
              <p><span className="font-medium">Name:</span> Rahul Mehta</p>
              <p><span className="font-medium">Email:</span> <a href="mailto:rahulmehta@gmail.com" className="text-blue-600 underline">rahulmehta@gmail.com</a></p>
              <p><span className="font-medium">Phone:</span> +91 8879654231</p>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold mb-2 text-lg">Delivery Address</h2>
              <p><span className="font-medium">Address Line 1:</span> Manjakkara (h)</p>
              <p><span className="font-medium">Address Line 2:</span> Koothattukulam PO</p>
              <p><span className="font-medium">Landmark:</span> Kallushaap Road</p>
              <p><span className="font-medium">Pincode:</span> 685541</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-11 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2"></th>
                    <th className="py-2">Quantity</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="">
                      <td className="py-3 flex gap-3 items-center">
                        <img src={item.image} alt="product" className="w-14 h-14 object-cover rounded" />
                        <div>
                          <p className="font-medium text-[#5737B4]" >{item.name}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">₹{item.price}</td>
                      <td className="py-3">₹{item.quantity * item.price}</td>
                    </tr>
                  ))}
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
                    className={`w-3 h-3 rounded-full mt-1 ${
                      item.status === 'done'
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

  <div className="w-full md:w-8/12 bg-white p-6 md:p-10 rounded shadow mt-4 overflow-x-auto">
  <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

  <table className="min-w-full text-sm table-auto">
    <tbody>
      <tr>
        <td className="py-2 pr-4 font-medium text-gray-700">Payment Method:</td>
        <td className="py-2 text-left text-gray-800">Card - **** 1234</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 font-medium text-gray-700">Subtotal:</td>
        <td className="py-2 text-left text-gray-800">₹{subtotal}</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 font-medium text-gray-700">Discount:</td>
        <td className="py-2 text-left text-gray-600">-₹{discount}</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 font-medium text-gray-700">Delivery Charges:</td>
        <td className="py-2 text-left text-gray-800">₹{delivery}</td>
      </tr>
      <tr>
        <td className="py-2 pr-4 font-medium text-gray-700">Platform Charges:</td>
        <td className="py-2 text-left text-gray-800">₹{platform}</td>
      </tr>
      <tr className="border-t border-gray-200 text-base font-bold">
        <td className="py-3 pr-4">Total</td>
        <td className="py-3 text-left">₹{total}</td>
      </tr>
    </tbody>
  </table>
</div>





      {/* Back Button */}
      <div className="mt-6">
        <Link to="/vendor/order">
        <button className="border border-[#5737B4] text-[#5737B4] px-4 py-2 rounded hover:bg-[#5737B4] hover:text-white">Back</button>
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailView;
