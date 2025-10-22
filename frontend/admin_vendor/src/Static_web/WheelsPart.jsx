import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

// Product images
import wheel1 from "../assets/wheel1.png";
import wheel2 from "../assets/wheel2.png";
import wheel3 from "../assets/wheel3.png";
import wheel4 from "../assets/wheel4.png";
import wheel5 from "../assets/wheel5.png";
import wheel6 from "../assets/wheel6.png";
import wheel7 from "../assets/wheel7.png";
import wheel8 from "../assets/wheel8.png";
import wheel9 from "../assets/wheel8.png";
import wheel10 from "../assets/wheel10.png";
import wheel11 from "../assets/wheel11.png";
import wheel12 from "../assets/wheel2.png";
import wheel13 from "../assets/wheel3.png";
import wheel14 from "../assets/wheel4.png";
import wheel15 from "../assets/wheel5.png";
import wheel16 from "../assets/wheel6.png";
import Footer from "./Footer";

// Product data
const products = [
  { name: "Alloy Wheel – XZR Sport 18", image: wheel1, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel2, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel3, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel4, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel5, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel6, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel7, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel8, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel9, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel10, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel11, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel12, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel13, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel14, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel15, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
  { name: "Alloy Wheel – XZR Sport 18", image: wheel16, size: "18 × 8J", bolt: "5×114.3", material: "High-grade aluminum alloy", finish: "Glossy Black with Silver Accents", weight: "9.2 kg", price: "₹18,500 per wheel" },
];

/**
 * A component that displays a grid of wheels with pagination
 * 
 * @param {string} search - The search query to filter the wheels
 * @param {number} currentPage - The current page number
 * @param {number} itemsPerPage - The number of items to display per page
 * @param {number} totalPages - The total number of pages
 * @param {function} goToPage - A function to navigate to a specific page
 * @returns {JSX.Element} - A JSX element representing the wheels grid with pagination
 */
/*******  96cc2600-6fb1-4749-9069-d144b8eb6922  *******/
const WheelsPart = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4; 

  // Filter products by search
  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>

    <div className="px-6  max-w-7xl mx-auto">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {currentProducts.map((prod, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-4 text-left hover:shadow-lg transition"
          >
            <img
              src={prod.image}
              alt={prod.name}
              className="w-full h-40 object-cover rounded-lg mb-4 "
            />
            <h3 className="text-[#5737B4] font-bold text-md mb-2">{prod.name}</h3>
            <p>Size: {prod.size}</p>
            <p><b>Bolt Pattern:</b> {prod.bolt}</p>
            <p><b>Material:</b> {prod.material}</p>
            <p><b>Finish:</b> {prod.finish}</p>
            <p><b>Weight:</b> {prod.weight}</p>
            <p><b>Price:</b> {prod.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md text-purple-600 border-purple-600 hover:bg-purple-100 disabled:opacity-50"
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index + 1)}
            className={`px-3 py-1 border rounded-md ${
              currentPage === index + 1
                ? "bg-purple-600 text-white"
                : "text-purple-600 border-purple-600 hover:bg-purple-100"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md text-purple-600 border-purple-600 hover:bg-purple-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
    
    </div>
  );
};

export default WheelsPart;
