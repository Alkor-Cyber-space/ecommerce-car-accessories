import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import VehicleCategory from './VehicleCatogery';
import ProductCategory from './ProductCatogery';
import VehicleTable from './VehiclTable';
import ProductTable from './ProductTable';
import CategoryRequestApproving from '../../../components/admin/CategoryRequestApproving';

const IndexCategory = () => {
    const [isFirstExpanded, setIsFirstExpanded] = useState(false);
    const [isSecondExpanded, setIsSecondExpanded] = useState(false);

    return (
        <div>
        <div className="bg-[#ECECF0] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 rounded-2xl w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4'>
                <h1 className='font-semibold text-xl sm:text-2xl text-gray-800'>
                    Manage Vehicle Categories & Product Categories
                </h1>
                <button className='bg-[#5727B4] text-white px-3 sm:px-4 md:px-5 py-2 rounded-md text-sm sm:text-base hover:bg-[#4a1f99] transition-colors whitespace-nowrap'>
                    Bulk Upload Vehicle Categories
                </button>
            </div> 
            
            {/* Separator Line */}
            <div className="border-t border-gray-500"></div>
            
            {/* First Expandable Section */}
            <div className="rounded-lg">
                <div 
                    className="flex justify-between items-center p-2 sm:p-3 cursor-pointer "
                    onClick={() => setIsFirstExpanded(!isFirstExpanded)}
                >
                    <h2 className="text-lg sm:text-xl font-medium text-gray-700">Vehicle Category</h2>
                    <ChevronDown 
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                            isFirstExpanded ? 'rotate-180' : ''
                        }`}
                    />
                </div>

                {isFirstExpanded && (
                    <div className="px-2 sm:px-3 pb-3 sm:pb-4">
                        <div className="pt-2 sm:pt-3">
                            <VehicleCategory />
                            <div className='mt-4 sm:mt-6'>
                                <VehicleTable />
                            </div>
                            
                        </div>
                    </div>
                )}
            </div>

            {/* Separator Line */}
            <div className="border-t border-gray-500"></div>

            {/* Second Expandable Section */}
            <div className="rounded-lg">
                <div 
                    className="flex justify-between items-center p-2 sm:p-3 cursor-pointer "
                    onClick={() => setIsSecondExpanded(!isSecondExpanded)}
                >
                    <h2 className="text-lg sm:text-xl font-medium text-gray-700">Add Product Category</h2>
                    <ChevronDown 
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                            isSecondExpanded ? 'rotate-180' : ''
                        }`}
                    />
                </div>

                {isSecondExpanded && (
                    <div className="px-2 sm:px-3 pb-3 sm:pb-4">
                        <div className="pt-2 sm:pt-3">
                           
                            
                                <ProductTable />
                        </div>
                        
                    </div>
                )}
            </div>
            
        </div>
        <CategoryRequestApproving/>
        </div>
    );
};

export default IndexCategory;