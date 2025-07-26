import React from "react";
import { GoPlus } from "react-icons/go";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { toggleActive } from "../../../store/productFormSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import car from '../../../assets/car.jpeg'

export default function ProductDetailView({ product }) {
    const dispatch = useDispatch();
    const formData = useSelector((state) => state.productForm);
    const navigate = useNavigate()


    return (
        <div className=" bg-[#ECECF0] min-h-screen">
            <div className="flex justify-between mb-3">
                <h1 className="text-2xl font-bold mb-6 ">
                    <Link to="/vendor/products" className="text-[#5737B4] hover:underline pr-3">
                        Product Management
                    </Link>
                    / {product?.name || "Product Name"}
                </h1>
                <div className="flex md:flex-row lg:flex-row sm:flex-col gap-2 my-3 items-center">
                    <div className="sm:flex gap-2">
                        <span className="text-sm font-medium text-[#5737B4]">Product Active</span>
                        <div
                            onClick={() => dispatch(toggleActive())}
                            className={`w-14 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.isActive ? "bg-[#5737B4]" : "bg-gray-300"}`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${formData.isActive ? "translate-x-8" : "translate-x-0"}`}
                            />
                        </div>
                    </div>
                    <button 
                    onClick={()=> navigate('edit')}
                    className="flex items-center justify-between gap-2 border border-[#5737B4] text-[#5737B4] rounded-md  px-3 py-1">Edit Product  <FiEdit3 /></button>
                </div>

            </div>
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
                    <div className="bg-white  rounded-xl p-6 space-y-4 shadow">
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
                <div className="flex flex-col gap-6 w-full lg:w-[45%]">
                    {/* Product Images */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-4">Product Images</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Main Image", key: "main" },
                                { label: "Close View", key: "close" },
                                { label: "Other Image 1", key: "other1" },
                                { label: "Other Image 2", key: "other2" },
                                { label: "Other Image 3", key: "other3" },
                                { label: "Other Image 4", key: "other4" },
                            ].map((img, index) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">{img.label}</label>
                                    <div className="relative h-32 w-full rounded-lg overflow-hidden border-dashed border-2 border-gray-400 bg-gray-100">
                                        {product?.images?.[img.key] ? (
                                            <img
                                                src={product.images[img.key]}
                                                alt={img.label}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                                <img src={car} alt="" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

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
                            {["Car", "Lights", "Exterior", "X9"].map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center gap-1 bg-[#ECECF0] text-[#505050] text-lg font-medium px-2 py-1"
                                >
                                    {tag}
                                </span>
                            ))
                            }
                            {/* {product.tags?.map((tag, idx) => (
                <span key={idx} className="bg-[#5737B4] text-white px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))} */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-5 pl-2">
                <button className="border border-[#5737B4] rounded-md text-[#5737B4] w-50 text-lg font-semibold">Back</button>
            </div>
        </div>
    );
}
