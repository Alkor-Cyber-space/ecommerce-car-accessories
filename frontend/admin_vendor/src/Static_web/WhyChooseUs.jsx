import React from "react";
import image71 from "../assets/image 71.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";

const WhyChooseUs = () => {
  const features = [
    {
      icon: image71,
      title: "Wide Range of Products",
      description:
        "From engine parts to accessories, explore everything under one roof",
    },
    {
      icon: image2,
      title: "Verified Vendors",
      description: "Products listed only by approved and trusted sellers",
    },
    {
      icon: image3,
      title: "Vehicle-Based Search",
      description: "Save your vehicle and find perfect-fit parts with ease",
    },
    {
      icon: image4,
      title: "Fast & Reliable Delivery",
      description: "Get parts delivered right to your doorstep",
    },
    {
      icon: image5,
      title: "Mobile App",
      description: "Shop anytime, anywhere with our user-friendly mobile app",
    },
  ];

  return (
    <section className="bg-[#E5F6FE] py-10 pt-20">
      <div className="max-w-7xl mx-auto px-6 text-center ">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          WHY CHOOSE US
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Sell Your Automotive Products with Us
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Join our platform and reach a wider audience. List your products,
          manage orders, and grow your business.
        </p>

        {/* Cards → Scrollable in Mobile */}
        <div
          className="
            p-9 flex gap-7 overflow-x-auto pb-2 
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:'none'] 
            [scrollbar-width:'none']
          "
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white relative rounded-xl shadow-md p-7 pt-20 flex-shrink-0 w-72 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {/* Floating Icon */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-25 h-25 object-contain"
                />
              </div>

              <h3 className="text-lg font-bold text-purple-700">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
