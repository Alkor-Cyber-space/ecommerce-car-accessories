import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import bmw from '../../assets/bmw.jpg'


const ReturnsRefundsTable = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const orders = [
  {
    id: '12345769087',
    date: '20 May 2025',
    time: '3.30 PM',
    status: 'Return Initiated',
    total: '41600 ₽',
  
    products: [
      {
        name: 'Alloy Wheel XZR15',
        img: bmw, 
        details: 'Color - Black, Size - XL',
        quantity: 4,
        price: '800₹',
        totalPrice: '20800₹'
        
      },
      {
        name: 'Alloy Wheel XZR15',
        img: bmw, 
        details: 'Color - Black, Size - XL',
        quantity: 4,
        price: '800₹',
        totalPrice: '20800₹'
      }
    ],
    refundStatus: 'Waiting For Product Delivery',
    refundMethod: 'Mastercard ending 3035'
  },
  {
    id: '12345769088',
    date: '21 May 2025',
    time: '10.15 AM',
    status: 'Returned',
    total: '32500 ₽',
    paymentMethod: 'Visa ending 4242',
    products: [
      {
        name: 'Car Seat Cover',
        details: 'Material - Leather, Color - Beige',
        quantity: 2,
        price: '1200₹',
        totalPrice: '2400₹'
      },
      {
        name: 'Steering Wheel Cover',
        details: 'Material - Rubber, Color - Black',
        quantity: 1,
        price: '500₹',
        totalPrice: '500₹'
      }
    ],
    refundStatus: 'Refund Processed',
    refundMethod: 'Visa ending 4242'
  },
  {
    id: '12345769089',
    date: '22 May 2025',
    time: '12:00 PM',
    status: 'Approved',
    total: '15400 ₽',
    paymentMethod: 'UPI ID: user@upi',
    products: [
      {
        name: 'LED Headlights', 
        details: 'Model - H4, White Light',
        quantity: 2,
        price: '7700₹',
        totalPrice: '15400₹'
      }
    ],
    refundStatus: 'Not Applicable',
    refundMethod: '—'
  },
  {
    id: '12345769090',
    date: '23 May 2025',
    time: '5:45 PM',
    status: 'Expired',
    total: '9800 ₽',
    paymentMethod: 'Cash on Delivery',
    products: [
      {
        name: 'Car Perfume',
        details: 'Color - Black, Size - XL, Any other important details',
        quantity: 4,
        price: '2450₹',
        totalPrice: '9800₹'
      }
    ],
    refundStatus: 'Not Applicable',
    refundMethod: '—'
  }
];


  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Returns & Refunds</h2>
        <button className="bg-purple-600 text-white text-sm px-4 py-2 rounded hover:bg-purple-700 flex items-center">
          Download Report
        </button>
      </div>

      {/* Filter Form */}
      <div className="bg-white w-4xl py-4 px-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Select Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Returned</option>
                <option>Expired</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date - From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date - To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button className="border border-gray-300 text-gray-700 px-6 py-2 text-sm rounded-md hover:bg-gray-50">
            Reset
          </button>
          <button className="bg-purple-600 text-white px-6 py-2 text-sm rounded-md hover:bg-purple-700">
            Search
          </button>
        </div>
      </div>
      {/* Filter Section (unchanged from your layout - optional update) */}
      {/* ...Your existing filter UI can be added here... */}

      <div className="space-y-4">
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
                  Order Placed At: <span className="text-gray-500">Date: {order.date}, Time: {order.time}</span>
                </div>
                <div className="mt-1">
  <span
    className={`inline-block w-40 px-4 py-2 text-sm rounded text-left
      ${
        order.status.includes('Initiated') ? 'bg-red-100 text-red-800' :
        order.status.includes('Returned') ? 'bg-green-100 text-green-800' :
        order.status.includes('Approved') ? 'bg-blue-100 text-blue-800' :
        order.status.includes('Expired') ? 'bg-orange-100 text-orange-800' :
        'bg-gray-100 text-black'
      }
    `}
  >
    <span className="mr-1">•</span>{order.status}
  </span>
</div>

              </div>
              <div className="flex items-center">
                <div className="mr-4 text-right text-[#5737B4] font-semibold">
                  <div className="font-medium"/>Update Status
                  {/* <div className="font-medium">{order.total}</div>
                  <div className="text-sm text-gray-500">{order.paymentMethod}</div> */}
                </div>
                {expandedOrder === order.id ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </div>

            </div>

            

            {/* Expanded Details */}
            {expandedOrder === order.id && (
              <div className="p-4 bg-gray-50">
                <div className="flex  font-semibold justify-between ">
              {/* <span>Amount Total:</span> <span className="ml-2"> ₹410000</span> */}
              {/* <span>Payment Method:</span> <span className="ml-2">{order.refundMethod}</span> */}
              <p className="fl">Amount Total : <span>₹ 410000</span> </p>
              <div className="ml-5">
              <p className="pr-113 flex gap-3">PaymentMethod : <span className="flex gap-3"><svg className="w-5 h-5 mt-1 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 4h20a2 2 0 012 2v1H0V6a2 2 0 012-2zm-2 5v9a2 2 0 002 2h20a2 2 0 002-2V9H0zm6 3a1 1 0 100 2h4a1 1 0 100-2H6z" />
        </svg>{order.refundMethod}</span> </p>
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
                          <td className="px-2 py-8 font-bold text-[#5737B4]">{product.name}<span className="block font-semibold text-gray-600">{product.details}</span><span className="block font-semibold  text-gray-600">Any other important details</span></td>
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
                    <span className={`px-2 py-1 text-sm ${
                      order.refundStatus.includes('Waiting') ? 'bg-blue-100 text-blue-500' :
                      order.refundStatus.includes('Processed') ? 'bg-blue-100 text-blue-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.refundStatus}
                    </span>
                    <div className="ml-5">
              <p className="pr-90 flex gap-3">Refund Method : <span className="flex gap-3"><svg className="w-5 h-5 mt-1 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 4h20a2 2 0 012 2v1H0V6a2 2 0 012-2zm-2 5v9a2 2 0 002 2h20a2 2 0 002-2V9H0zm6 3a1 1 0 100 2h4a1 1 0 100-2H6z" />
        </svg>{order.refundMethod}</span> </p>
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

export default ReturnsRefundsTable;
