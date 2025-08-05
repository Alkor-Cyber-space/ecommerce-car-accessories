import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Ban } from 'lucide-react';

const VehicleTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const vehicleData = [
        { id: 1, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'CNG' },
        { id: 2, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Petrol' },
        { id: 3, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Diesel' },
        { id: 4, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Electric' },
        { id: 5, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'CNG' },
        { id: 6, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Diesel' },
        { id: 7, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Diesel' },
        { id: 8, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Electric' },
        { id: 9, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Electric' },
        { id: 10, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'CNG' },
        { id: 11, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Electric' },
        { id: 12, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Electric' },
        { id: 13, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Electric' },
        { id: 14, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'CNG' },
        { id: 15, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Diesel' },
        { id: 16, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'Diesel' },
        { id: 17, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'CNG' },
        { id: 18, brandName: 'Brand 1', modelName: 'Model 1', year: 2019, type: 'CNG' },
    ];

    const handleAction = (action, item) => {
        console.log(`${action} clicked for:`, item);
        setOpenDropdown(null);
        // Add your action logic here
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden mr-4 sm:mr-6 md:mr-10 lg:mr-16 xl:mr-20 2xl:mr-24">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className=" ">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                BRAND NAME
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                MODEL NAME
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                YEAR
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                TYPE
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {vehicleData.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : ''}>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.brandName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.modelName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.year}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 relative">
                                    <button
                                        onClick={() => toggleDropdown(item.id)}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {openDropdown === item.id && (
                                        <div className="absolute right-0 top-8 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => handleAction('Edit', item)}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleAction('Delete', item)}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleAction('Disable', item)}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                                                >
                                                    <Ban className="w-4 h-4 mr-2" />
                                                    Disable
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div 
                    className="fixed inset-0 z-5" 
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </div>
    );
};

export default VehicleTable;