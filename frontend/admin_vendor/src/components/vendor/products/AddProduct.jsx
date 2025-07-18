import React, { useState } from "react";
import { SlCloudUpload } from "react-icons/sl";
import { GoPlus } from "react-icons/go";

const AddProduct = () => {
    const [isActive, setIsActive] = useState()
    return (
        <div className="bg-[#ECECF0] px-6 py-10 rounded-2xl">
            <div className="flex justify-end items-end gap-4 my-4">
                {/* Toggle with label */}
                <div className="flex items-center gap-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Product Active</span>
                        <div
                            onClick={() => setIsActive(!isActive)}
                            className={`w-14 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? "bg-[#5737B4]" : "bg-gray-300"}`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? "translate-x-8" : "translate-x-0"}`}
                            />
                        </div>
                    </div>

                    {/* Bulk Upload Button */}
                    <button className="px-4 py-1.5 text-sm font-medium text-[#5737B4] border border-[#5737B4] rounded hover:bg-[#5737B4] hover:text-white transition">
                        Bulk Upload
                    </button>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-6 flex-1">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                        <div className="flex flex-col">
                            <label className="font-medium">Product Name</label>
                            <input
                                type="text"
                                className="border rounded px-4 py-2 mt-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-medium">Description</label>
                            <textarea
                                className="border rounded px-4 py-2 mt-1"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Price</h2>
                        <div className="flex gap-4 flex-col sm:flex-row">
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Minimum Quantity</label>
                                <input
                                    type="number"
                                    className="border rounded px-4 py-2 mt-1"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Unit Price</label>
                                <input
                                    type="number"
                                    className="border rounded px-4 py-2 mt-1"
                                    placeholder="₹"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Others */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Others</h2>
                        <div className="flex gap-4 flex-col sm:flex-row">
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Sizes Available</label>
                                <input
                                    type="text"
                                    className="border rounded px-4 py-2 mt-1"
                                    placeholder="S, M, L..."
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Manufacturing Date</label>
                                <input
                                    type="date"
                                    className="border rounded px-4 py-2 mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-medium">Product Category</label>
                            <input
                                type="text"
                                className="border rounded px-4 py-2 mt-1"
                                placeholder="Eg. Accessories"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Available Stock</h2>
                        <span>Stock Number</span>
                        <input
                            type="text"
                            className="border rounded px-4 py-2 w-full"
                        />
                    </div>

                    {/* Submit Button */}
                    
                </div>

                {/* Right Column - Images & Tags */}
                <div className="flex flex-col gap-6 w-full lg:w-[35%]">
                    {/* Product Images */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-4">Product Images</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                "Main Image",
                                "Close View",
                                "Other Image 1",
                                "Other Image 2",
                                "Other Image 3",
                                "Other Image 4",
                            ].map((label, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    {/* Label on top */}
                                    <label className="text-sm font-medium text-gray-700">{label}</label>

                                    {/* Upload box */}
                                    <label className="border-2 border-dashed border-gray-400 rounded-lg h-32 flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:bg-gray-50 transition">
                                        {/* <SlCloudUpload className="text-3xl text-gray-500 mb-1" /> */}
                                        <GoPlus className="text-3xl text-gray-500 mb-1" />

                                        <span className="text-sm text-gray-500">Drag and drop here</span>
                                        <span className="text-sm text-[#5737B4] font-semibold">Browse Files</span>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <span className="">Type and search</span>
                        <input
                            type="text"
                            className="border rounded px-4 py-2 w-full h-30 mt-2"

                        />
                    </div>
                </div>
                
            </div>
           <div className="flex justify-end gap-4 mt-10">
  {/* Cancel Button */}
  <button className="border border-[#5737B4] text-[#5737B4] px-6 py-2 rounded-md text-sm font-medium hover:bg-[#f1edff] transition">
    Cancel
  </button>

  {/* Save Button */}
  <button className="bg-[#5737B4] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#442f96] transition">
    Save Product
  </button>
</div>
        </div>
    );
};

export default AddProduct;
