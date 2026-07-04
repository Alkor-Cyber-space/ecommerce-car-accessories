import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { getProductByIdApi, updateProductApi } from "../../../services/allAPI";
import { toast } from "react-toastify";

const ProductDetailView = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    const handleToggle = async () => {
        if (!product) return;
        const nextStatus = !(product.is_available ?? product.isActive);
        
        const form = new FormData();
        form.append("is_available", nextStatus ? "true" : "false");
        form.append("isActive", nextStatus ? "true" : "false");
        
        try {
            const response = await updateProductApi(id, form);
            if (response) {
                setProduct((prev) => ({
                    ...prev,
                    isActive: nextStatus,
                    is_available: nextStatus,
                }));
                toast.success(`Product status updated to ${nextStatus ? "Active" : "Inactive"}`);
            }
        } catch (err) {
            console.error("Error updating product status:", err);
            toast.error("Failed to update product status");
        }
    };


    const fetchProduct = async () => {
        try {
            const response = await getProductByIdApi(id);
            if (response.status === 200) {
                console.log(response.data);
                setProduct(response.data);
            }
        } catch (err) {
            console.error("Error fetching product:", err);
        }
    };

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const navigate = useNavigate();
    // allow editing only when availability is explicitly present (true/false)
    const canEdit = (typeof product?.is_available === 'boolean') || (typeof product?.isActive === 'boolean');
    if (!product) return <p>Loading product...</p>;

    return (
        <div className="bg-[#ECECF0] min-h-screen">
            <div className="flex justify-between mb-3">
                <h1 className="text-2xl font-bold mb-6">
                    <Link to="/vendor/products" className="text-[#5737B4] hover:underline pr-3">
                        Product Management
                    </Link>
                    / {product?.name || "Product Name"}
                </h1>

                <div className="flex md:flex-row lg:flex-row sm:flex-col gap-2 my-3 items-center">
                    <div className="sm:flex gap-2">
                        <span className="text-sm font-medium text-[#5737B4]">Product Active</span>
                        {
                            // prefer explicit is_available when present, otherwise fall back to isActive
                        }
                        <div
                            onClick={handleToggle}
                            className={`w-14 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${(product.is_available ?? product.isActive) ? "bg-[#5737B4]" : "bg-gray-300"
                                } cursor-pointer`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${(product.is_available ?? product.isActive) ? "translate-x-8" : "translate-x-0"
                                    }`}
                            />
                        </div>
                    </div>
                    <button
                        onClick={canEdit ? () => navigate("edit") : undefined}
                        className={`flex text-md font-medium items-center justify-between gap-2 rounded-md px-3 py-1 ${canEdit ? 'border border-[#5737B4] text-[#5737B4]' : 'border border-gray-300 text-gray-400 cursor-not-allowed opacity-60'}`}>
                        Edit Product <FiEdit3 />
                    </button>
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
                            <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">{product.name}</p>
                        </div>
                        <div>
                            <label className="font-medium">Description</label>
                            <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Price</h2>
                        <div className="flex gap-4 md:flex-col sm:flex-row">
                            <div className="flex-1">
                                <label className="font-medium">Unit Price</label>
                                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">₹{product.price}</p>
                            </div>
                            <div className="flex-1">
                                <label className="font-medium">Stock</label>
                                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">{product.stock}</p>
                            </div>
                        </div>
                    </div>

                    {/* Others */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow">
                        <h2 className="text-lg font-semibold">Others</h2>
                        <div className="flex gap-4 md:flex-col sm:flex-row">
                            <div className="flex-1">
                                {product.size ? (
                                    <>
                                        <label className="font-medium">Size</label>
                                        <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">{product.size}</p>
                                    </>
                                ) : null}
                            </div>
                            {/* Dimensions */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="font-medium">Length</label>
                                    <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">
                                        {product.length ? `${product.length} cm` : "N/A"}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-medium">Weight</label>
                                    <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">
                                        {product.weight ? `${product.weight} kg` : "N/A"}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-medium">Height</label>
                                    <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">
                                        {product.height ? `${product.height} cm` : "N/A"}
                                    </p>
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-medium">Breadth</label>
                                    <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">
                                        {product.breadth ? `${product.breadth} cm` : "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="font-medium">Manufacturing Date</label>
                                <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">{product.manufacturing_date}</p>
                            </div>
                        </div>
                        <div>
                            <label className="font-medium">Product Category</label>
                            <p className="mt-1 border px-2 py-2 text-[#7F7F7F] rounded-md">
                                {product.category?.name || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 w-full lg:w-[45%]">
                    {/* Product Images */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-4">Product Images</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {(product.image_list?.length ? product.image_list : []).concat(Array(6 - (product.image_list?.length || 0)).fill({ image: null }))
                                .map((img, index) => (
                                    <div key={index} className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">Image {index + 1}</label>
                                        <div className="relative h-32 w-full rounded-lg overflow-hidden border-dashed border-2 border-gray-400 bg-gray-100">
                                            {img?.image ? (
                                                <img
                                                    src={img.image}
                                                    alt={`Product ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                                    <span>No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(product.tag)
                                ? product.tag.map((tagItem, index) => (
                                    <span key={index} className="bg-gray-100 text-sm px-2 py-1 rounded">
                                        {tagItem}
                                    </span>
                                ))
                                : typeof product.tag === "string" && product.tag.trim() !== ""
                                    ? product.tag.split(",").map((tagItem, index) => (
                                        <span key={index} className="bg-gray-100 text-sm px-2 py-1 rounded">
                                            {tagItem.trim()}
                                        </span>
                                    ))
                                    : (
                                        <span className="text-gray-500 text-sm">No tags available</span>
                                    )
                            }
                        </div>
                    </div>
                    {/* Compatible Variant Years */}
                    <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Compatible Variant Years</h2>
                        {product.compatible_varient_year && product.compatible_varient_year.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.compatible_varient_year.map((variant) => (
                                    <span
                                        key={variant.id}
                                        className="border px-3 py-2 rounded-md text-gray-700 bg-gray-50"
                                    >
                                        {variant.make} {variant.model} {variant.variant} ({variant.year})
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No compatible years</p>
                        )}
                    </div>


                </div>
            </div>

            <div className="mt-5 pl-2">
                <button
                    className="border border-[#5737B4] rounded-md text-[#5737B4] px-4 py-1 text-lg font-semibold"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>
            <Outlet />
        </div>
    );
};

export default ProductDetailView;
