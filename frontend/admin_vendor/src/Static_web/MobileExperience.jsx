import React from "react";
import screen from "../assets/screen.png"; 
import mobile from "../assets/mobile.png"; // replace with your iPhone mockup image

const MobileExperience = () => {
  return (
    <section className="bg-[#E6F6FF] py-16">
      <div className="max-w-7xl mx-auto px-2  grid md:grid-cols-2 gap-5 items-center">
        {/* Left Section */}
        <div>
         <h2 className="w-full md:text-4xl font-font family font-bold text-[#232832] whitespace-nowrap">
              GET THE BEST EXPERIENCE ON MOBILE
          </h2>

          <p className="mt-4 text-gray-600">
            Shop smarter with our mobile app. Track orders, manage your vehicle
            garage, and get tailored recommendations.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            <button className="bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded shadow-sm hover:shadow-md transition">
              Download for Android
            </button>
            <button className="bg-sky-500 text-white px-4 py-2 rounded shadow-sm hover:bg-sky-600 transition">
              Download for IOS
            </button>
          </div>
        </div>

        {/* Right Section - Mobile Mockups */}
       <div className="relative flex justify-center">
  {/* Upper Image */}
  <img
    src={screen} // replace with your iPhone mockup image
    alt="Mobile App 1"
    className="w-[230px] md:w-[260px] relative z-10 -mb-12"
  />

  {/* Lower Image */}
  <img
    src={mobile}
    alt="Mobile App 2"
    className="w-[230px] md:w-[260px] absolute top-[-60px] z-0 right-[-4px]"  
  />
</div>
      </div>
    </section>
  );
};

export default MobileExperience;
