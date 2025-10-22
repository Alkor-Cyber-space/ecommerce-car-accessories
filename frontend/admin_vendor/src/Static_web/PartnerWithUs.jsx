import React from "react";
import lap from "../assets/lap.png";
import lap1 from "../assets/lap1.png";
import lap2 from "../assets/lap2.png";
import lap3 from "../assets/lap3.png";
import Seller from "./Seller";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const PartnerWithUs = () => {
  return (
    <div className="font-sans text-gray-800 min-h-screen flex flex-col">
      {/* Navbar (likely fixed) */}
     <Navbar bgColor="bg-gradient-to-r from-[#030130] to-[#023669]" />
                                                        
      {/* Spacer so content isn't hidden behind the fixed navbar */}
      <div className="h-26 md:h-40" />

      {/* How to Sell Section */}
      <main className="flex-grow px-4 sm:px-8 md:px-20 pt-6 md:pt-8 pb-16 md:pb-20 max-w-7xl mx-auto w-full relative z-0">
        {/* Centered heading */}
        <h2 className="text-4xl md:text-4xl md:text-4xl font-family font-bold text-center mb-12">
          HOW TO SELL ON CAROORA?
        </h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border border-gray-400 rounded-lg p-6 md:p-10 bg-white">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <img src={lap} alt="Register Account" className="w-28 h-auto mb-4" />
           <h3 className="font-semibold text-lg mb-2">
            Step 1 - Register your account
           </h3>
           <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
           {`Register in Caroora with GST/PAN details
           and an active bank account.`}
           </p>

          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <img src={lap1} alt="Update Details" className="w-28 h-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Step 2 - Update Contact Details and Address
            </h3>
            <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
              {`Add your phone number, email, and business
               address to keep your account verified and 
               deliveries smooth.`}
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <img src={lap2} alt="List Products" className="w-28 h-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Step 3 - List Products</h3>
            <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
              {`Showcase your products with clear
                details, images, and compatibility info 
                to attract more buyers.`}
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center">
            <img src={lap3} alt="Get Paid" className="w-28 h-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Step 4 - Complete Order and Get Paid
            </h3>
            <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
            {`Fulfil orders on time, and receive
             secure payments directly in your
              registered bank account.`}
            </p>
          </div>
        </div>

        {/* Why Become a Seller */}
        <section className="mt-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
                WHY BECOME A SELLER ON CAROORA?
            </h2>

            <div className="relative">
                {/* Left Scroll Button */}
                <button
                    type="button"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hidden md:block "
                    onClick={() => {
                        document.getElementById('seller-benefits-scroll').scrollBy({ left: -300, behavior: 'smooth' });
                    }}
                    aria-label="Scroll left" 
                >
                    <svg width="24" height="24" fill="none" stroke="#5737B4" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Scrollable Cards */}
                <div
                    id="seller-benefits-scroll"
                    className="flex gap-4 hide-scrollbar w-auto scroll-smooth px-2 overflow-x-auto pb-2 
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:'none'] 
            [scrollbar-width:'none']"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="bg-white shadow rounded-lg p-6 text-center min-w-[260px]">
                        <h3 className="font-semibold mb-3 text-[#5737B4]">More Customers</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Sell your products to a wide network of automotive buyers across India.
                        </p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6 text-center min-w-[260px]">
                        <h3 className="font-semibold mb-3 text-[#5737B4]">Simple Registration Process</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Getting started is quick and easy. Register with your GST/PAN details and bank account.
                        </p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6 text-center min-w-[260px]">
                        <h3 className="font-semibold mb-3 text-[#5737B4]">Zero Hassle, Maximum Support</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Smooth onboarding, clear guidelines, and dedicated support whenever you need it.
                        </p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6 text-center min-w-[260px]">
                        <h3 className="font-semibold mb-3 text-[#5737B4]">Boost Your Business Growth</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Expand your reach, build credibility, and grow your sales consistently.
                        </p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6 text-center min-w-[260px]">
                        <h3 className="font-semibold mb-3 text-[#5737B4]">Fast & Secure Payments</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Receive payments directly in your registered bank account without delays.
                        </p>
                    </div>
                </div>

                {/* Right Scroll Button */}
                <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hidden md:block "
                    onClick={() => {
                        document.getElementById('seller-benefits-scroll').scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                    aria-label="Scroll right"
                >
                    <svg width="24" height="24" fill="none" stroke="#5737B4" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </section>
        <div className="flex justify-center mt-12">
          <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition">
            <Link to="/register"> Start Selling </Link>
          </button>
        </div>
      </main>

      {/* Footer */}
      
      <Seller/>
      <Footer />
    </div>
    
  );
};

export default PartnerWithUs;


