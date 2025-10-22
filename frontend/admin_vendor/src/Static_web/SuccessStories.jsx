import React from "react";
import hand from "../assets/hand.png";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SuccessStorySection from "./SuccessStorySection";
import Story from "./Story";
import { Link } from "react-router-dom";
                                        

const SuccessStories = () => {
  return (
    <div> 
    <section className="bg-white py-16">
      <Navbar bgColor="bg-gradient-to-r from-[#030130] to-[#023669]" />
      <div className="max-w-7xl mx-auto px-9 py-30 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        
        {/* Left Image */}
        <div>
          <img
            src={hand}
            alt="Partners"
            className=" shadow-md"
          />
        </div>

        {/* Right Content */}
        {/* Right Content */}
<div className=" justify-around space-y-10"> 
  <h2 className="text-5xl md:text-3xl font-bold text-gray-900">
    REAL SELLERS. REAL GROWTH.
  </h2>

  <p className="text-gray-600 leading-relaxed">
    See how automotive businesses thrive with Caroora—from easy onboarding to
    <span className="block sm:inline"> on-time payouts.</span>
  </p>

  <button className="bg-sky-500 text-white px-6 py-3  rounded-lg font-medium hover:bg-sky-600 transition">
    <Link to="/register"> Become a Partner </Link>
  </button>
</div>

      </div>
      <Story />
      <SuccessStorySection />
      
    </section>
    <Footer />
    </div>
  );
};

export default SuccessStories;
