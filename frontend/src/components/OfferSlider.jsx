import React, { useState } from "react";
import { motion } from "framer-motion";
import offer1 from "../assets/offer2.jpg";
import offer2 from "../assets/offer1.jpg";
import offer3 from "../assets/offer3.jpg";

const offers = [offer1, offer2, offer3];

export default function OfferGallery() {
  const [selected, setSelected] = useState(1);

  const circlePositions = [
    { x: "-130%", y: "20%" },  
    { x: "0%", y: "-90%" },    
    { x: "130%", y: "20%" },   
  ];

  return (
    <div className="relative w-full h-[460px] flex justify-center items-end">
      {/* Background semicircle with glass effect */}
      <div
       className="absolute  w-[800px] h-[430px] bg-[#D9D9D9]/0 backdrop-blur-lg rounded-t-full shadow-xl z-0 top-[0px] overflow-hidden  ">
      </div>

      {/* Image gallery inside arc */}
      <div className="relative flex justify-center items-end h-full w-[500px]  z-20 ">
        {offers.map((img, index) => (
          <motion.img
            key={index}
            src={img}
            alt={`Offer ${index + 1}`}
            className={`absolute cursor-pointer w-[180px] h-[180px] object-cover 
             rounded-full shadow-xl border-white 
             ${selected === index ? "z-20" : "z-10"}`}
            initial={false}
            animate={{
              x: circlePositions[index].x,
              y: circlePositions[index].y,
              scale: selected === index ? 1.6 : 1,
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setSelected(index)}
          />

        ))}
      </div>
    </div>
  );
}
