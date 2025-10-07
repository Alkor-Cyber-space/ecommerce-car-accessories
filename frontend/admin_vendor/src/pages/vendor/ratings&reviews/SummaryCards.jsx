import React, { useState } from 'react';
import { BsStar } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import userImage from '../../../assets/user.jpg';
import car from '../../../assets/car.jpeg'
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getProductReviewsApi } from '../../../services/allAPI';

const data = [
  { month: 'Jan', reviews: 90 },
  { month: 'Feb', reviews: 100 },
  { month: 'Mar', reviews: 85 },
  { month: 'Apr', reviews: 120 },
  { month: 'May', reviews: 95 },
  { month: 'Jun', reviews: 130 },
];

// const ratings = [
//   { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
//   { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
//   { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
//   { name: "Aryan Sharma", product: "Alloy Wheel XZR15", rating: 4.5 },
// ];

const SummaryCards = () => {
  const [reviewsData, setReviewsData] = useState({
    total_reviews: 0,
    monthly_reviews: [],
    products: [],
    reviews: [],
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getProductReviewsApi();
        console.log("API Responseee", data);
        setReviewsData(data); // save entire response
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchReviews();
  }, []);
  const chartData = reviewsData.monthly_reviews.map((item) => ({
    month: item.month,
    reviews: item.count,
  }));


  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Total Reviews Card */}
      <div className="bg-white w-full lg:w-1/2 sm:w-xl p-6 rounded-xl shadow">
        <div className="flex items-center gap-2 font-semibold mb-6">
          <BsStar /> Total Reviews <span className="text-xl font-bold "> {reviewsData.total_reviews}</span>

        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="reviews"
                fill="#A66CFF"
                radius={[4, 4, 0, 0]}
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <hr className="text-[#D8D8D8] my-3" />
        <div className="mt-3 text-right">
          <Link className="text-sm text-[#5737B4]">Download Report</Link>
        </div>
      </div>

      {/* Total Ratings Card */}
      <div className="bg-white w-full lg:w-1/2 sm:w-xl p-6 rounded-xl shadow">
        <div className="flex gap-2 items-center font-semibold mb-6">
          <BsStar /> Total Ratings
        </div>
        <div className="overflow-auto max-h-60 scrollbar-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Product Details</th>
                <th className="py-2">Ratings</th>
              </tr>
            </thead>
            <tbody>
              {reviewsData?.products?.length > 0 ? (
                reviewsData.products.map((product, index) => (
                  <tr key={index} className="border-b align-middle">
                    <td className="py-3">{product.name}</td>
                    <td className="py-3 text-[#5737B4] font-semibold">
                      <div className="flex items-center gap-1">
                        {product.average_rating || 0}
                        <span className="text-yellow-400">⭐</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-3 text-gray-500">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
};

export default SummaryCards;
