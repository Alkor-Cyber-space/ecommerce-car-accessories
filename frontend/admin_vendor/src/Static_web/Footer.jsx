import React from "react";
import simage from "../assets/simage.png.png";
import { Link } from "react-router-dom";
 // replace with your logo path

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#030130] to-[#023669] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Logo + About */}
        <div>
          <img src={simage} alt="carooa logo" className="h-20 mb-4" />
          <p className="text-gray-300 text-lg leading-relaxed">
            Drive Your Dreams – Quality Parts, Perfect Fit
          </p>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="font-bold text-lg mb-4">COMPANY INFO</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">Services</a></li>
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
          </ul>
        </div>

        {/* Connect With Us */}
        <div>
          <h3 className="font-bold text-lg mb-4">CONNECT WITH US</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white">Email</a></li>
            <li><a href="#" className="hover:text-white">Instagram</a></li>
            <li><a href="#" className="hover:text-white">Facebook</a></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h3 className="font-bold text-lg mb-4">INFORMATION</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><a href="#" className="hover:text-white"><Link to="/register">Signup As Vendor</Link></a></li>
            <li><a href="#" className="hover:text-white">Download App</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className=" border-gray-600 py-6 text-center text-gray-400 text-sm flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6">
        <p>copyright © 2020 - 24 carooa Pvt Ltd</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">carooa</a>
          <a href="#" className="hover:text-white">privacy policy</a>
          <a href="#" className="hover:text-white">terms and conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
