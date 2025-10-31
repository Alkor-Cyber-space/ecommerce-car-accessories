import React, { useEffect, useState } from 'react';
import { BsArrowLeft, BsTag, BsPercent, BsGift, BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';
import { AiOutlinePlus, AiOutlineCalendar } from 'react-icons/ai';
import { createCouponApi, createPromotionApi, getCategoriesByAll, getProductsByCategory } from '../../services/allAPI';

const PromotionCouponForm = () => {
  const [activeTab, setActiveTab] = useState('promotion');
  const [promotionData, setPromotionData] = useState({
    name: '',
    code: '',
    description: '',
    promotion_type: 'percentage',
    value: '',
    start_date: '',
    end_date: '',
    activate: true,
    category: '',
    products: [],
    min_price: 0,
    max_price: 1000
  });

  const [formRows, setFormRows] = useState([
    {
      category: '',
      products: [],
      min_price: 0,
      max_price: 2000
    }
  ]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...formRows];
    updatedRows[index][field] = value;
    setFormRows(updatedRows);
  };

  const addRow = () => {
    setFormRows([...formRows, {
      category: '',
      products: [],
      min_price: 0,
      max_price: 2000
    }]);
  };

  const deleteRow = (index) => {
    const updatedRows = formRows.filter((_, i) => i !== index);
    setFormRows(updatedRows);
  };



  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesByAll();
        setCategories(data);
        console.log("Categories fetched:", data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchProductsForCategory = async (categoryId) => {
    try {
      const products = await getProductsByCategory(categoryId);
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, products } : cat
        )
      );
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleCheckboxChange = (productId, checked) => {
    setSelectedProducts((prev) => {
      const newSelected = { ...prev };
      if (checked) {
        newSelected[productId] = true;
      } else {
        delete newSelected[productId];
      }
      return newSelected;
    });
  };


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePromotionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPromotionData({
      ...promotionData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  const submitPromotion = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    if (
      !promotionData.name ||
      !promotionData.code ||
      !promotionData.description ||
      !promotionData.promotion_type ||
      (!promotionData.value && promotionData.promotion_type !== 'BOGO') || 
      !promotionData.start_date ||
      !promotionData.end_date
    ) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setIsSubmitting(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 10000);
      return;
    }

    for (let row of formRows) {
      if (!row.category) {
        setMessage({ type: 'error', text: 'Please select a category in all rows.' });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const applicable_category = [...new Set(
        formRows.map(row => row.category).filter(Boolean)
      )];

      const applicable_product = formRows.reduce((acc, row) => {
        if (row.products && row.products.length > 0) {
          acc.push(...row.products);
        }
        return acc;
      }, []);

      const payload = {
        ...promotionData,
        value: promotionData.promotion_type === 'BOGO' ? 0 : promotionData.value,
        applicable_category: applicable_category,
        applicable_product: applicable_product,
        details: formRows.map(row => ({
          ...row,
          category_name: categories.find(cat => cat.id === row.category)?.name,
          selected_products: row.products.map(productId => {
            const product = row.productsList?.find(p => p.id === productId);
            return {
              id: productId,
              name: product?.name
            };
          })
        }))
      };

      console.log('Sending payload:', payload);

      const response = await createPromotionApi(payload);

      setMessage({ type: 'success', text: 'Promotion created successfully!' });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 10000);

      setPromotionData({
        name: '',
        code: '',
        description: '',
        promotion_type: 'percentage',
        value: '',
        start_date: '',
        end_date: '',
        activate: true,
      });

      setFormRows([{
        category: '',
        products: [],
        min_price: 0,
        max_price: 2000
      }]);

    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating promotion. Please try again.' });
      console.error("API error:", error.response ? error.response.data : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const submitPromotion = async () => {
  //   setIsSubmitting(true);
  //   setMessage({ type: '', text: '' });

  //   if (!promotionData.name || !promotionData.code || !promotionData.description || !promotionData.promotion_type || !promotionData.value || !promotionData.start_date || !promotionData.end_date) {
  //     setMessage({ type: 'error', text: 'Please fill in all required fields.' });
  //     setIsSubmitting(false);

  //     // Clear the message after 10 seconds
  //     setTimeout(() => {
  //       setMessage({ type: '', text: '' });
  //     }, 10000);

  //     return;
  //   }


  //   for (let row of formRows) {
  //     if (!row.category) {
  //       setMessage({ type: 'error', text: 'Please select a category in all rows.' });
  //       setIsSubmitting(false);
  //       return;
  //     }
  //   }

  //   try {
  //     // Collect applicable categories and products from formRows
  //     const applicable_category = [...new Set(
  //       formRows.map(row => row.category).filter(Boolean)
  //     )];
  //     // unique categories
  //     const applicable_product = formRows.reduce((acc, row) => {
  //       if (row.products && row.products.length > 0) {
  //         acc.push(...row.products);
  //       }
  //       return acc;
  //     }, []);

  //     const payload = {
  //       ...promotionData,
  //       applicable_category,
  //       applicable_product,
  //       details: formRows,  // optional, depending on API
  //     };

  //     const response = await createPromotionApi(payload);
  //     setMessage({ type: 'success', text: 'Promotion created successfully!' });
  //     setTimeout(() => {
  //       setMessage({ type: '', text: '' });
  //     }, 10000);
  //     console.log('Promotion response:', response);

  //     // Reset form
  //     setPromotionData({
  //       name: '',
  //       code: '',
  //       description: '',
  //       promotion_type: 'percentage',
  //       value: '',
  //       start_date: '',
  //       end_date: '',
  //       activate: true,
  //     });
  //     setFormRows([{
  //       category: '',
  //       products: [],
  //       min_price: 0,
  //       max_price: 2000
  //     }]);
  //   } catch (error) {
  //     setMessage({ type: 'error', text: 'Error creating promotion. Please try again.' });
  //     console.error("API error:", error.response ? error.response.data : error.message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // 
  const [couponData, setCouponData] = useState({
    name: '',
    code: '',
    discount_value: '',
    min_purchase_amount: 0,
    start_date: '',
    end_date: '',
    activate: true,
    useage_limit: 1,
    applicable_products: []
  });

  const [couponRows, setCouponRows] = useState([
    {
      applicable_products: [],
      min_purchase_amount: 0,
      max_purchase_amount: 2000
    }
  ]);

  // Handle changes in individual coupon rows
  const handleCouponRowChange = (index, field, value) => {
    const updatedRows = [...couponRows];
    updatedRows[index][field] = value;
    setCouponRows(updatedRows);
  };

  // Add a new row
  const addCouponRow = () => {
    setCouponRows([...couponRows, {
      applicable_products: [],
      min_purchase_amount: 0,
      max_purchase_amount: 2000
    }]);
  };

  // Delete a row
  const deleteCouponRow = (index) => {
    const updatedRows = couponRows.filter((_, i) => i !== index);
    setCouponRows(updatedRows);
  };


  const getPromotionTypeColor = (type) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-600';
      case 'fixed':
        return 'bg-green-100 text-green-600';
      case 'BOGO':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  const handleCouponChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponData({
      ...couponData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };


  const submitCoupon = async () => {
  setIsSubmitting(true);
  setMessage({ type: '', text: '' });

  if (!couponData.name.trim() || !couponData.code.trim() || !couponData.discount_value || !couponData.start_date || !couponData.end_date) {
    setIsSubmitting(false);
    setMessage({ type: 'error', text: 'Please fill all required fields.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 10000);
    return;
  }

  try {
    const response = await createCouponApi({
      ...couponData,
      applicable_products: couponData.applicable_products || []
    });

    setMessage({ type: 'success', text: 'Coupon created successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 10000);

    setCouponData({
      name: '',
      code: '',
      discount_value: '',
      min_purchase_amount: 0,
      start_date: '',
      end_date: '',
      activate: true,
      useage_limit: 1,
      applicable_products: []
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    setMessage({ type: 'error', text: 'Error creating coupon. Please try again.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 10000);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#5737B4]"
        >
          <BsArrowLeft className="text-lg" />
          Back to Dashboard
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
          ? 'bg-green-100 border border-green-300 text-green-700'
          : 'bg-red-100 border border-red-300 text-red-700'
          }`}>
          {message.type === 'success' ? <BsCheckCircle className="text-lg" /> : <BsExclamationCircle className="text-lg" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">Marketing Manager</h1>
              {activeTab === 'promotion' ? (
                <BsPercent className="text-[#5737B4] text-xl" />
              ) : (
                <BsGift className="text-[#5737B4] text-xl" />
              )}
            </div>
            <p className="text-gray-600">Create and manage promotions & coupons</p>
          </div>

          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${getPromotionTypeColor(
              activeTab === 'promotion' ? promotionData.promotion_type : 'coupon'
            )}`}>
              {activeTab === 'promotion' ? `${promotionData.promotion_type} Promotion` : 'Discount Coupon'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('promotion')}
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'promotion'
              ? 'bg-[#5737B4] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#5737B4]'
              }`}
          >
            <BsPercent className="text-lg" />
            <span>Create Promotion</span>
          </button>
          <button
            onClick={() => setActiveTab('coupon')}
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'coupon'
              ? 'bg-[#5737B4] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#5737B4]'
              }`}
          >
            <BsGift className="text-lg" />
            <span>Create Coupon</span>
          </button>
        </div>

        {activeTab === 'promotion' ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Basic Information</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Promotion Name *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter promotion name"
                      value={promotionData.name}
                      onChange={handlePromotionChange}
                      required
                      className="w-full p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Promotion Code *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg relative">
                    <BsTag className="absolute left-3 top-3 text-gray-400" />
                    <input
                      name="code"
                      type="text"
                      placeholder="PROMO2024"
                      value={promotionData.code}
                      onChange={handlePromotionChange}
                      required
                      className="w-full pl-10 p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg">
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe your promotion..."
                  value={promotionData.description}
                  onChange={handlePromotionChange}
                  className="w-full p-3 bg-transparent focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Promotion Details */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Promotion Details</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Promotion Type *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <select
                      name="promotion_type"
                      value={promotionData.promotion_type}
                      onChange={handlePromotionChange}
                      className="w-full p-3 bg-transparent focus:outline-none"
                    >
                      <option value="select" disabled>Select Option</option>
                      <option value="percentage">Percentage Discount</option>
                      <option value="FIXED">Fixed Amount Off</option>
                      <option value="BOGO">Buy One Get One</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Value {promotionData.promotion_type !== "BOGO" && '*'}</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <input
                      name="value"
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                      value={promotionData.value}
                      onChange={handlePromotionChange}
                      required={promotionData.promotion_type !== "BOGO"}  // ✅ Apply conditional required attribute
                      className="w-full p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>



            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Date Range</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg relative">
                    <AiOutlineCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      name="start_date"
                      type="datetime-local"
                      value={promotionData.start_date}
                      onChange={handlePromotionChange}
                      required
                      className="w-full pl-10 p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Date *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg relative">
                    <AiOutlineCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      name="end_date"
                      type="datetime-local"
                      value={promotionData.end_date}
                      onChange={handlePromotionChange}
                      required
                      className="w-full pl-10 p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>



              </div>
            </div>
            <div className="space-y-4 w-full">
              {formRows.map((row, index) => (
                <div key={index} className="flex gap-4 w-full items-start bg-white border border-gray-200 rounded-lg p-4">

                  {/* Category */}
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Category <span className='text-red-500'>*</span>
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg">
                      <select
                        value={row.category}
                        onChange={async (e) => {
                          const categoryId = e.target.value; // keep as string for API compatibility
                          handleRowChange(index, 'category', categoryId);

                          // Fetch products for this category and update the row
                          try {
                            const productsList = await getProductsByCategory(categoryId); // call your API here
                            handleRowChange(index, 'productsList', productsList);
                            handleRowChange(index, 'products', []); // Reset selected products
                          } catch (error) {
                            console.error("Error loading products:", error);
                          }
                        }}
                        required
                        className="w-full p-3 bg-transparent focus:outline-none"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories
                          .filter(category => category.available === true)
                          .map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Products</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {row.productsList && row.productsList.length > 0 ? (
                        row.productsList.map((product) => (
                          <div key={product.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={row.products.includes(product.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const selectedProducts = row.products;
                                const updatedProducts = checked
                                  ? [...selectedProducts, product.id]
                                  : selectedProducts.filter((id) => id !== product.id);
                                handleRowChange(index, 'products', updatedProducts);
                              }}
                              className="h-4 w-4 border-gray-300 rounded"
                              style={{ accentColor: '#5737B4' }}
                            />
                            <label className="ml-2 text-sm text-gray-700">{product.name}</label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Select a category to load products</p>
                      )}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Price Range</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${row.min_price}</span>
                        <span>${row.max_price}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="10"
                        value={row.min_price}
                        onChange={(e) => handleRowChange(index, 'min_price', Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: '#5737B4' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="10"
                        value={row.max_price}
                        onChange={(e) => handleRowChange(index, 'max_price', Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: '#5737B4' }}
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex flex-col justify-between">
                    <button
                      type="button"
                      onClick={() => deleteRow(index)}
                      className="text-red-500 hover:text-red-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                      title="Delete Row"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Another Row Button */}
              <div className="text-center w-full">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center justify-center gap-2 bg-[#5737B4] text-white px-6 py-2 rounded-lg hover:bg-[#4A2B9F]"
                >
                  <AiOutlinePlus />
                  Add Another Category
                </button>
              </div>
            </div>


            {/* Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Settings</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <input
                    name="activate"
                    type="checkbox"
                    checked={promotionData.activate}
                    onChange={handlePromotionChange}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#5737B4' }}
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Activate promotion immediately
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={submitPromotion}
                disabled={isSubmitting}
                className={`bg-[#5737B4] text-white px-6 py-3 rounded-lg hover:bg-[#4A2B9F] transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <AiOutlinePlus />
                    Create Promotion
                  </>
                )}
              </button>
              <button
                onClick={() => setPromotionData({
                  name: '',
                  code: '',
                  description: '',
                  promotion_type: 'percentage',
                  value: '',
                  start_date: '',
                  end_date: '',
                  activate: true,
                })}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Basic Information</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Coupon Name *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter coupon name"
                      value={couponData.name}
                      onChange={handleCouponChange}
                      required
                      className="w-full p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Coupon Code *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg relative">
                    <BsTag className="absolute left-3 top-3 text-gray-400" />
                    <input
                      name="code"
                      type="text"
                      placeholder="COUPON2024"
                      value={couponData.code}
                      onChange={handleCouponChange}
                      required
                      className="w-full pl-10 p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Discount Value (%) *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <input
                      name="discount_value"
                      type="number"
                      step="0.01"
                      placeholder="15.00"
                      value={couponData.discount_value}
                      onChange={handleCouponChange}
                      required
                      className="w-full p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Now Minimum Purchase and Usage Limit */}

              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Minimum Purchase Amount</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    name="min_purchase_amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={couponData.min_purchase_amount}
                    onChange={handleCouponChange}
                    className="w-full p-3 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Usage Limit</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    name="useage_limit"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={couponData.useage_limit}
                    onChange={handleCouponChange}
                    className="w-full p-3 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Date Range</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg relative">
                    <AiOutlineCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      name="start_date"
                      type="datetime-local"
                      value={couponData.start_date}
                      onChange={handleCouponChange}
                      required
                      className="w-full pl-10 p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Date *</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg relative">
                    <AiOutlineCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      name="end_date"
                      type="datetime-local"
                      value={couponData.end_date}
                      onChange={handleCouponChange}
                      required
                      className="w-full pl-10 p-3 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Settings</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <input
                    name="activate"
                    type="checkbox"
                    checked={couponData.activate}
                    onChange={handleCouponChange}
                    className="h-4 w-4 text-[#5737B4] border-gray-300 rounded focus:ring-[#5737B4]"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Activate coupon immediately
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={submitCoupon}
                disabled={isSubmitting}
                className={`bg-[#5737B4] text-white px-6 py-3 rounded-lg hover:bg-[#4A2B9F] transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <AiOutlinePlus />
                    Create Coupon
                  </>
                )}
              </button>
              <button
                onClick={() => setCouponData({
                  name: '',
                  code: '',
                  discount_value: '',
                  min_purchase_amount: 0,
                  start_date: '',
                  end_date: '',
                  activate: true,
                  useage_limit: 1,
                })}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionCouponForm;