import React from "react";
import interior from "../assets/interior.png"; // replace with your image path
import bmblack from "../assets/bmblack.jpeg";

const ContactSection = () => {
  return (
    <div className="w-full">
      {/* Get in Touch Section */}
      <section className="container mx-auto px-4 sm:px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Form */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">GET IN TOUCH</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Questions, feedback, or partnership inquiries? We'd love to hear from you.
          </p>

          <form className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Mobile */}
            <input
              type="text"
              placeholder="Mobile Number"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Message */}
            <textarea
              rows="4"
              placeholder="Message"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-500 text-white px-10 sm:px-20 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src={interior} // replace with your image path
            alt="Car Interior"
            className="rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg object-cover"
          />
        </div>
      </section>
        {/* Stats Section */}
{/* <section className="relative h-[220px] sm:h-[280px] md:h-[380px] lg:h-[420px]">
  <img
    src={bmblack}
    alt="Car Parts"
    className="absolute inset-0 w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-opacity-60 flex items-center text-white">
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center text-center md:text-left">
      
     
      <div className="mb-6 md:mb-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl pr-8 font-bold leading-snug">
          ITS OUR <br /> JOURNEY
        </h2>
      </div>

      
      <div className="col-span-4 pl-4 sm:pl-6 md:pl-10 lg:pl-16 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 sm:gap-8 md:gap-10">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">688+</h3>
          <p className="mt-1 sm:mt-2 text-gray-300 text-xs sm:text-sm md:text-base">Active Users</p>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">24+</h3>
          <p className="mt-1 sm:mt-2 text-gray-300 text-xs sm:text-sm md:text-base">Active Vendors</p>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">243+</h3>
          <p className="mt-1 sm:mt-2 text-gray-300 text-xs sm:text-sm md:text-base">Happy Customers</p>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">5+</h3>
          <p className="mt-1 sm:mt-2 text-gray-300 text-xs sm:text-sm md:text-base">Years of Excellence</p>
        </div>
      </div>
    </div>
  </div>
</section> */}

    </div>
    
    
    
  );
};

export default ContactSection;
