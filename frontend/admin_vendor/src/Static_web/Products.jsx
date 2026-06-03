import React from "react";
import part1 from "../assets/part1.png";
import part2 from "../assets/part2.png";
import part3 from "../assets/part3.png";
import part4 from "../assets/part4.png";
import part5 from "../assets/part5.png";
import part6 from "../assets/part6.png";
import part7 from "../assets/part7.png";
import part8 from "../assets/part8.png";
import part9 from "../assets/part9.png";
import part10 from "../assets/part10.png";
import Navbar from "./Navbar";
import Categories from "./Categories";
import WheelsPart from "./WheelsPart";
import Footer from "./Footer";
import { Link } from "react-router-dom";

const Products = () => {
  // group images into columns
  const columns = [
    [part1, part6],
    [part2, part7],
    [part3, part8],
    [part4, part9],
    [part5, part10],
  ];

  // custom vertical offsets for curve effect
  const offsets = ["mt-0", "mt-20", "mt-40", "mt-20", "mt-0"];

  return (
    <div>
      {/* Navbar */}
      <Navbar bgColor="bg-gradient-to-r from-[#030130] to-[#023669]" />

      {/* Main Section */}
      <section className="max-w-7xl mx-auto py-24 px-6 text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bebas-neue text-gray-900 mt-8 mb-6">
          EXPLORE WHAT WE OFFER
        </h2>
        <p className="text-gray-600 mx-auto mb-6 leading-relaxed max-w-2xl">
          Discover a wide range of automotive products available on Caroora. From
          essential parts to accessories, our platform connects buyers with trusted
          vendors.
        </p>

        <Link
          to="/register"
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-12 py-3 rounded-md mb-12 transition inline-block text-center"
        >
          Start Selling
        </Link>

        {/* Curve layout */}
        <div className="flex justify-center gap-4">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className={`flex flex-col gap-4 ${offsets[colIndex]}`}>
              {col.map((src, imgIndex) => (
                <div
                  key={imgIndex}
                  className="overflow-hidden rounded-lg shadow hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={src}
                    alt={`car-item-${colIndex}-${imgIndex}`}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Extra Sections */}
        <Categories />
        <WheelsPart />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Products;
