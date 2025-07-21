import React from 'react';

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

const OrderDetailView = () => {
  return (
    <div className="min-h-screen bg-[#E9E9F0] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-[#3C3C3C]">
          <span className="text-[#5737B4] font-bold text-3xl">Order Management</span> / Order ID : <span className="text-black">12323566</span>
        </h1>
        <button className="bg-[#5737B4] hover:bg-[#432d9c] text-white px-4 py-2 rounded">Print Invoice</button>
      </div>
      <p className="text-sm text-gray-600 mb-6">Date : 20 May 2025 , Time : 3:30 PM</p>

      {/* Top Row: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer Details */}
    <div className="bg-white  px-4 py-3  rounded shadow ">
  <h2 className="font-semibold mb-2 text-lg">Customer Details</h2>
  <p className="text-sm"><span className="font-medium">Name:</span> Rahul Mehta</p>
  <p className="text-sm">
    <span className="font-medium">Email:</span>{' '}
    <a href="mailto:rahulmehta@gmail.com" className="text-blue-600 underline">rahulmehta@gmail.com</a>
  </p>
  <p className="text-sm"><span className="font-medium">Phone:</span> +91 8879654231</p>
</div>

{/* Delivery Address */}
<div className="bg-white px-4 py-3 rounded shadow h-full">
  <h2 className="font-semibold mb-2 text-sm">Delivery Address</h2>
  <p className="text-sm"><span className="font-medium">Address Line 1:</span> Manjakkara (h)</p>
  <p className="text-sm"><span className="font-medium">Address Line 2:</span> Koothattukulam PO</p>
  <p className="text-sm"><span className="font-medium">Landmark:</span> Kallushaap Road</p>
  <p className="text-sm"><span className="font-medium">Pincode:</span> 685541</p>
</div>
 </div>

        {/* Order History */}
        <div className="grid grid-cols-4 md:grid-cols-3 gap-4 mt-4">
  <div className="col-span-4 ml-auto">
    <div className="bg-white p-6 rounded shadow h-full">
      <h2 className="font-semibold mb-2">Order History</h2>
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
                <p
                  className={`${
                    item.status === 'current'
                      ? 'text-[#5737B4] font-semibold'
                      : 'text-black'
                  }`}
                >
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
</div>

     

      {/* Bottom Row: Order Summary + Payment */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Order Summary */}
        <div className=" md:w-2/3 w-full bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Product</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 flex gap-3 items-start">
                      <img src="/alloy-wheel.png" alt="product" className="w-14 h-14 object-cover rounded" />
                      <div>
                        <p className="font-medium text-[#5737B4]">Alloy Wheel XZR15</p>
                        <p className="text-xs text-gray-500">Color - Black, Size - XL</p>
                      </div>
                    </td>
                    <td className="py-3">4</td>
                    <td className="py-3">₹5200</td>
                    <td className="py-3">₹20800</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details */}
        <div className="md:w-1/3 w-full bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Payment Method:</span> Card - **** 1234</p>
            <p><span className="font-medium">Subtotal:</span> ₹20800</p>
            <p><span className="font-medium">Discount:</span> -₹34</p>
            <p><span className="font-medium">Delivery Charges:</span> ₹14</p>
            <p><span className="font-medium">Platform Charges:</span> ₹5</p>
            <div className="border-t pt-3 mt-2 text-lg font-bold flex justify-between">
              <span>Total</span>
              <span>₹62000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button className="border border-[#5737B4] text-[#5737B4] px-4 py-2 rounded hover:bg-[#5737B4] hover:text-white">Back</button>
    </div>
  );
};

export default OrderDetailView;
