import React from "react";
import gcar from "../assets/gcar.jpg"; // replace with your image path
import tick from "../assets/tick.png"; // replace with your tick image path
import { Link } from "react-router-dom";

const Partner = () => {
  const features = [
    "Dedicated vendor dashboard",
    "Secure payment process",
    "Product performance insights",
    "Active customer support",
  ];

  return (
    <section
      className="relative bg-cover bg-center h-[500px] flex items-center"
    //   style={{ backgroundImage: `url(${bgImage})` }}
    >
    <div
        className="absolute inset-0"
        style={{
            backgroundImage: `url(${gcar})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
        }}
    >
        <div className="absolute inset-0 bg-black/70 bg-opacity-50"></div>
    </div>
    <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between w-full">
        {/* Left Content */}
        <div className="text-white max-w-lg">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            PARTNER WITH US
          </h2>
          <p className="mt-2 text-lg text-blue-200">
            Sell Your Automotive Products with Us
          </p>
          <p className="mt-2 text-gray-300">
            Join our platform and reach a wider audience. List your products,
            manage orders, and grow your business.
          </p>
        </div>

        {/* Right Features */}
        <div className=" bg-opacity-50 rounded-lg p-6 mt-6 md:mt-0 w-full md:w-[350px]">
          <ul className="space-y-4">
            {features.map((item, index) => (
              <li key={index} className="flex items-center space-x-3">
                <img
                  src = {tick} 
                />
                <span className="text-white text-sm">{item}</span>
              </li>
            ))}
          </ul>

          <button className="mt-6 w-full bg-sky-500 text-white font-medium py-2 rounded hover:bg-sky-600 transition">
          <Link to="/register"> Register as a Vendor </Link>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Partner;
