import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Tag, Calendar, Users, TrendingUp, Award, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { editPromotionApi, getAllPromotionsApi, getCategoriesApi, getProductsByCategory, promotionByIdApi } from '../../services/allAPI';
import PromotionsList from '../PromotionList';
import CouponList from '../Coupons/CouponList';
import PromotionBanner from './PromotionBanner';

const Promotions = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setselectedPromotion] = useState(null);
  const [promotionDetails, setPromotionDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isEditModalOpen) {
      fetchCategories();
      // If editing, ensure categories/products are loaded for the selected promotion
      if (selectedPromotion) {
        const categoryIds = selectedPromotion.applicable_category
          ? selectedPromotion.applicable_category.map(cat => cat.id)
          : [];
        setSelectedCategories(categoryIds);
        if (categoryIds.length > 0) {
          getProductsByCategory(categoryIds[0]).then((response) => {
            setProducts(response.data);
          }).catch(() => setProducts([]));
        } else {
          setProducts([]);
        }
        setSelectedProducts(selectedPromotion.applicable_product
          ? selectedPromotion.applicable_product.map(prod => prod.id)
          : []
        );
      }
    } else {
      setProducts([]);
      setSelectedCategories([]);
      setSelectedProducts([]);
    }
  }, [isEditModalOpen]);

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesApi();
      setAllCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    try {
      const response = await getProductsByCategory(categoryId);
      setProducts(response.data);
      setSelectedCategories([categoryId]);
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      setMessage({ type: '', text: '' });

      const updatedData = {
        ...editFormData,
        applicable_category: selectedCategories,
        applicable_product: selectedProducts
      };

      await editPromotionApi(selectedPromotion.id, updatedData);
      setMessage({ type: 'success', text: 'Promotion updated successfully!' });
      setIsEditModalOpen(false);
      setselectedPromotion(null);
      // Optionally, refresh promotions list
      const data = await getAllPromotionsApi();
      setPromotions(Array.isArray(data.message) ? data.message : []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update promotion.' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedPromotion) {
      setEditFormData({
  name: selectedPromotion.name || '',
  description: selectedPromotion.description || '',
  value: selectedPromotion.value || '',
  start_date: selectedPromotion.start_date || '',
  end_date: selectedPromotion.end_date || '',
  applicable_category: selectedPromotion.applicable_category
    ? selectedPromotion.applicable_category.map(cat => cat.id)
    : [],
  applicable_product: selectedPromotion.applicable_product
    ? selectedPromotion.applicable_product.map(prod => prod.id)
    : []
});

    }
  }, [selectedPromotion]);

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    value: '',
    start_date: '',
    end_date: '',
    applicable_category: [],  // always an array
    applicable_product: []    // always an array
  });

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

  const navigate = useNavigate();

  const goToPromotionForm = () => {
    navigate('promotion-form');
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getAllPromotionsApi();
        console.log("Promotions API response:", data);
        setPromotions(Array.isArray(data.message) ? data.message : []);
      } catch (error) {
        console.error("Failed to load promotions:", error);
      }
    };
    fetchPromotions();
  }, []);

  const formatDiscount = (promo) => {
    if (promo.promotion_type === 'PERCENTAGE') {
      return `${promo.value}% OFF`;
    } else if (promo.promotion_type === 'FIXED') {
      return `₹${promo.value} OFF`;
    } else if (promo.promotion_type === 'BOGO') {
      return "Buy One Get One Free";
    } else {
      return promo.value || "Special Offer";
    }
  };

  const getCategoryNames = (promo) => {
    if (promo.applicable_category && promo.applicable_category.length > 0) {
      return promo.applicable_category.map(cat => cat.name || cat).join(", ");
    }
    return "General";
  };

  const getProductCount = (promo) => {
    if (promo.applicable_product && promo.applicable_product.length > 0) {
      return `${promo.applicable_product.length} items`;
    }
    return "0 items";
  };

  useEffect(() => {
    if (!selectedPromotion) return;

    const fetchPromotionDetails = async () => {
      try {
        const data = await promotionByIdApi(selectedPromotion.id);
        console.log("Fetched promotion details:", data);

        setPromotionDetails(data);
      } catch (error) {
        console.error('Error fetching promotion details:', error);
      }
    };

    fetchPromotionDetails();
  }, [selectedPromotion]);

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
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div> */}

      {/* Featured Promotions Carousel */}
      {/* <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Award className="mr-2 text-purple-600" />
          Featured Promotions
        </h2>
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {featuredPromotions.map((promo) => (
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


          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50">
            <ChevronRight size={24} className="text-gray-600" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredPromotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-purple-600' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
      </div> */}
      <PromotionBanner/>
      {/* Active Promotions Grid */}
      {/* <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Tag className="mr-2 text-blue-600" />
          Active Promotions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {promotions.length > 0 ? (
            promotions.map((promo) => (
              <div
                key={promo.id}
                onClick={() => setselectedPromotion(promo)}

                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="bg-[#5737B4] text-white p-3 rounded-lg w-fit mb-4">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{promo.name}</h3>
                <p className="text-2xl font-bold text-gray-800 mb-2">{formatDiscount(promo)}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    {promo.applicable_category && promo.applicable_category.length > 0
                      ? promo.applicable_category[0].name
                      : "No category"}
                  </span>

                  <span>{getProductCount(promo)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">No active promotions available.</p>
          )}
        </div>

      </div> */}
      <PromotionsList/>

      <CouponList/>

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
          <button onClick={goToPromotionForm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
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

      {selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#5737B4] p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10"></div>
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-10"
                onClick={() => setselectedPromotion(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative z-10">
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedPromotion.name}</h3>
                    <p className="text-blue-100 text-sm">Promotional Campaign Details</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Description Card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Description
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {selectedPromotion.description || "No description available"}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Discount Card */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Discount</p>
                      <p className="text-lg font-bold text-green-800">{formatDiscount(selectedPromotion)}</p>
                    </div>
                  </div>
                </div>

                {/* Value Card */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Value</p>
                      <p className="text-lg font-bold text-orange-800">₹{selectedPromotion.value}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Campaign Duration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Start Date</p>
                    <p className="text-gray-800 font-semibold">{new Date(selectedPromotion.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">End Date</p>
                    <p className="text-gray-800 font-semibold">{new Date(selectedPromotion.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Categories and Products Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Categories */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
                    <h4 className="font-semibold text-purple-800 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Categories
                    </h4>
                  </div>
                  <div className="p-4 max-h-32 overflow-y-auto">
                    {selectedPromotion.applicable_category && selectedPromotion.applicable_category.length > 0 ? (
                      selectedPromotion.applicable_category.map((cat, idx) => (
                        <div key={cat.id || `cat-${idx}`} className="flex items-center py-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          <span className="text-gray-700">{cat.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No categories assigned</p>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                    <h4 className="font-semibold text-indigo-800 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Products
                    </h4>
                  </div>
                  <div className="p-4 max-h-32 overflow-y-auto">
                    {selectedPromotion.applicable_product && selectedPromotion.applicable_product.length > 0 ? (
                      selectedPromotion.applicable_product.map((prod, idx) => (
                        <div key={prod.id || `prod-${idx}`} className="flex items-center py-1">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                          <span className="text-gray-700">{prod.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No products assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-6 py-2.5 bg-[#5737B4] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                onClick={() => setIsEditModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Promotion
              </button>
              <button
                className="px-6 py-2.5 bg-red-700 text-white rounded-lg font-medium hover:bg-red-500 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                onClick={() => alert(`Delete ${selectedPromotion.name}`)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <h3 className="text-xl font-bold mb-4">Edit Promotion</h3>

            {message.text && (
              <div className={`p-2 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Value"
                value={editFormData.value}
                onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="datetime-local"
                placeholder="Start Date"
                value={editFormData.start_date}
                onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="datetime-local"
                placeholder="End Date"
                value={editFormData.end_date}
                onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(allCategories) ? allCategories : []).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-3 py-1 rounded-full text-sm ${selectedCategories.includes(category.id) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {products.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Products</h4>
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelection(product.id)}
                      className={`px-3 py-1 rounded-full text-sm ${selectedProducts.includes(product.id) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                      {product.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-[#5737B4] text-white rounded hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveChanges}
                disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;