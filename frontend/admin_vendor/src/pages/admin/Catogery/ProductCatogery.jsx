import React, { useState } from 'react';
import { productcategories } from '../../../services/allAPI';
import { toast } from 'react-toastify';

const ProductCategory = ({ onCategoryCreated }) => {
    const [categoryName, setCategoryName] = useState('');
    const [categoryImage, setCategoryImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setCategoryName('');
        setCategoryImage(null);
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Use FormData to send text + image
            const formData = new FormData();
            formData.append("name", categoryName);
            if (categoryImage) {
                formData.append("image", categoryImage);
            }

            const response = await productcategories(formData);
            console.log("Response:", response);

            toast.success('Product category created successfully!');

            if (onCategoryCreated) {
                onCategoryCreated(response);
            }

            setCategoryName('');
            setCategoryImage(null);
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error?.response?.data?.message || 'An error occurred while creating the category.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4">
                <h2 className="text-lg font-medium text-gray-700 mb-4">Product Category</h2>

                {/* Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product category
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4]"
                            placeholder="Enter product name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </div>

                    {/* Category Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCategoryImage(e.target.files[0])}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4]"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateCategory}
                        disabled={loading}
                        className={`px-6 py-2 bg-[#5727B4] text-white rounded-md transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4a1f99]'}`}
                    >
                        {loading ? 'Creating...' : 'Create Product Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCategory;
    