import React from "react";

import car from "../assets/car.png"; 
import star from "../assets/star.png";
import circle from "../assets/circle.png"; 
import lock from "../assets/lock.png"; 
import Navbar from "./Navbar";
import MobileExperience from "./MobileExperience";
import Partner from "./Partner";
import WhyChooseUs from "./WhyChooseUs";
import HeroSection from "./HeroSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import StatsSection from "./StatsSection";
const Home = () => {
  return (
    <div>
      <div className="absolute w-full top-0">
      <Navbar bgColor="bg-gradient-to-r from-[#030130] to-[#023669]" />
       </div>
<section className="bg-gradient-to-r from-[#030130] to-[#023669] text-white relative overflow-hidden">
  <div className="container mx-auto px-6 pt-32 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h1 className="mt-10 md:mt-20 text-3xl md:text-5xl font-extrabold leading-tight">
              EVERYTHING YOUR VEHICLE NEEDS - IN ONE PLACE
            </h1>
            <p className="mt-6 text-base md:text-lg text-gray-300 max-w-lg">
              Discover quality automotive products from trusted vendors. Shop by
              category, vehicle type, or brand.
            </p>
            {/* <div className="flex flex-wrap gap-4 mt-6">
              <button className="bg-white text-blue-700 px-5 py-3 rounded-lg font-medium hover:bg-gray-200">
                Register as a Vendor
              </button>
              <button className="bg-sky-500 hover:bg-sky-600 px-5 py-3 rounded-lg font-medium text-white">
                Download App
              </button>
            </div> */}
            
          </div>
          <div className=" z-10 flex justify-center">
            <img
            src={car}
            alt="Car"
            className="w-full -mt-2 sm:-mt-20 md:-mt-1 ml-4 sm:ml-[76px] md:ml-28 object-cover h-auto rounded-lg"
            />

          </div>
        </div>
      </section>

      {/* Features Section */}
<section className="relative z-10 -mt-12 mb-16 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
  
  {/* Card 1 */}
  <div className="bg-white rounded-xl p-6 shadow-lg relative pt-16 transition duration-300 hover:bg-blue-600 hover:text-white">
    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
      <img src={star} alt="star" className="w-20 h-20" />
    </div>
    <h3 className="font-bold text-lg text-center mt-4">Genuine Products</h3>
    <p className="text-sm mt-2 text-center">
      We partner only with verified vendors to ensure every product you
      purchase is authentic, high-quality, and compatible with your
      vehicle.
    </p>
  </div>

  {/* Card 2 */}
  <div className="bg-white rounded-xl p-6 shadow-lg relative pt-16 transition duration-300 hover:bg-blue-600 hover:text-white">
    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
      <img src={circle} alt="circle" className="w-20 h-20" />
    </div>
    <h3 className="font-bold text-lg text-center mt-4">Easy Returns</h3>
    <p className="text-sm mt-2 text-center">
      Not happy with your purchase? No worries. Our hassle-free return
      policy makes it simple to exchange or return items without the
      stress.
    </p>
  </div>

  {/* Card 3 */}
  <div className="bg-white rounded-xl p-6 shadow-lg relative pt-16 transition duration-300 hover:bg-blue-600 hover:text-white">
    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
      <img src={lock} alt="lock" className="w-20 h-20" />
    </div>
    <h3 className="font-bold text-lg text-center mt-4">Secure Checkout</h3>
    <p className="text-sm mt-2 text-center">
      Your safety is our priority. All transactions are encrypted and
      protected with industry-standard security to give you complete peace
      of mind while shopping.
    </p>
  </div>
</section>
      
      <MobileExperience />      
      <Partner />
      <WhyChooseUs />
      <HeroSection />
      <ContactSection />
      <StatsSection />
      <Footer/>
     
    </div>
  );
};

export default Home;
