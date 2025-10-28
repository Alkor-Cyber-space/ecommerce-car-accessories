import React from "react";
import bmblack from "../assets/bmblack.jpeg"; 
const StatsSection = () => {
  const stats = [
    { value: "688+", label: "Active Users" },
    { value: "24+", label: "Active Vendors" },
    { value: "243+", label: "Happy Customers" },
    { value: "5+", label: "Years of Excellence" },
  ];

  return (
    <section className="relative h-[220px] sm:h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden">
      <img
        src={bmblack}
        alt="Car Parts"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay with RGBA background */}
      <div
        className="absolute inset-0 flex items-center text-white"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl pr-8 font-bold leading-snug">
              ITS OUR <br /> JOURNEY
            </h2>
          </div>

          <div className="col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {stats.map((item, index) => (
              <div key={index}>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  {item.value}
                </h3>
                <p className="mt-1 sm:mt-2 text-gray-300 text-xs sm:text-sm md:text-base">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
