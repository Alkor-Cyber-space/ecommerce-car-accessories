import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Ban } from 'lucide-react';

const ProductTable = () => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const productData = [
        { id: 1, categoryName: 'Electronics' },
        { id: 2, categoryName: 'Automotive Parts' },
        { id: 3, categoryName: 'Tools & Equipment' },
        { id: 4, categoryName: 'Safety Equipment' },
        { id: 5, categoryName: 'Maintenance Supplies' }
    ];

    const handleAction = (action, item) => {
        console.log(`${action} clicked for:`, item);
        setOpenDropdown(null);
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden mr-4 sm:mr-6 md:mr-10 lg:mr-16 xl:mr-20 2xl:mr-24">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {productData.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.categoryName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 relative">
                                    <button
                                        onClick={() => toggleDropdown(item.id)}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </button>

                                    {openDropdown === item.id && (
                                        <div className="absolute right-0 top-8 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => handleAction('Edit', item)}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Category
                                                </button>
                                                <button
                                                    onClick={() => handleAction('Delete', item)}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Category
                                                </button>
                                                <button
                                                    onClick={() => handleAction('Disable', item)}
                                                    className="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50"
                                                >
                                                    <Ban className="w-4 h-4 mr-2" />
                                                    Disable Category
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

            {openDropdown && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </div>
    );
};

export default ProductTable;
