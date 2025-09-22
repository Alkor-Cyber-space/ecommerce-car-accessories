import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaRegTrashAlt } from 'react-icons/fa';
import { deleteCouponsApi } from '../../services/allAPI';

const CouponCard = ({ coupon, onSelect, isModal = false, onClose, onDelete }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: coupon.name || "",
        code: coupon.code || "",
        min_purchase_amount: coupon.min_purchase_amount || "",
        discount_value: coupon.discount_value || 0,
        applicable_category: coupon.applicable_category || [],
        applicable_product: coupon.applicable_product || [],
        end_date: coupon.end_date || ""
    });
    const handleCouponDelete = async () => {
        try {
            await deleteCouponsApi(coupon.id);
            console.log("Coupon deleted:", coupon.id);
            if (onDelete) onDelete(coupon.id);
            setIsDeleteConfirmOpen(false);
        } catch (error) {
            console.error("Failed to delete coupon:", error);
            alert("Failed to delete coupon. Please try again.");
        }
    };

    if (!coupon) return null;

    if (!isModal) {
        return (
            <>
                <div
                    onClick={onSelect}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow cursor-pointer group border border-gray-100 hover:border-[#5737B4] duration-200 relative"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-[#5737B4] text-white p-3 rounded-lg flex items-center justify-center group-hover:bg-[#6d4aff] transition-colors shadow">
                            <ShoppingCart size={22} />
                        </div>
                        <button
                            className="text-red-700 p-2 rounded-lg flex items-center justify-center hover:text-red-700 transition-colors shadow"
                            title="Delete coupon"
                            tabIndex={0}
                            onClick={e => {
                                e.stopPropagation();
                                setIsDeleteConfirmOpen(true);
                            }}
                        >
                            <FaRegTrashAlt size={23} />
                        </button>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{coupon.name}</h3>
                    <p className="text-md font-extrabold text-[#5737B4] mb-1">{coupon.discount_value}% OFF</p>
                    <p className="text-md text-gray-900 mb-3">Code: <span className="font-semibold text-gray-800">{coupon.code}</span></p>
                    <p className="text-md text-gray-900 mb-2">Min. purchase: <span className="font-semibold text-gray-700">₹{coupon.min_purchase_amount}</span></p>
                    <div className="flex items-center gap-2 text-md text-gray-400">
                        <span className="text-gray-900">Expires:</span>
                        <span className="font-medium text-gray-700">{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                    {(coupon.applicable_category?.length > 0 || coupon.applicable_product?.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {coupon.applicable_category?.map(cat => (
                                <span key={cat} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{cat}</span>
                            ))}
                            {coupon.applicable_product?.map(prod => (
                                <span key={prod} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{prod}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom Delete Confirmation Modal */}
                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
                            <h4 className="text-xl font-semibold text-gray-800">Confirm Delete</h4>
                            <p className="text-gray-600">Are you sure you want to delete the coupon <strong>{coupon.name}</strong> (Code: <strong>{coupon.code}</strong>)? This action cannot be undone.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCouponDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
};

export default CouponCard;
