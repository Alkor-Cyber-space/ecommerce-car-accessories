import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import car from "../../../assets/car.jpeg";
import {
    updateField,
    updateTags,
    resetForm,
} from "../../../store/productFormSlice";
import { updateProduct } from "../../../store/productSlice";

export default function EditProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const formData = useSelector((state) => state.productForm);

    const [localFormData, setLocalFormData] = useState(formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData((prev) => ({ ...prev, [name]: value }));
        console.log(setLocalFormData)
        
    };

    const handleSave = () => {
        dispatch(updateProduct(localFormData));
        console.log("updated", localFormData)
        
        navigate("/vendor/products");
    };

    const handleDelete = () => {
        // Assuming `formData.id` or `localFormData.id` exists
        // dispatch(deleteProduct(localFormData.id));
        navigate("/vendor/products");
    };

    const handleCancel = () => {
        dispatch(resetForm());
        navigate(`/vendor/products/${localFormData.id}/view`);
    };

    return (
        <div className="bg-[#ECECF0] min-h-screen">
            <div className="flex justify-between mb-3">
                <h1 className="text-2xl font-bold mb-6">
                    <Link to="/vendor/products" className="text-[#5737B4] hover:underline pr-3">
                        Product Management
                    </Link>
                    / Edit Product
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-6 flex-1">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                        <div>
                            <label className="font-medium">Product Name</label>
                            <input
                                name="name"
                                value={localFormData.name || "LumoBeam X9 LED Car Headlight – 6000K Cool White (H4, 60W) "}
                                onChange={handleChange}
                                type="text"
                                className="mt-1 border px-3 py-2 rounded-md w-full"
                            />
                        </div>
                        <div>
                            <label className="font-medium">Description</label>
                            <textarea
                                name="description"
                                value={localFormData.description || "Upgrade your night driving experience with the LumoBeam X9 LED Headlight. Designed for superior brightness and energy efficiency, it emits a crisp 6000K cool white beam for enhanced road visibility. With plug-and-play installation and durable waterproof housing, it's compatible with most cars using H4 sockets."}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 border px-3 py-2 rounded-md w-full"
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Price</h2>
                        <div className="flex gap-4 md:flex-col sm:flex-row">
                            <div className="flex-1">
                                <label className="font-medium">Minimum Quantity</label>
                                <input
                                    name="minQty"
                                    value={localFormData.minQty || "2"}
                                    onChange={handleChange}
                                    type="number"
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="font-medium">Unit Price</label>
                                <input
                                    name="price"
                                    value={localFormData.price || "5600"}
                                    onChange={handleChange}
                                    type="number"
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Others */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Others</h2>
                        <div className="flex gap-4 md:flex-col sm:flex-row">
                            <div className="flex-1">
                                <label className="font-medium">Sizes Available</label>
                                <input
                                    name="sizes"
                                    value={localFormData.sizes || "L"}
                                    onChange={handleChange}
                                    type="text"
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="font-medium">Manufacturing Date</label>
                                <input
                                    name="manufactureDate"
                                    value={localFormData.manufactureDate || "2024-12-01"}
                                    onChange={handleChange}
                                    type="date"
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-medium">Product Category</label>
                            <select
                                name="category"
                                value={localFormData.category || "Lighting & Electricals"}
                                onChange={handleChange}
                                className="mt-1 border px-3 py-2 rounded-md w-full"
                            >
                                <option value="">Select category</option>
                                <option value="Lighting & Electricals">Lighting & Electricals</option>
                                <option value="Exterior Accessories">Exterior Accessories</option>
                                <option value="Tools & Maintenance">Tools & Maintenance</option>
                            </select>
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Available Stock</h2>
                        <label className="text-sm font-medium">Stock Number</label>
                        <input
                            name="stock"
                            value={localFormData.stock || "h667h"}
                            onChange={handleChange}
                            type="text"
                            className="mt-1 border px-3 py-2 rounded-md w-full"
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 w-full lg:w-[45%]">
                    {/* Product Images */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-4">Product Images</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">Image {i + 1}</label>
                                    <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm cursor-pointer">
                                        <img src={car} alt="" className="object-cover h-full w-full rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <input
                            name="tags"
                            value={localFormData.tags?.join(", ") || "popular, featured, new"}
                            onChange={(e) =>
                                setLocalFormData({
                                    ...localFormData,
                                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                                })
                            }
                            placeholder="Comma-separated tags"
                            className="mt-1 border px-3 py-2 rounded-md w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex sm:flex-col md:flex-row justify-end gap-4">
                <button
                    className="border border-[#FF5A65] text-[#FF5A65] bg-[#FFDEE0] rounded-sm px-5 py-1"
                    onClick={handleDelete}
                >
                    Delete Product
                </button>

                <button
                    className="border border-[#5737B4] text-[#5737B4] rounded-sm px-10 py-1"
                    onClick={handleCancel}
                >
                    Cancel
                </button>

                <button
                    className="border bg-[#5737B4] text-white rounded-sm px-14 py-1"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
        </div>
    );
}
