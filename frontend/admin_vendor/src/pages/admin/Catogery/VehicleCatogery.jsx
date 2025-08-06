import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const VehicleCategory = () => {
    const [formData, setFormData] = useState({
        brandName: '',
        modelName: '',
        year: '',
        type: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancel = () => {
        setFormData({
            brandName: '',
            modelName: '',
            year: '',
            type: ''
        });
    };

    const handleCreateCategory = () => {
        console.log('Creating vehicle category:', formData);
        // Handle form submission logic here
    };

    return (
        <div className="bg-white rounded-lg">
            <div className="p-4">
                
                
                                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {/* Brand Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand Name
                                </label>
                                <input 
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                                    placeholder="Enter brand name"
                                    value={formData.brandName}
                                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                                />
                            </div>

                            {/* Model Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model Name
                                </label>
                                <input 
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                                    placeholder="Enter model name"
                                    value={formData.modelName}
                                    onChange={(e) => handleInputChange('modelName', e.target.value)}
                                />
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                                        value={formData.year}
                                        onChange={(e) => handleInputChange('year', e.target.value)}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                        <option value="2022">2022</option>
                                        <option value="2021">2021</option>
                                        <option value="2020">2020</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type
                                </label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="hatchback">Hatchback</option>
                                        <option value="coupe">Coupe</option>
                                        <option value="truck">Truck</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
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
                                Create Vehicle Category
                            </button>
                        </div>
                    </div>
            </div>
    );
};

export default VehicleCategory;