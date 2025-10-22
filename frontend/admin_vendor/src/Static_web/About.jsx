import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const About = () => {
  return (
    <div className="font-sans text-gray-800 min-h-screen flex flex-col">
      <Navbar bgColor="bg-gradient-to-r from-[#030130] to-[#023669]" />
      <main className="flex-grow ml-2 sm:px-8 md:px-20 py-20 md:py-24 max-w-8xl mx-auto">
                                                                                        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900 pt-20 ">
          ABOUT CAROORA
        </h2>

        <p className="text-lg">
          Welcome to Caroora, your trusted platform for everything automotive.
          We’re passionate about connecting vehicle owners, enthusiasts, and
          businesses with the products they need to keep their rides running
          smoothly and looking their best.
        </p>

        <p className="text-lg">
          At Caroora, we believe buying automotive products should be simple,
          transparent, and reliable. Whether you’re searching for spare parts,
          accessories, or performance upgrades, we bring together a wide range
          of trusted vendors to ensure you always find the right fit for your
          vehicle.
        </p>

        <p className="text-lg">
          Our mission is to redefine convenience in the automotive
          industry—offering a seamless shopping experience, verified products,
          and dependable delivery. We partner with top manufacturers and sellers
          to give you access to quality items at the best possible value.
        </p>

        <p className="text-lg">
          With Caroora, you don’t just shop—you become part of a growing
          community of automotive lovers who value performance, safety, and
          style.
        </p>

        <div className="text-lg">
          <h3>
            Why Caroora?
          </h3>
          <ul className="text-lg list-disc list-inside space-y-2 text-sm sm:text-base">
            <li>Wide network of reliable vendors</li>
            <li>Quality-checked automotive products</li>
            <li>Easy search and purchase experience</li>
            <li>Customer-first approach</li>
          </ul>
        </div>

        <p className=" font-medium text-center md:text-left">
          Drive smarter. Shop better. Choose Caroora.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default About;
