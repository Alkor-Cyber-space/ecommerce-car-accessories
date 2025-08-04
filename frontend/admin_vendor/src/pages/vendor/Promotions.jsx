import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Tag, Calendar, Users, TrendingUp, Award, ShoppingCart } from 'lucide-react';

const Promotions = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample promotional data
  const featuredPromotions = [
    {
      id: 1,
      title: "Summer Sale Extravaganza",
      discount: "Up to 50% OFF",
      description: "Massive discounts on brake pads, oil filters, and engine parts",
      image: "🚗",
      validUntil: "Aug 31, 2025",
      category: "Car Parts"
    },
    {
      id: 2,
      title: "Motorcycle Madness",
      discount: "Buy 2 Get 1 FREE",
      description: "Special offer on motorcycle chains, sprockets, and filters",
      image: "🏍️",
      validUntil: "Sep 15, 2025",
      category: "Bike Parts"
    },
    {
      id: 3,
      title: "Premium Oil Special",
      discount: "30% OFF",
      description: "Top quality engine oils and lubricants at unbeatable prices",
      image: "🛢️",
      validUntil: "Aug 25, 2025",
      category: "Oils & Lubricants"
    }
  ];

  const discountTypes = [
    { type: "Percentage Off", count: 24, color: "bg-blue-500", icon: <Tag size={20} /> },
    { type: "Buy X Get Y", count: 12, color: "bg-green-500", icon: <ShoppingCart size={20} /> },
    { type: "Free Shipping", count: 18, color: "bg-purple-500", icon: <TrendingUp size={20} /> },
    { type: "Bundle Deals", count: 8, color: "bg-orange-500", icon: <Award size={20} /> }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      location: "Mumbai",
      rating: 5,
      comment: "Amazing discounts on genuine parts! Saved 40% on my car's brake service.",
      avatar: "👨‍🔧"
    },
    {
      id: 2,
      name: "Priya Sharma",
      location: "Delhi",
      rating: 5,
      comment: "The motorcycle parts promotion was fantastic. Great quality at unbeatable prices!",
      avatar: "👩‍🔧"
    },
    {
      id: 3,
      name: "Arjun Patel",
      location: "Bangalore",
      rating: 4,
      comment: "Excellent customer service and genuine promotional offers. Highly recommended!",
      avatar: "👨‍💼"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredPromotions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredPromotions.length) % featuredPromotions.length);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Promotions & Offers</h1>
        <p className="text-gray-600">Manage and track your promotional campaigns for vehicle spare parts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {discountTypes.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${item.color} text-white p-3 rounded-lg`}>
                {item.icon}
              </div>
              <span className="text-2xl font-bold text-gray-800">{item.count}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.type}</h3>
            <p className="text-gray-600 text-sm">Active campaigns</p>
          </div>
        ))}
      </div>

      {/* Featured Promotions Carousel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Award className="mr-2 text-purple-600" />
          Featured Promotions
        </h2>
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" 
               style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {featuredPromotions.map((promo, index) => (
              <div key={promo.id} className="w-full flex-shrink-0">
                <div className="flex flex-col md:flex-row items-center p-8">
                  <div className="text-8xl mb-4 md:mb-0 md:mr-8">{promo.image}</div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      {promo.category}
                    </span>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{promo.title}</h3>
                    <p className="text-4xl font-bold text-purple-600 mb-2">{promo.discount}</p>
                    <p className="text-gray-600 mb-4">{promo.description}</p>
                    <div className="flex items-center justify-center md:justify-start text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      <span>Valid until {promo.validUntil}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Controls */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredPromotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Active Promotions Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Tag className="mr-2 text-blue-600" />
          Active Promotions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Brake Pad Special", discount: "25% OFF", category: "Brakes", items: "15 items", color: "bg-red-500" },
            { title: "Filter Festival", discount: "Buy 3 Get 1", category: "Filters", items: "32 items", color: "bg-blue-500" },
            { title: "Tire Tuesday", discount: "Free Installation", category: "Tires", items: "8 items", color: "bg-green-500" },
            { title: "Battery Bonanza", discount: "20% OFF", category: "Batteries", items: "12 items", color: "bg-yellow-500" },
            { title: "Spark Plug Sale", discount: "35% OFF", category: "Engine Parts", items: "28 items", color: "bg-purple-500" },
            { title: "Chain & Sprocket", discount: "Bundle Deal", category: "Bike Parts", items: "6 bundles", color: "bg-indigo-500" }
          ].map((promo, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className={`${promo.color} text-white p-3 rounded-lg w-fit mb-4`}>
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{promo.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mb-2">{promo.discount}</p>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{promo.category}</span>
                <span>{promo.items}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Users className="mr-2 text-green-600" />
          Customer Testimonials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Create New Promotion
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            View Analytics
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Export Report
          </button>
          <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default Promotions;