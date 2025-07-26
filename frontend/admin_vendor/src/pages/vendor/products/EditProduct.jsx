import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import car from "../../../assets/car.jpeg";
import {
    updateField,
    updateTags,
    toggleActive,
    updateImage
} from "../../../store/productFormSlice";
import { updateProduct } from "../../../store/productSlice";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

export default function EditProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const formData = useSelector((state) => state.productForm);
    const [imagePreviews, setImagePreviews] = useState(Array(6).fill(null));
    const inputRefs = useRef([]);

    const [localFormData, setLocalFormData] = useState(formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData((prev) => ({ ...prev, [name]: value }));

    };
    const handleReplace = (index) => {
        inputRefs.current[index]?.click();
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];

        if (!file || !file.type.startsWith("image/")) {
            // Don't dispatch anything if no valid file selected
            return;
        }

        const updated = [...imagePreviews];
        updated[index] = URL.createObjectURL(file);
        setImagePreviews(updated);

        const keys = ["main", "close", "other1", "other2", "other3", "other4"];
        const key = keys[index];

        dispatch(updateImage({ key, file }));
    };


    const handleSave = () => {
        dispatch(updateProduct(localFormData));
        console.log("updated", localFormData)
        toast.success("Product Detail Updated Successffully")
        setTimeout(() => {
            navigate('/vendor/products');
        }, 3000);
    };

    const handleDelete = () => {
        // Assuming `formData.id` or `localFormData.id` exists
        // dispatch(deleteProduct(localFormData.id));
        toast.success("Product Removed  Successffully")
        setTimeout(() => {
            navigate('/vendor/products');
        }, 2000);
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
                <div className="sm:flex gap-2 tems-center">
                    <span className="text-md font-medium text-[#5737B4]">Product Active</span>
                    <div
                        onClick={() => dispatch(toggleActive())}
                        className={`w-12 h-7 sm:w-14 sm:h:7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.isActive ? "bg-[#5737B4]" : "bg-gray-300"}`}
                    >
                        <div
                            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${formData.isActive ? "lg:translate-x-7 sm:translate-x-7 translate-x-7" : "translate-x-0"}`}
                        />
                    </div>
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
                                <div key={i} className="flex flex-col gap-1 group">
                                    <label className="text-sm font-medium text-gray-700">Image {i + 1}</label>
                                    <div
                                        className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm cursor-pointer group"
                                    >
                                        {/* Image preview or placeholder */}
                                        {imagePreviews[i] ? (
                                            <img src={imagePreviews[i]} alt={`Preview ${i + 1}`} className="object-cover h-full w-full rounded-lg" />
                                        ) : (
                                            <span>No image</span>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center gap-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            {/* Replace Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleReplace(i)}
                                                className="flex flex-col items-center text-white"
                                            >
                                                <RiArrowLeftRightFill className="w-6 h-6 mb-1" />
                                                <span className="text-sm font-medium">Replace</span>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                // onClick={() => handleDelete(i)}
                                                className="flex flex-col items-center text-white"
                                            >
                                                <RxCross2 className="w-6 h-6 mb-1" />
                                                <span className="text-sm font-medium">Delete</span>
                                            </button>
                                        </div>

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={(el) => (inputRefs.current[i] = el)}
                                            onChange={(e) => handleFileChange(e, i)}
                                        />
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
