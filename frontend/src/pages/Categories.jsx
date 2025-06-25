import React from "react";
import maintenance from "../assets/image1.png"; // Update with your image paths
import ac from "../assets/image 5.png";
import belt from "../assets/belt.png";
import bearings from "../assets/bearings.png";

const categories = [
  {
    title: "Maintenance service parts",
    image: maintenance,
  },
  {
    title: "Air conditioning",
    image: ac,
  },
  {
    title: "Belt chain and Rollers",
    image: belt,
  },
  {
    title: "Bearings",
    image: bearings,
  },
  {
    title: "Belt chain and Rollers",
    image: belt,
  },
  {
    title: "Bearings",
    image: bearings,
  }
];

const Categories = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      {/* <p className="text-5xl font-bold text-[#e6e4e4dd] uppercase">All Products</p>
      <p className="text-4xl font-bold  text-gray-600 " style={{ marginTop: '-30px' }}>Search By Category</p> */}
      <p className="text-6xl font-extrabold text-[#82828226] tracking-wide uppercase">All Products</p>
      <p className="text-4xl font-extrabold text-[#1b1a1a] tracking-wide	" style={{ marginTop: '-32px' }}>Search By Category</p>


      <div className="flex overflow-x-auto gap-6 mt-12 px-2 py-2"
        style={{ scrollbarWidth: 'none' }} >
        {categories.map((cat, index) => (
          <div
            key={index}
            className="bg-[#D9D9D9] min-w-[360px] rounded-lg shadow-md py-10 px-8 flex flex-col items-center transition hover:scale-105 duration-300 cursor-pointer"
          >
            <img src={cat.image} alt={cat.title} className="h-64 object-contain mb-4" />
            <p className="text-center text-2xl font-medium w-11/12 text-white">{cat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
