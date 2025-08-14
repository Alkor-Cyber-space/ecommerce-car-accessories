import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const NewVendorRequest = () => {
    return (
        <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    <span className="text-[#5737B4]">
                        <Link to="/admin/vendors">Vendor</Link>
                    </span>{" "}
                    / View Vendor Requests
                </h1>

                {/* Dropdown */}
                <div className="relative">
                    <button className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 min-w-[100px]">
                        <span>All</span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Vendor Request Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Vendor Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        {/* Vendor Icon */}
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                            <div className="w-8 h-8 bg-white rounded opacity-20"></div>
                        </div>

                        {/* Vendor Name and Submission Info */}
                        <div className='flex gap-16'>
                            <h2 className="text-xl font-semibold text-[#5737B4] mb-1"><Link to='/admin/user-details'>Speedy Auto Parts</Link></h2>
                            <p className="text-gray-600 text-sm text-center">
                                Submitted On : 20 May 2025 , Time : 3.30 PM
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button className="px-6 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors">
                            Reject
                        </button>
                        <button className="px-6 py-2 bg-[#5737B4] text-white rounded-md hover:bg-[#5737B4]/80 transition-colors">
                            Approve
                        </button>
                    </div>
                </div>

                {/* Vendor Details */}
                <div className="flex gap-14 text-sm space-y-1">
                    <p className="font-medium">Business Type: <span className='font-normal'>Automobile Spare Parts</span> </p>
                    <p className="font-medium">Location: <span className='font-normal'> Mumbai, Maharashtra</span> </p>
                    <p className="font-medium">Contact : <span className='font-normal'>speedyautoparts, +91-9876543210</span> </p>
                </div>
            </div>
        </div>
    );
};

export default NewVendorRequest;