import React from "react";
import Bmwcar from "../assets/Bmwcar.jpeg";
import star from "../assets/5star.png";
import Akshay from "../assets/Akshay.png"
import meera from "../assets/meera.png"
import susan from "../assets/susan.png"
import adharsh from "../assets/adharsh.png"

import { useState } from "react";
const HeroSection = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const reviews = [
    {
      heading:"Love it!",
      stars:5,
      review:"Found the exact parts for my Polo in minutes. No mismatch, no confusion",
      image:Akshay,
      name:"Akshay R"
    },
    {
     
      heading:"Love the ‘My Garage’ feature",
      stars:5,
      review:"everything shown actually fits my car.",
      image:meera,
      name:"Meera P"
    },
    {
      heading:"Delivery was quick and the packaging was solid",
      stars:5,
      review:"everything shown actually fits my car.",
      image:susan,
      name:"Susan"
    },
    {
     
      heading:"The parts are genuine and well-priced",
      stars:5,
      review:"everything shown actually fits my car.",
      image:adharsh,
      name:"Adharsh",

    },
    {
       
      heading:"The parts are genuine and well-priced",
      stars:5,
      review:"everything shown actually fits my car.",
      image:adharsh,
      name:"Adharsh"
    },
    {
      
      heading:"The parts are genuine and well-priced",
      stars:5,
      review:"everything shown actually fits my car.",
      image:adharsh,
      name:"Adharsh"
    },
    {
      
      heading:"The parts are genuine and well-priced",
      stars:5,
      review:"everything shown actually fits my car.",
      image:adharsh,
      name:"Adharsh"
    },
    {
      
      heading:"The parts are genuine and well-priced",
      stars:5,
      review:"everything shown actually fits my car.",
      image:adharsh,
      name:"Adharsh"
    },
  ];

  return (
    <div className="w-full">
      <section className="relative h-[300px] md:h-[500px]">
        <div className="h-[300px]">
          <img
            src={Bmwcar}
            alt="Car Parts"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#66666633]/30 to-[#000000]"></div>
        <div className="absolute inset-0 bg-opacity-60 flex flex-col justify-center items-end px-26 text-white shadow-lg ">
          <h1 className="text-3xl md:text-4xl font-bold ">
            FIND THE PERFECT PARTS FOR YOUR RIDE
          </h1>
          <p className="mt-2 text-lg">Shop only products that fit your exact vehicle</p>
        </div>
      </section>
     
      <section className="bg-blue-50 py-10 px-6">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">
            WHAT THEY SAY ABOUT OUR SERVICES
          </h2>
          <p className="text-gray-600">
            Real experiences from our happy customers
          </p>
        </div>
        <div className="  p-9 flex gap-7 overflow-x-auto pb-2 
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:'none'] 
            [scrollbar-width:'none']">
              
          {reviews.map((review, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`min-w-[250px] max-w-[250px] rounded-xl p-4 flex-shrink-0 cursor-pointer transition-colors duration-300 shadow-md ${
                selectedIndex === index ? "bg-[#02B3FB] text-white" : "bg-white"
              }`}
            >
              <h1 className="mt-2 text-black font-semibold justify-items-center">{review.heading}</h1>
              <div className="flex items-center mb-2">
                {Array.from({ length: review.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
                {Array.from({ length: 5 - review.stars }).map((_, i) => (
                  <span key={i} className="text-gray-300 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700">{review.review}</p>
              {review.image && (
                <img
                  src={review.image}
                  alt="User"
                  className="w-10 h-10 rounded-full mt-4 mx-auto"
                />
              )}
              <p className="mt-2 font-semibold text-gray-900 text-center">- {review.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>

  );
};

export default HeroSection;
