import React, { useState } from "react";
import { Link } from "react-router-dom";
import simage from "../assets/simage.png.png";

const Navbar = ({ bgColor = "bg-transparent" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <header
      className={`${bgColor} flex justify-between items-center py-3 px-6 w-full fixed top-0 left-0 z-50 text-white`}
    
    >
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img src={simage} alt="Logo" className="w-20 cursor-pointer" />
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-10 text-white font-medium">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/partner&category">Products & Categories</Link>
        <Link to="/parnterwithus">Partner With Us</Link>
        <Link to="/successstories">Success Stories</Link>
        <Link to="/contactsection">Contact Us</Link>
      </nav>

      {/* Download App Button (Desktop only) */}
      <div className="hidden md:block">
        <button className="bg-sky-500 hover:bg-sky-600 px-5 py-3 rounded-lg font-medium text-white">
          Download App
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden">
          <nav className="flex flex-col p-6 gap-4">
            <Link
              to="/"
              onClick={handleClose}
              className="text-gray-800 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={handleClose}
              className="text-gray-800 hover:text-blue-600"
            >
              About
            </Link>
            <Link
              to="/partner&category"
              onClick={handleClose}
              className="text-gray-800 hover:text-blue-600"
            >
              Products & Categories
            </Link>
            <Link
              to="/parnterwithus"
              onClick={handleClose}
              className="text-gray-800 hover:text-blue-600"
            >
              Partner With Us
            </Link>
            <Link
              to="/successstories"
              onClick={handleClose}
              className="text-gray-800 hover:text-blue-600"
            >
              Success Stories
            </Link>
            <Link
              to="/contactsection"
              onClick={handleClose}
              className="text-gray-800 hover:text-blue-600"
            >
              Contact Us
            </Link>

            <button className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-lg font-medium mt-4">
              Download App
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
