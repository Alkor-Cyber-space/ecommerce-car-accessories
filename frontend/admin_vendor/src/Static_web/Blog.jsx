import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Blog = () => {
  const blogs = Array(5).fill({
    title: "TOP 5 MUST-HAVE CAR ACCESSORIES IN 2025",
    content: `Welcome to Caroora, your trusted platform for everything automotive. 
    We're passionate about connecting vehicle owners, enthusiasts, and businesses 
    with the products they need to keep their rides running smoothly and looking their best. 
    At Caroora, we believe buying automotive products should be simple, transparent, and reliable. 
    Whether you’re searching for spare parts, accessories, or performance upgrades, 
    we bring together a wide range of products.`,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
<Navbar bgColor="bg-gradient-to-r from-[#030130] to-[#023669]" />
    <div className="max-w-4xl mx-auto px-6 py-42">
    
      {blogs.map((blog, index) => (
        <div key={index} className="mb-12">
          {/* Date + Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 items-start">
            {/* Show date only for first two blogs */}
            {index < 2 ? (
              <div className="text-gray-600 text-lg whitespace-nowrap">
                July 20, 2025
              </div>
            ) : (
              <div></div> 
            )}

            <div className="md:col-span-3">
              <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                {blog.title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{blog.content}</p>

              <div className="flex justify-center">
              <a
                href="#"
                className="text-sm text-purple-600 text-center hover:underline font-medium"
              >
                Read More
              </a>
            </div>
          </div>
          </div>

          
    {/* Divider Line only after first blog */}  
   {index === 0 && <hr className="mt-10 border-gray-600" />}
        </div>
      ))}
    </div>
    <Footer />
    </div>
  );
};

export default Blog;
