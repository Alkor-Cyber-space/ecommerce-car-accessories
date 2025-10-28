import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import tool1 from "../assets/tool1.png";
import tool2 from "../assets/tool2.png";
import tool3 from "../assets/tool3.png";
import tool4 from "../assets/tool4.png";
import tool5 from "../assets/tool5.png";
import tool6 from "../assets/tool6.png";
import tool7 from "../assets/tool7.png";
import tool8 from "../assets/tool8.png";
import tool9 from "../assets/tool9.png";
import tool10 from "../assets/tool10.png";
import tool11 from "../assets/tool11.png";


const categories = [
  { name: "Exterior Accessories", image: tool1 },
  { name: "Interior Accessories", image: tool2 },
  { name: "Lighting & Electrical", image: tool3 },
  { name: "Engine & Mechanical Parts", image: tool4 },
  { name: "Tyre & Wheels", image: tool5 },
  { name: "Car Care & Cleaning", image: tool6 },
  { name: "Electronics & Infotainment", image: tool7 },
  { name: "Tools & Maintenance", image: tool8},
  { name: "Performance Parts", image: tool9 },
  { name: "Security & Safety", image: tool10 },
  { name: "Documentation & Compliance", image: tool11 },
];

const Categories = () => {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen px-6 py-10">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-8">
        PRODUCT CATEGORIES
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center items-center gap-3 mb-10 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl shadow-md border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg">
           Search
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-14xl  mx-auto">
        {filteredCategories.map((cat, index) => (
          <div
            key={index}
            className="flex flex-row items-center justify-center gap-3 bg-white hover:bg-gray-100 rounded-xl shadow-md p-6 cursor-pointer transition"
          >
            <img src={cat.image} alt={cat.name} className="w-16 h-16 object-contain" />
            <p className="text-lg font-semibold text-[#5737B4] text-start">{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
