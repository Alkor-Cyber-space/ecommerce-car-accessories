import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import ReviewList from './ReviewList';
import SummaryCards from './SummaryCards';

const RatingAndReviewLayout = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Last week");
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setShowDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='bg-gray-100 px-6 py-6 rounded-2xl'>
            <div className='flex justify-between mb-5'>
                <h1 className="text-xl md:text-2xl font-bold text-[#5737B4] mb-6">Rating & Reviews</h1>
                {/* <div className="relative inline-block" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className="flex items-center justify-between gap-2 bg-white px-4 py-2 rounded-md text-sm font-medium text-[#5737B4] hover:bg-gray-50"
                    >
                        {selectedOption}
                        <IoIosArrowDown className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                    </button>
                    <div
                        className={`absolute z-10 mt-2 w-40 rounded-md shadow-lg bg-white transform transition-all duration-200 origin-top
                ${showDropdown ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                    >
                        <ul className="py-1 text-sm text-gray-700">
                            {["Last week", "Last 6 months", "Last 12 months"].map((option) => (
                                <li
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    className="hover:bg-gray-100 px-4 py-2 cursor-pointer"
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div> */}
            </div>
            <div>
                <SummaryCards />
            </div>

            <div className='mt-5'>
                <ReviewList />
            </div>
        </div>
    );
};

export default RatingAndReviewLayout;
