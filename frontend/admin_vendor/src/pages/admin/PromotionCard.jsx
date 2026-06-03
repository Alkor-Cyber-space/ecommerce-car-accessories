import React, { useEffect, useState, Fragment } from 'react';
import { ShoppingCart } from 'lucide-react';
import { deletePromotionApi, editPromotionApi, getCategoriesByAll, getProductsByCategory } from '../../services/allAPI';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaRegTrashAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper functions — define or import these appropriately
const formatDiscount = (promotion) => {
    if (promotion.promotion_type === 'BOGO') {
        return 'Buy One Get One Free';
    }
    return `${promotion.value} OFF`;
};
const getProductCount = (promotion) =>
    promotion.applicable_product ? promotion.applicable_product.length : 0;

const PromotionCard = ({
    promotion,
    onSelect,
    isModal = false,
    onClose,
    allCategories = [],
    allProducts = [],
    onDelete,
    fetchPromotions,
    onUpdate
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: promotion.name,
        code: promotion.code,
        description: promotion.description,
        value: promotion.value,
        applicable_category: promotion.applicable_category.map(cat => cat.id),
        applicable_product: promotion.applicable_product.map(prod => prod.id),
        start_date: promotion.start_date,
        end_date: promotion.end_date
    });

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const [selectedCategory, setSelectedCategory] = useState(
        promotion?.applicable_category?.[0] || ""
    );
    const [selectedProducts, setSelectedProducts] = useState(
        promotion?.applicable_product || []
    );

    // Helper function
    const formatForDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const pad = (num) => num.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const [formRows, setFormRows] = useState([]);

    useEffect(() => {
        if (promotion && allProducts.length > 0) {
            const rows = promotion.applicable_category.map(catId => ({
                category: catId,
                productsList: allProducts.filter(
                    prod =>
                        promotion.applicable_product.includes(prod.id) &&
                        prod.category_id === catId
                ),
                products: promotion.applicable_product.filter(prodId => {
                    const product = allProducts.find(
                        p => Number(p.id) === Number(prodId)
                    );
                    return product && product.category_id === catId;
                }),
                min_price: 0,
                max_price: 2000
            }));
            setFormRows(rows);
        }
    }, [promotion, allProducts]);



    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesByAll()
                setCategories(response.data);
                console.log(response.data);

            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Add a new row
    const addRow = () => {
        setFormRows([...formRows, { category: "", productsList: [], products: [], min_price: 0, max_price: 2000 }]);
    };

    // Delete a row
    const deleteRow = (index) => {
        const updatedRows = [...formRows];
        updatedRows.splice(index, 1);
        setFormRows(updatedRows);
    };
    const handleRowChange = (index, key, value) => {
        const updatedRows = [...formRows];
        updatedRows[index][key] = value;
        setFormRows(updatedRows);
    };

    const handleCheckboxChange = (listType, id) => {
        setEditFormData(prev => {
            const list = prev[listType];
            const updatedList = list.includes(id)
                ? list.filter(item => item !== id)
                : [...list, id];
            return { ...prev, [listType]: updatedList };
        });
    };
    const handleSave = async () => {
        try {
            const applicable_category = formRows
                .map(row => row.category)
                .filter(catId => catId);

            const applicable_product = formRows
                .flatMap(row => row.products)
                .filter(prodId => prodId);

            const updatedData = {
                ...editFormData,
                applicable_category,
                applicable_product,
            };

            const response = await editPromotionApi(promotion.id, updatedData);

            if (response) {
                toast.success("Promotion updated successfully!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored"
                });

                if (fetchPromotions) {
                    await fetchPromotions();
                }
                if (onUpdate) {
                    onUpdate(response.data);
                }
                setIsEditModalOpen(false);
                onClose();
            }
        } catch (error) {
            console.error("Error updating promotion:", error.response || error);
            toast.error("Failed to update promotion", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored"
            });
        }
    };



    const handlePromotionDelete = async () => {
        try {
            await deletePromotionApi(promotion.id);
            console.log("promotion deleted:", promotion.id);

            if (onDelete) onDelete(promotion.id);
            setIsDeleteConfirmationOpen(false);
            if (onClose) onClose();
        } catch (error) {
            console.error("Failed to delete promotion:", error);
            alert("Failed to delete promotion. Please try again.");
        }
    };

    if (!isModal) {
        return (
            <div className="relative">
                <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                <div
                    onClick={() => !isDeleteConfirmationOpen && onSelect()}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >

                    <div className='flex justify-between items-center mb-4'>
                        <div className="bg-[#5737B4] text-white p-3 rounded-lg w-fit mb-4">
                            <ShoppingCart size={20} />
                        </div>
                        <button
                            className="text-red-700 p-2 rounded-lg flex items-center justify-center hover:text-red-700 transition-colors shadow cursor-pointer"
                            title="Delete promotion"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();  // Prevent triggering onSelect
                                setIsDeleteConfirmationOpen(true);  // Open delete modal only
                            }}
                        >
                            <FaRegTrashAlt size={23} />
                        </button>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{promotion.name}</h3>
                    <p className="text-2xl font-bold text-gray-800 mb-2">{formatDiscount(promotion)}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>
                            {promotion.applicable_category && promotion.applicable_category.length > 0
                                ? promotion.applicable_category[0].name
                                : "No category"}
                        </span>
                        <span>{getProductCount(promotion)} items</span>
                    </div>
                    {isDeleteConfirmationOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
                            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
                                <h4 className="text-xl font-semibold text-gray-800">Confirm Delete</h4>
                                <p className="text-gray-600">
                                    Are you sure you want to delete the promotion <strong>{promotion.name}</strong>? This action cannot be undone.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setIsDeleteConfirmationOpen(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePromotionDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Fragment>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="fixed inset-0 bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-[#5737B4] p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-white opacity-10"></div>
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10"
                            onClick={onClose}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative flex items-center">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{promotion.name}</h3>
                                <p className="text-blue-100 text-sm">Promotional Campaign Details</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Code
                            </h4>
                            <p className="text-gray-600 leading-relaxed">{promotion.code || "No description available"}</p>
                        </div>
                        {/* Description */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Description
                            </h4>
                            <p className="text-gray-600 leading-relaxed">{promotion.description || "No description available"}</p>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Discount</p>
                                        <p className="text-lg font-bold text-green-800">{formatDiscount(promotion)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">Value</p>
                                        <p className="text-lg font-bold text-orange-800">₹{promotion.value}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Campaign Duration
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Start Date</p>
                                    <p className="text-gray-800 font-semibold">{formatDate(promotion.start_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">End Date</p>
                                    <p className="text-gray-800 font-semibold">{formatDate(promotion.end_date)}</p>
                                </div>
                            </div>
                        </div>
                        {/* Categories */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Categories
                            </h4>
                            <div className="p-4 bg-white rounded-xl border border-gray-200 max-h-32 overflow-y-auto">
                                {promotion.applicable_category && promotion.applicable_category.length > 0 ? (
                                    promotion.applicable_category.map((catId, idx) => {
                                        const category = allCategories.find(cat => cat.id === catId);
                                        return (
                                            <div key={catId || `cat-${idx}`} className="flex items-center py-1">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                                                <span className="text-gray-700">{category ? category.name : "Unknown category"}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 italic">No categories assigned</p>
                                )}
                            </div>

                        </div>

                        {/* Products */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Products
                            </h4>
                            <div className="p-4 bg-white rounded-xl border border-gray-200 max-h-32 overflow-y-auto">
                                {promotion.applicable_product?.length > 0 ? (
                                    promotion.applicable_product.map((prodId, idx) => {
                                        const product = allProducts.find(p => Number(p.id) === Number(prodId));
                                        return (
                                            <div key={idx} className="flex items-center py-1">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                                                <span className="text-gray-700">
                                                    {product?.name || `Unknown product`}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 italic">No products assigned</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            className="px-6 py-2.5 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            className="px-6 py-2.5 bg-[#5737B4] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                            onClick={() => setIsEditModalOpen(true)}
                        >

                            Edit Promotion
                        </button>
                    </div>

                    {/* Edit Modal */}
                    {isEditModalOpen && (
                        <div className="fixed inset-0 flex justify-center items-center z-60 p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="bg-[#5737B4] p-6 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white opacity-10"></div>
                                    <button
                                        className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="relative z-10 flex items-center">

                                        <div>
                                            <h3 className="text-2xl font-bold">Edit Promotion</h3>
                                            <p className="text-blue-100 text-sm">Update your campaign details</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    {/* Name */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Name
                                        </h4>
                                        <input
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditChange}
                                            className="border rounded p-2 w-full"
                                            placeholder="Enter promotion name"
                                        />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Code
                                        </h4>
                                        <input
                                            name="code"
                                            value={editFormData.code}
                                            onChange={handleEditChange}
                                            className="border rounded p-2 w-full"
                                            placeholder="Enter promotion code"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Description
                                        </h4>
                                        <textarea
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditChange}
                                            className="border rounded p-2 w-full"
                                            placeholder="Enter description"
                                        />
                                    </div>

                                    {/* Value */}
                                    <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
                                        <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8" />
                                            </svg>
                                            Value
                                        </h4>
                                        <input
                                            name="value"
                                            type="number"
                                            value={editFormData.value}
                                            onChange={handleEditChange}
                                            className="border rounded p-2 w-full"
                                            placeholder="Enter value"
                                        />
                                    </div>

                                    {/* Dates */}
                                    <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Campaign Duration
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Start Date</p>
                                                <input
                                                    name="start_date"
                                                    type="datetime-local"
                                                    value={formatForDateTimeLocal(editFormData.start_date)}
                                                    onChange={handleEditChange}
                                                    className="border rounded p-2 w-full"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">End Date</p>
                                                <input
                                                    name="end_date"
                                                    type="datetime-local"
                                                    value={formatForDateTimeLocal(editFormData.end_date)}
                                                    onChange={handleEditChange}
                                                    className="border rounded p-2 w-full"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                    <div className="space-y-4 w-full">
                                        {formRows.map((row, index) => (
                                            <div key={index} className="flex gap-4 w-full items-start bg-white border border-gray-200 rounded-lg p-4">
                                                {/* Category */}
                                                <div className="flex-1 w-full">
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg">
                                                        <select
                                                            value={row.category || ""}
                                                            onChange={async (e) => {
                                                                const categoryId = Number(e.target.value);
                                                                handleRowChange(index, "category", categoryId);

                                                                // Prefill products for the selected category
                                                                try {
                                                                    const productsResp = await getProductsByCategory(categoryId);
                                                                    handleRowChange(index, "productsList", Array.isArray(productsResp) ? productsResp : []);
                                                                    // Preselect the products that were already in this category (if any)
                                                                    const preSelected = promotion.applicable_product.filter(prodId => {
                                                                        const prod = productsResp.find(p => p.id === prodId);
                                                                        return prod;
                                                                    });
                                                                    handleRowChange(index, "products", preSelected);
                                                                } catch (err) {
                                                                    console.error("Failed to load products for category", err);
                                                                    handleRowChange(index, "productsList", []);
                                                                    handleRowChange(index, "products", []);
                                                                }
                                                            }}
                                                            required
                                                            className="w-full p-3 bg-transparent focus:outline-none"
                                                        >
                                                            <option value="" disabled>Select Category</option>
                                                            {allCategories?.map((category) => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                    </div>
                                                </div>

                                                {/* Products */}
                                                <div className="flex-1 w-full">
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">Products</label>
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                                                        {Array.isArray(row.productsList) && row.productsList.length > 0 ? (
                                                            row.productsList.map((product) => (
                                                                <div key={product.id} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={row.products.includes(product.id)}
                                                                        onChange={(e) => {
                                                                            const checked = e.target.checked;
                                                                            const updatedProducts = checked
                                                                                ? [...row.products, product.id]
                                                                                : row.products.filter((id) => id !== product.id);
                                                                            handleRowChange(index, "products", updatedProducts);
                                                                        }}
                                                                        className="h-4 w-4 border-gray-300 rounded"
                                                                        style={{ accentColor: "#5737B4" }}
                                                                    />
                                                                    <label className="ml-2 text-sm text-gray-700">{product.name}</label>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-gray-500">Select a category to load products</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Delete Row */}
                                                <div className="flex flex-col justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteRow(index)}
                                                        className="text-red-500 hover:text-red-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                                                        title="Delete Row"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Another Row */}
                                        <div className="text-center w-full">
                                            <button
                                                type="button"
                                                onClick={addRow}
                                                className="flex items-center justify-center gap-2 bg-[#5737B4] text-white px-6 py-2 rounded-lg hover:bg-[#4A2B9F]"
                                            >
                                                <AiOutlinePlus /> Add Another Category
                                            </button>
                                        </div>
                                    </div>


                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        className="px-6 py-2.5 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-6 py-2.5 bg-[#5737B4] text-white rounded-lg font-medium hover:bg-[#5737B4] transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                                        onClick={handleSave}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Save Changes
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </Fragment>
    );
};

export default PromotionCard;