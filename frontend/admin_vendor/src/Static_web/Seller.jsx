import React from "react";

// Sample image imports – replace with actual images
import seller1 from "../assets/seller1.png";
import Akshay from "../assets/Akshay.png";
import seller3 from "../assets/seller3.png";
import seller4 from "../assets/seller4.png";
import { Link } from "react-router-dom";

const Seller = () => {
  const sellers = [
    {
      id: 1,
      name: "Arun Kumar",
      business: "Auto Parts Vendor",
      text: "Caroora gave my business a new reach. I’m now able to connect with customers from cities I never thought I could serve.",
      image: seller1,
    },
    {
      id: 2,
      name: "Meera Enterprises",
      business: "Auto Parts Vendor",
      text: "The registration was super easy, and I started listing my products within minutes. The process is simple and seller-friendly.",
      image: Akshay,
    },
    {
      id: 3,
      name: "Raghav Auto Solutions",
      business: "Auto Parts Vendor",
      text: "Timely payments and reliable support make Caroora stand out. I never have to worry about delays.",
      image: seller3,
    },
    {
      id: 4,
      name: "Suhas Motors",
      business: "Auto Parts Vendor",
      text: "With Caroora, I've seen consistent growth in sales and better visibility for my products.",
      image: seller4,
    },
  ];

  return (
    <div className="font-sans text-gray-800 flex flex-col min-h-screen">
      

      {/* Seller Section */}
      <section className="py-16 px-6 sm:px-12 md:px-20 flex-grow">
        <h2 className="bg-[#F5F3EF] text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 p-4">
          HERE WHAT OUR SELLERS ARE SAYING
        </h2>

        <div className="space-y-16 max-w-5xl mx-auto">
          {sellers.map((seller, index) => (
            <div
              key={seller.id}
              className={`flex flex-col md:flex-row items-center md:items-start gap-6 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}qcfw
            >
              {/* Image with blue offset */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-blue-900 translate-x-2 translate-y-2"></div>
                <img
                  src={seller.image}
                  alt={seller.name}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full"
                />
              </div>

              {/* Text */}
              <div className="text-center md:text-left">
                <p className="italic text-gray-700 mb-4">{seller.text}</p>
                <h4 className="font-bold">{seller.name}</h4>
                <p className="text-sm text-gray-500">{seller.business}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section with Wave */}
      <section className="relative bg-blue-50 text-center">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="2 0 500 200"
            preserveAspectRatio="none"
            className="w-full h-16 md:h-24"
          >
            <path
              d="M0,100 C150,100 350,0 500,50 L500,00 L0,0 Z"
              className="fill-white"
            ></path>
          </svg>
        </div>

        <div className="relative py-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            START SELLING TODAY
          </h2>
          <p className="text-gray-600 mb-8">
            Put your products in front of millions of eager shoppers
          </p>
          <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition">
           <Link to="/register"> Start Selling </Link>
          </button>
        </div>
      </section>

      
    </div>
  );
};

export default Seller;
