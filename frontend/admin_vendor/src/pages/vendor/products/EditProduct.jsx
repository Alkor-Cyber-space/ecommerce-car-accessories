import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import {
    toggleActive,
} from "../../../store/productFormSlice";
import { deleteProductApi, getCategoriesApi, getVariantYearsApi, updateProductApi } from "../../../services/allAPI";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { fetchProductById } from "../../../store/productSlice";

export default function EditProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const { productDetails, loading } = useSelector((state) => state.products);
    const [formData, setFormData] = useState({});
    const [productImages, setProductImages] = useState({});
    const [categories, setCategories] = useState([])
    const [varientYears, setVarientYears] = useState([]);

    const [imagePreviews, setImagePreviews] = useState(Array(6).fill(null));
    const inputRefs = useRef([]);

    // Fetch on mount
    useEffect(() => {
        dispatch(fetchProductById(id));
    }, [dispatch, id]);

    //  Sync fetched product to formData
    useEffect(() => {
        if (productDetails && productDetails.id) {
            setFormData({ ...productDetails });
            if (productDetails.image_list?.length) {
                const previews = Array(6).fill(null);
                productDetails.image_list.forEach((img, idx) => {
                    if (img.image && idx < 6) previews[idx] = img.image;
                });
                setImagePreviews(previews);
            }
            setFormData((prev) => ({
                ...prev,
                compatible_varient_year: productDetails.compatible_varient_year || [],
            }));
        }
    }, [productDetails]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoriesApi(); // this is already the parsed response data
                console.log("Fetched categories:", data);
                setCategories(data); // directly use it
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('An unexpected error occurred. Please try again.');
            }
        };

        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchVariantYears = async () => {
            try {
                const data = await getVariantYearsApi();
                console.log("Fetched variant years:", data);

                setVarientYears(data); // assuming it's an array
            } catch (error) {
                setVarientYears([]); // prevent crash
            }
        };

        fetchVariantYears();
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleReplace = (index) => {
        inputRefs.current[index]?.click();
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        // 1. Update image preview
        const previews = [...imagePreviews];
        previews[index] = URL.createObjectURL(file);
        setImagePreviews(previews);

        // 2. Update actual image file in productImages state
        const keys = ["main", "close", "other1", "other2", "other3", "other4"];
        const key = keys[index];
        setProductImages((prev) => ({
            ...prev,
            [key]: file,
        }));
    };


    const handleSave = async () => {
        const form = new FormData();

        // Add regular fields
        form.append("name", formData.name || "");
        form.append("description", formData.description || "");
        form.append("price", formData.price || "");
        form.append("stock", formData.stock || "");
        form.append("category_id", formData.category?.id || "");
        form.append("size", formData.size || "");
        form.append("manufacturing_date", formData.manufacturing_date || "");
        if (Array.isArray(formData.compatible_varient_year)) {
            formData.compatible_varient_year.forEach((id) => {
                form.append("compatible_varient_year", id);
            });
        }

        console.log("Sending files:");
        Object.values(productImages).forEach((file) => {
            if (file) {
                form.append("image_list", file);
                console.log(`Appending file: ${file.name}`);
            }
        });
        try {
            const response = await updateProductApi(id, form);
            console.log(response);

            toast.success("Product updated successfully!");
            navigate("/vendor/products");
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update product.");
        }
    };

    const handleDeleteConfirm = () => {
        confirmAlert({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this product?",
            buttons: [
                {
                    label: "Yes",
                    onClick: () => handleDelete(id)
                },
                {
                    label: "No"
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true
        });
    };

    const handleDelete = async (productId) => {
        try {
            const response = await deleteProductApi(productId);
            if (response.status === 204) {
                toast.success("Product deleted successfully!");
                setTimeout(() => {
                    navigate("/vendor/products");
                }, 1500);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product.");
        }
    };

    const handleCancel = () => {
        navigate(`/vendor/products/${formData.id}/view`);
    };

    return (
        <div className="bg-[#ECECF0] min-h-screen">
            <div className="flex justify-between mb-3">
                <h1 className="text-2xl font-semibold mb-6">
                    <Link to="/vendor/products" className="text-[#5737B4] hover:underline pr-3">
                        Product Management
                    </Link>
                    / Edit  {formData.name}
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
                                value={formData.name || "LumoBeam X9 LED Car Headlight – 6000K Cool White (H4, 60W) "}
                                onChange={handleChange}
                                type="text"
                                className="mt-1 border px-3 py-2 rounded-md w-full"
                            />
                        </div>
                        <div>
                            <label className="font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description || "Upgrade your night driving experience with the LumoBeam X9 LED Headlight. Designed for superior brightness and energy efficiency, it emits a crisp 6000K cool white beam for enhanced road visibility. With plug-and-play installation and durable waterproof housing, it's compatible with most cars using H4 sockets."}
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
                                <label className="text-sm font-medium">Stock Number</label>
                                <input
                                    name="stock"
                                    value={formData.stock || "h667h"}
                                    onChange={handleChange}
                                    type="text"
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="font-medium">Unit Price</label>
                                <input
                                    name="price"
                                    value={formData.price || "5600"}
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
                                    value={formData.size || ""}
                                    onChange={handleChange}
                                    type="text"
                                    className="mt-1 border px-3 py-2 rounded-md w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="font-medium">Manufacturing Date</label>
                                <input
                                    name="manufacturing_date"
                                    value={formData.manufacturing_date || ""}
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
                                value={formData.category?.id || ""}
                                onChange={(e) => {
                                    const selectedId = parseInt(e.target.value);
                                    const selectedName = e.target.options[e.target.selectedIndex].text;
                                    setFormData((prev) => ({
                                        ...prev,
                                        category: { id: selectedId, name: selectedName },
                                    }));
                                }}
                                className="mt-1 border px-3 py-2 rounded-md w-full"
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* varient year */}


                        {/* Enhanced Variant Year Multi-Select */}
                        <div className="bg-white rounded-xl p-6 shadow">
                            <h2 className="text-lg font-semibold mb-2">Compatible Variant Years</h2>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {Array.isArray(formData.compatible_varient_year) &&
                                    formData.compatible_varient_year.map((id) => {
                                        const year = varientYears.find((y) => y.id === parseInt(id));
                                        return (
                                            <span
                                                key={id}
                                                className="bg-[#5737B4] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {year?.id}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            compatible_varient_year: prev.compatible_varient_year.filter(
                                                                (y) => parseInt(y) !== parseInt(id)
                                                            ),
                                                        }));
                                                    }}
                                                    className="ml-1 text-white hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    })}
                            </div>

                            <select

                                value={formData.compatible_varient_year || []}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        compatible_varient_year: selected,
                                    }));
                                }}
                                className="border rounded px-4 py-2 w-full mt-1 "
                            >
                                {varientYears.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.id}
                                    </option>
                                ))}
                            </select>
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
                                            <span>Upload an image</span>
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
                            value={formData.tags?.join(", ") || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
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
                    onClick={handleDeleteConfirm}
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

