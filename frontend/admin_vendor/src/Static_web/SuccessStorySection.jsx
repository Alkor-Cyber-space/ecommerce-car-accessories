import React from "react";
import { Link } from "react-router-dom";

const SuccessStorySection = () => {
  return (
    <div className="w-full bg-white py-20 flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
        BE THE NEXT SUCCESS STORY
      </h2>

      <p className="text-gray-600 text-lg max-w-2xl mb-8">
        Our sellers are achieving great milestones. Start selling now and create your own
      </p>

      <button className="px-6 py-3 bg-sky-500 text-white font-medium rounded-md shadow-md hover:bg-sky-600 transition">
       <Link to="/register"> Start Selling Now </Link>
      </button>
    </div>
  );
};

export default SuccessStorySection;
