import React, { useState } from 'react';
import SalesTrends from '../../components/admin/adminDashboard/SalesTrends';
import TotalProfitCard from '../../components/admin/adminDashboard/TotalProfitChart';
import RefundReturnStats from '../../components/admin/adminDashboard/RefundReturnStats';

const PaymentsEarnings = () => {
    // Original transaction data - keep unchanged for charts
    const originalTransactionData = [
        {
            date: '2025-07-16',
            transactionId: 'TXN12345678',
            type: 'Sale',
            product: 'XXR Model 575 Alloy Wheel',
            status: 'Completed',
            orderId: 'ORD890123',
            amount: '₹5,499',
            description: 'Payment received'
        },
        {
            date: '2025-07-16',
            transactionId: 'TXN12345679',
            type: 'Payout',
            product: '-',
            status: 'Settled',
            orderId: '-',
            amount: '₹8,499',
            description: 'Vendor payout'
        },
        {
            date: '2025-07-15',
            transactionId: 'TXN12345680',
            type: 'Fee Deduction',
            product: '-',
            status: 'Processing',
            orderId: '-',
            amount: '₹1,490',
            description: 'Platform commission'
        },
        {
            date: '2025-07-15',
            transactionId: 'TXN12345681',
            type: 'Refund',
            product: 'Maruti Swift Rearview Mirror',
            status: 'Processing',
            orderId: 'ORD890123',
            amount: '₹3,499',
            description: 'Refund issued'
        },
        {
            date: '2025-07-15',
            transactionId: 'TXN12345682',
            type: 'Fee Deduction',
            product: '0',
            status: 'Completed',
            orderId: '-',
            amount: '₹5,499',
            description: 'Payment received'
        },
        {
            date: '2025-07-15',
            transactionId: 'TXN12345683',
            type: 'Payout',
            product: '-',
            status: 'Completed',
            orderId: 'ORD890123',
            amount: '₹8,499',
            description: 'Vendor payout'
        },
        {
            date: '2025-07-13',
            transactionId: 'TXN12345684',
            type: 'Fee Deduction',
            product: '-',
            status: 'Processing',
            orderId: 'ORD890123',
            amount: '₹5,499',
            description: 'Payment received'
        },
        {
            date: '2025-07-13',
            transactionId: 'TXN12345686',
            type: 'Sale',
            product: 'Car Cleaning Kit',
            status: 'Processing',
            orderId: 'ORD890123',
            amount: '₹3,499',
            description: 'Product returned'
        },
        {
            date: '2025-07-13',
            transactionId: 'TXN12345687',
            type: 'Refund',
            product: 'XXR Model 575 Alloy Wheel',
            status: 'Processing',
            orderId: 'ORD890123',
            amount: '₹5,499',
            description: 'Weekly vendor'
        },
        {
            date: '2025-07-13',
            transactionId: 'TXN12345688',
            type: 'Payout',
            product: '-',
            status: 'Processing',
            orderId: 'ORD890123',
            amount: '₹3,499',
            description: 'Product returned'
        }
    ];

    const [transactionData, setTransactionData] = useState(originalTransactionData);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [statusFilter, setStatusFilter] = useState('All'); // New state for filter

    // Function to filter data based on status
    const getFilteredData = () => {
        if (statusFilter === 'All') {
            return transactionData;
        }
        return transactionData.filter(transaction => transaction.status === statusFilter);
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const selectedStatus = e.target.value;
        setStatusFilter(selectedStatus);

        // Reset sort config when filter changes
        setSortConfig({ key: null, direction: 'asc' });

        // Apply filter to the original data
        if (selectedStatus === 'All') {
            setTransactionData(originalTransactionData);
        } else {
            const filteredData = originalTransactionData.filter(
                transaction => transaction.status === selectedStatus
            );
            setTransactionData(filteredData);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const sortedData = [...transactionData].sort((a, b) => {
            if (key === 'date') {
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);
                return direction === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const valueA = a[key].toLowerCase();
                const valueB = b[key].toLowerCase();
                if (direction === 'asc') {
                    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                } else {
                    return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                }
            }
        });

        setTransactionData(sortedData);
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return (
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            );
        }

        if (sortConfig.direction === 'asc') {
            return (
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                </svg>
            );
        } else {
            return (
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
                </svg>
            );
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium inline-flex items-center";

        switch (status) {
            case 'Completed':
                return `${baseClasses} bg-green-100 text-green-700`;
            case 'Settled':
                return `${baseClasses} bg-green-100 text-green-700`;
            case 'Processing':
                return `${baseClasses} bg-red-100 text-red-700`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-700`;
        }
    };

    return (
        <div className='bg-[#ECECF0] px-6 py-10 rounded-2xl'>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h1 className="text-[#232832] text-2xl font-semibold">Payments & Earnings</h1>
                <div className="flex gap-3">
                    <select
                        className="w-full md:w-auto border border-[#5737B] rounded-md px-5 text-[15px] font-medium py-[2px] text-[#5737B3] focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
                        value={statusFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="All">All</option>
                        <option value="Completed">Completed</option>
                        <option value="Settled">Settled</option>
                        <option value="Processing">Processing</option>
                    </select>
                    <button className="bg-[#5737B4] hover:bg-[#432d9c] text-white px-6 py-2 rounded">Print Invoice</button>
                </div>
            </div>

            {/* Charts Section - Always uses original data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 bg-white my-6 w-full p-1 border border-[#D8D8D8] rounded-2xl shadow-lg">
                <div className="lg:col-span-2 w-full">
                    <SalesTrends />
                </div>
                <div className="flex flex-col w-full lg:col-span-1">
                    <div className="text-black w-full">
                        <TotalProfitCard />
                    </div>
                    <hr className='border border-[#D8D8D8]' />
                    <div className="w-full">
                        <RefundReturnStats />
                    </div>
                </div>
            </div>

            {/* Transaction History Table */}
            <div className='min-w-full bg-white rounded-lg shadow text-sm'>
                <div className='flex justify-between items-center p-4  border-gray-100'>
                    <h1 className='text-[#232832] text-xl font-medium'>
                        Transaction History
                        {statusFilter !== 'All' && (
                            <span className="text-sm text-gray-500 ml-2">
                                ({statusFilter} - {transactionData.length} transactions)
                            </span>
                        )}
                    </h1>
                    <p className='text-[#5737B4] text-[17px] font-medium cursor-pointer hover:text-[#432d9c]'>Download History</p>
                </div>
                <div className="overflow-x-auto  max-h-100 scrollbar-none px-5 py-2">
                    <table className="w-full ">
                        <thead>
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                                    <button
                                        className="flex items-center gap-2 hover:text-gray-900 focus:outline-none"
                                        onClick={() => handleSort('date')}
                                    >
                                        Date
                                        {getSortIcon('date')}
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Transaction ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Product</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Order ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Amount (INR)</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionData.length > 0 ? (
                                transactionData.map((transaction, index) => (
                                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-25">
                                        <td className="py-3 px-4 text-gray-700">{transaction.date}</td>
                                        <td className="py-3 px-4 text-gray-700">{transaction.transactionId}</td>
                                        <td className="py-3 px-4 text-gray-700">{transaction.type}</td>
                                        <td className="py-3 px-4 text-gray-700">{transaction.product}</td>
                                        <td className="py-3 px-4">
                                            <span className={getStatusBadge(transaction.status)}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">{transaction.orderId}</td>
                                        <td className="py-3 px-4 text-gray-700 font-medium">{transaction.amount}</td>
                                        <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                                        No transactions found for the selected filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsEarnings;