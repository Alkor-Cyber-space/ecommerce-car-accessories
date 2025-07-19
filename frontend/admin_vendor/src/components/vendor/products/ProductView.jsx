import React from "react";
import { GoPlus } from "react-icons/go";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

export default function ProductView({ product }) {
  return (
    <div className="p-4 bg-[#ECECF0] min-h-screen">
      <h1 className="text-2xl font-semibold text-[#232832] mb-6">
        Product Management / {product?.name || "Product Name"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div>
              <label className="font-medium">Product Name</label>
              <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">LumoBeam X9 LED Car Headlight – 6000K Cool White (H4, 60W) </p>
            </div>
            <div>
              <label className="font-medium">Description</label>
              <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md whitespace-pre-wrap">Upgrade your night driving experience with the LumoBeam X9 LED Headlight. Designed for superior brightness and energy efficiency, it emits a crisp 6000K cool white beam for enhanced road visibility. With plug-and-play installation and durable waterproof housing, it's compatible with most cars using H4 sockets.</p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow">
            <h2 className="text-lg font-semibold">Price</h2>
            <div className="flex gap-4 md:flex-col sm:flex-row">
              <div className="flex-1">
                <label className="font-medium">Minimum Quantity</label>
                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">2</p>
              </div>
              <div className="flex-1">
                <label className="font-medium">Unit Price</label>
                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">₹5300</p>
              </div>
            </div>
          </div>

          {/* Others */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow">
            <h2 className="text-lg font-semibold">Others</h2>
            <div className="flex gap-4 md:flex-col sm:flex-row">
              <div className="flex-1">
                <label className="font-medium">Sizes Available</label>
                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">L</p>
              </div>
              <div className="flex-1">
                <label className="font-medium">Manufacturing Date</label>
                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">8th September 2024</p>
              </div>
            </div>
            <div>
              <label className="font-medium">Product Category</label>
              <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">Lighting & Electricals</p>
            </div>
          </div>

          {/* Stock */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Available Stock</h2>
            <label className="text-sm font-medium">Stock Number</label>
            <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">ty676yu</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 w-full lg:w-[35%]">
          {/* Product Images */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Product Images</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* {product.images?.map((url, i) => (
                <div key={i} className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={url}
                    alt={`Product ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))} */}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {/* {product.tags?.map((tag, idx) => (
                <span key={idx} className="bg-[#5737B4] text-white px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
