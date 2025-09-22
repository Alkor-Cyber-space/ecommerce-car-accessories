import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { vehicleCategoryApi } from '../../../services/allAPI';
import { toast } from 'react-toastify';

const VehicleCategory = () => {
    const [formData, setFormData] = useState({
        make: '',    
        model: '',   
        year: '',
        variant: ''  
    });

    const [years, setYears] = useState([]);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 2000; // change if needed
        const yearList = [];
        for (let y = currentYear; y >= startYear; y--) {
            yearList.push(y);
        }
        setYears(yearList);
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancel = () => {
        setFormData({
            make: '',
            model: '',
            year: '',
            variant: ''
        });
    };

    const handleCreateCategory = async () => {
        try {
            const response = await vehicleCategoryApi(formData); 
            console.log("Response:", response);
            toast.success(response.message || 'Vehicle category created successfully!');
            
            // Dispatch custom event to notify VehicleTable to refresh
            const refreshEvent = new CustomEvent('vehicleCreated', {
                detail: { newVehicle: response.data || formData }
            });
            window.dispatchEvent(refreshEvent);
            
            handleCancel();
        } catch (error) {
            console.error('Error creating vehicle category:', error);
            toast.error(error.response?.data || 'An error occurred while creating the vehicle category.');
        }
    };

    return (
        <div className="bg-white rounded-lg">
            <div className="p-4">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Make */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand Name
                        </label>
                        <input 
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                            placeholder="Enter brand name"
                            value={formData.make}
                            onChange={(e) => handleInputChange('make', e.target.value)}
                        />
                    </div>

                    {/* Model */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model Name
                        </label>
                        <input 
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                            placeholder="Enter model name"
                            value={formData.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
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
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Variant */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <div className="relative">
                            <select 
                                className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#5727B4] focus:border-transparent"
                                value={formData.variant}
                                onChange={(e) => handleInputChange('variant', e.target.value)}
                            >
                                <option value="">Select Type</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="CNG">CNG</option>
                                <option value="Electric">Electric</option>
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