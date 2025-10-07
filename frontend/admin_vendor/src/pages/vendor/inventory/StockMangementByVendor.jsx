import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaBell, FaSyncAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { getProductsApi, updateStockApi } from "../../../services/allAPI";

Modal.setAppElement("#root");

export default function VendorStockTable() {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const statusColor = {
        "In Stock": "bg-green-100 text-green-700",
        "Low Stock": "bg-yellow-100 text-yellow-700",
        "Out of Stock": "bg-red-100 text-red-700",
    };

    const stockOrder = {
        "Out of Stock": 1,
        "Low Stock": 2,
        "In Stock": 3,
    };

    // Helper function to map API products to table data
    const mapProducts = (products) => {
        return products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category?.name || "Uncategorized",
            carModel: p.compatible_varient_year
                ?.map((v) => `${v.make} ${v.model}`)
                .join(", ") || "N/A",
            stock: p.stock,
            status:
                p.stock === 0
                    ? "Out of Stock"
                    : p.stock < 15
                        ? "Low Stock"
                        : "In Stock",
            lastRestocked: p.updated_at?.split("T")[0] || "N/A",
            unitPrice: Number(p.price) || 0,
            price: Number(p.price) || 0,
            image:
                p.image_list?.[0]?.image || "/img/default.jpg", // first image fallback
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const products = await getProductsApi();
                setData(mapProducts(products));
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to fetch products!");
            }
        };

        fetchData();
    }, []);

    const filteredData = data
        .filter((item) => {
            return (
                item.name.toLowerCase().includes(search.toLowerCase()) &&
                (category === "All" || item.category === category) &&
                (status === "All" || item.status === status)
            );
        })
        .sort((a, b) => stockOrder[a.status] - stockOrder[b.status]);

    const openModal = (item) => {
        setSelectedProduct({ ...item });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSave = async () => {
        if (!selectedProduct) return;

        try {
            // Call the API to update stock
            await updateStockApi(selectedProduct.id, selectedProduct.stock);

            // Refetch data to ensure consistency (including updated status, lastRestocked, etc.)
            const products = await getProductsApi();
            setData(mapProducts(products));

            toast.success("Product updated successfully!");
            closeModal();
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update product!");
        }
    };

    return (
        <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-[#232832] text-xl font-bold">Stock Overview</h1>
                <div className="flex items-center gap-4">
                    <FaSyncAlt
                        className="text-xl text-[#5737B4] cursor-pointer"
                        onClick={() => window.location.reload()} // manual refresh
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Search product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border rounded w-full"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-2 border rounded w-full"
                >
                    <option value="All">Categories</option>
                    <option value="Engine">Engine</option>
                    <option value="Brakes">Brakes</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="p-2 border rounded w-full"
                >
                    <option value="All">Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-md text-sm shadow">
                    <thead className="text-gray-600">
                        <tr>
                            <th className="py-4 px-2">Image</th>
                            <th className="py-4 px-2">Product</th>
                            <th className="py-4 px-2">Category</th>
                            <th className="py-4 px-2">Car Model</th>
                            <th className="py-4 px-2">Stock</th>
                            <th className="py-4 px-2">Status</th>
                            <th className="py-4 px-2">Unit Price</th>
                            <th className="py-4 px-2">Price</th>
                            <th className="py-4 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id} className="text-center hover:bg-gray-50">
                                <td className="py-2 px-2">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 rounded"
                                    />
                                </td>
                                <td className="py-2 px-2">
                                    <div className="font-semibold">{item.name}</div>
                                </td>
                                <td className="py-2 px-2">{item.category}</td>
                                <td className="py-2 px-2">{item.carModel}</td>

                                <td className="py-2 px-2">{item.stock}</td>
                                <td className="py-2 px-2">
                                    <span
                                        className={`px-2 py-1 text-xs rounded ${statusColor[item.status]
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-2 px-2">{item.unitPrice}</td>
                                <td className="py-2 px-2">{item.stock * item.unitPrice}</td>

                                <td className="py-2 px-2">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="bg-[#5737B4] text-white px-3 py-1 rounded text-xs hover:bg-[#4A148C] transition-colors"
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* If no data */}
                {filteredData.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No products found</p>
                )}
            </div>
            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onRequestClose={closeModal}
                className="bg-white max-w-lg p-6 mx-auto mt-40 rounded shadow outline-none "
                overlayClassName="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 bg-opacity-1930 "
            >
                <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                {selectedProduct && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Product Name</label>
                            <input
                                className="w-full border px-3 py-2 rounded mt-1"
                                value={selectedProduct.name}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Stock</label>
                            <input
                                className="w-full border px-3 py-2 rounded mt-1"
                                type="number"
                                value={selectedProduct.stock}
                                onChange={(e) =>
                                    setSelectedProduct({
                                        ...selectedProduct,
                                        stock: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-[#232832] text-white px-4 py-2 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { handleSave(); closeModal(); }}
                                className="bg-[#5737B4] text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <ToastContainer position="bottom-right" />
        </div>
    );
}