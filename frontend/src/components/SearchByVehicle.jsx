import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { RiSearchEyeLine } from 'react-icons/ri';

export default function SearchByVehicle() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };
  return (
    <div className="w-full bg-transparent text-white  " style={{ marginTop: '-50px' }}>
      <div className="max-w-7xl mx-auto rounded-xl border-t-1 border-t-gray-600 bg-gradient-to-br from-gray-900/14 to-gray-900/17 backdrop-blur-md p-1">
        {/* Header Section */}
        <div className="flex justify-between items-center px-6 py-2 bg-transparent">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Search By Vehicle</h3>
          <div className="flex items-center gap-2 ">
            <span className='text-md'>Search by Number Plate :</span>
            <div className='border-1 border-white rounded flex items-center gap-2'>
              <input
                type="text"
                placeholder="KL A 23-25"
                className="bg-white text-black px-2.5 py-2.5 rounded outline-none border-1 border-black "
              />
            </div>
            <div className='bg-white text-black h-11 p-2 rounded flex items-center justify-center cursor-pointer'>
              <RiSearchEyeLine size={26} />
            </div>
          </div>
        </div>
        {/* Dropdown Section */}
        <div >
          <div className="flex gap-4 p-6 my-4">
            {/* Car Maker */}
            <div className="relative ">
              <div
                className="bg-white text-black h-12 px-4 py-2 rounded-lg flex items-center justify-between cursor-pointer gap-4"
                onClick={() => toggleDropdown("carMaker")}
              >
                <span className="text-black text-xl font-semibold">Select Car Maker</span>
                <IoMdArrowDropdown size={28} />
              </div>
              {openDropdown === "carMaker" && (
                <div className="absolute mt-1 w-full bg-white border rounded shadow z-10 text-black">
                  <div className="px-4 py-2  hover:bg-gray-100">Toyota</div>
                  <div className="px-4 py-2 hover:bg-gray-100">Honda</div>
                  <div className="px-4 py-2 hover:bg-gray-100">Hyundai</div>
                </div>
              )}
            </div>

            {/* Model Line */}
            <div className="relative ">
              <div
                className="bg-white text-black h-12 px-4 py-2 rounded-lg flex items-center justify-between cursor-pointer gap-4"
                onClick={() => toggleDropdown("modelLine")}
              >
                <span className="text-black text-xl font-semibold">Select Model Line</span>
                <IoMdArrowDropdown size={28} />
              </div>
              {openDropdown === "modelLine" && (
                <div className="absolute mt-1 w-full bg-white border rounded shadow z-10 text-black">
                  <div className="px-4 py-2 hover:bg-gray-100">Corolla</div>
                  <div className="px-4 py-2 hover:bg-gray-100">Civic</div>
                  <div className="px-4 py-2 hover:bg-gray-100">i20</div>
                </div>
              )}
            </div>
            {/* Year */}
            <div className="relative ">
              <div
                className="bg-white text-black h-12 px-4 py-2 rounded-lg flex items-center justify-between cursor-pointer gap-4"
                onClick={() => toggleDropdown("year")}
              >
                <span className="text-black text-xl font-semibold">Select Year</span>
                <IoMdArrowDropdown size={28} />
              </div>
              {openDropdown === "year" && (
                <div className="absolute mt-1 w-full bg-white border rounded shadow z-10 text-black">
                  <div className="px-4 py-2 hover:bg-gray-100">2022</div>
                  <div className="px-4 py-2 hover:bg-gray-100">2023</div>
                  <div className="px-4 py-2 hover:bg-gray-100">2024</div>
                </div>
              )}
            </div>
            {/* Modification */}
            <div className="relative ">
              <div
                className="bg-white text-black h-12 px-4 py-2 rounded-lg flex items-center justify-between cursor-pointer gap-4"
                onClick={() => toggleDropdown("modification")}
              >
                <span className="text-black text-xl font-semibold">Select Modification</span>
                <IoMdArrowDropdown size={28} />
              </div>
              {openDropdown === "modification" && (
                <div className="absolute mt-1 w-full bg-white border rounded shadow z-10 text-black">
                  <div className="px-4 py-2 hover:bg-gray-100">Petrol</div>
                  <div className="px-4 py-2 hover:bg-gray-100">Diesel</div>
                  <div className="px-4 py-2 hover:bg-gray-100">Electric</div>
                </div>
              )}
            </div>
            {/* Search Button */}
            <div className=" flex-shrink-0">
              <button className="bg-[#0085AD] hover:bg-[#0077b3] text-white rounded h-12 px-3 py-2 ">
                <span className="text-white text-lg font-medium">Search parts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-500"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
