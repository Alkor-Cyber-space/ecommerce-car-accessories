import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { getUnverifiedVendorsApi } from '../../../services/allAPI';
import image from '../../../assets/user.jpg'

const NewVendorRequest = () => {
    const [unverifiedVendors, setUnverifiedVendors] = useState([])
    
    useEffect(() => {
        const fetchUnVerifiedVendors = async () => {
            try {
                const response = await getUnverifiedVendorsApi();
                console.log("Unverified vendors:", response);
                console.log(response);
                setUnverifiedVendors(response);
            } catch (error) {
                console.error("Error fetching unverified vendors:", error);
                // toast.error(error)
            }
        };
        fetchUnVerifiedVendors();
    }, []);

    return (
        <div className="bg-gray-100 px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
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
                {unverifiedVendors?.length > 0 && unverifiedVendors.map((vendor, index) => (
                    <div key={index} className="flex flex-col  ">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                {/* Vendor Icon */}
                                <div className="w-15 h-15 rounded-lg overflow-hidden border">
                                    <img
                                        src={vendor.vendor_profile?.logo || image}
                                        alt="vendor logo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Vendor Name and Submission Info */}
                                <div className='flex flex-col gap-1'>
                                    <div className='flex lg:items-center lg:flex-row lg:gap-15 md:flex-col '>
                                        <h2 className="text-xl font-semibold text-[#5737B4] mb-1 ml-4">
                                            <Link 
                                                to={`/admin/vendor-details/${vendor.id}`}
                                                onClick={() => localStorage.setItem("selected_vendor", JSON.stringify(vendor))}
                                            >
                                                {vendor.vendor_profile?.company_name || vendor?.username}
                                            </Link>
                                        </h2>
                                        <p className="text-gray-600 text-sm text-center ml-4">
                                            Submitted On : {new Date().toLocaleDateString()} , Time: {new Date().toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-14 text-sm space-y-1 ml-4">
                                        <p className="font-medium">Business Type: <span className='font-normal'>Automobile Spare Parts</span> </p>
                                        <p className="font-medium">Location: <span className='font-normal'> Mumbai, Maharashtra</span> </p>
                                        <p className="font-normal">Contact : <span className='font-normal'>{vendor.vendor_profile?.contact_name}, {vendor.vendor_profile?.contact_number}</span> </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Details */}
                        {/* <div className="flex gap-14 text-sm space-y-1 ">
                            <p className="font-medium">Business Type: <span className='font-normal'>Automobile Spare Parts</span> </p>
                            <p className="font-medium">Location: <span className='font-normal'> Mumbai, Maharashtra</span> </p>
                            <p className="font-normal">Contact : <span className='font-normal'>{vendor.vendor_profile?.contact_name}, {vendor.vendor_profile?.contact_number}</span> </p>
                        </div> */}
                    </div>
                ))}
            </div>
          
            {unverifiedVendors?.length === 0 && (
                <div className="text-center text-gray-500">
                    No vendor requests available.
                </div>
            )}
        </div>
    );
};

export default NewVendorRequest;

//   <div className="flex space-x-3">
//                                 <button className="px-6 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors">
//                                     Reject
//                                 </button>
//                                 <button className="px-6 py-2 bg-[#5737B4] text-white rounded-md hover:bg-[#5737B4]/80 transition-colors">
//                                     Approve
//                                 </button>
//                             </div>