import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ProductCatogery = () => {
    const [formData, setFormData] = useState({
        productName: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancel = () => {
        setFormData({
            productName: '',
        });
    };

    const handleCreateCategory = () => {
        console.log('Creating vehicle category:', formData);
        // Handle form submission logic here
    };

    return (
        <div className="bg-white rounded-lg">
            <div className="p-4">
                <h2 className="text-lg font-medium text-gray-700 mb-4">Product Category</h2>
                
                                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name
                                </label>
                                <input 
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                                    placeholder="Enter product name"
                                    value={formData.brandName}
                                    onChange={(e) => handleInputChange('productName', e.target.value)}
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
                                className="px-6 py-2 bg-[#5727B4] text-white rounded-md hover:bg-[#4a1f99] transition-colors"
                            >
                                Create Product Category
                            </button>
                        </div>
                    </div>
            </div>
    );
};

export default ProductCatogery;