import React, { useEffect, useState } from 'react'
import user from '../../../assets/user.jpg'
import { BsStar, BsStarFill } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { getProductReviewsApi } from '../../../services/allAPI'

const ReviewList = () => {
    const [reviews, setReviews] = useState([])
    const serverurl = "http://127.0.0.1:8000/"
    const [expandedReviews, setExpandedReviews] = useState({}) // track expanded state

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getProductReviewsApi();
                console.log("API Response:", data.reviews);
                setReviews(data.reviews);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchReviews();
    }, []);
    const renderStars = (rating) => {
        const totalStars = 5;
        const stars = [];

        for (let i = 1; i <= totalStars; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(<BsStarFill key={i} className="text-yellow-500" />);
            } else {
                stars.push(<BsStar key={i} className="text-gray-300" />);
            }
        }

        return <div className="flex gap-1">{stars}</div>;
    };
    return (
        <div className='mt-10 '>
            <p className="font-medium my-3">Customer Reviews</p>

            <div className="space-y-4 w-full lg:w-full sm:w-xl">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white shadow rounded p-5">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-8 items-center">
                                {/* user avatar (fallback for now) */}
                                <img
                                    src={
                                        review.product?.product_image
                                            ? `${serverurl}${review.product.product_image}`
                                            : user
                                    }
                                    className="w-11 h-11 rounded-lg"
                                    alt={review.product?.name}
                                />

                                <p className="font-medium lg:text-lg sm:text-sm">
                                    {review.user_name}
                                </p>
                                <span className="lg:text-lg sm:text-sm font-medium text-[#5737B4]">
                                    {review.product?.name}
                                </span>
                                <p className="lg:text-lg sm:text-sm text-gray-700">
                                    Date : {new Date(review.created_at).toLocaleDateString()} , Time :{" "}
                                    {new Date(review.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            {/* <div className="bg-[#5737B4] text-white rounded-lg px-2.5 py-2 cursor-pointer lg:text-md sm:text-sm">
                                Reply to Review
                            </div> */}
                        </div>

                        <div className="flex gap-4 py-2">
                            <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
                            </div>

                            <p className="font-semibold">
                                {review.comment?.length > 50
                                    ? review.comment.substring(0, 50) + "..."
                                    : review.comment}
                            </p>
                        </div>

                        <p className="lg:w-3xl sm:w-lg">
                            {expandedReviews[review.id]
                                ? review.comment
                                : review.comment?.substring(0, 100) + (review.comment?.length > 100 ? "..." : "")}
                        </p>

                        {/* Show "View more / less" only if needed */}
                        {review.comment?.length > 100 && (
                            <button
                                onClick={() =>
                                    setExpandedReviews((prev) => ({
                                        ...prev,
                                        [review.id]: !prev[review.id],
                                    }))
                                }
                                className="text-[#5737B4] font-thin mt-1"
                            >
                                {expandedReviews[review.id] ? "View less" : "View more"}
                            </button>
                        )}

                    </div>
                ))}
            </div>
            <h2 className='underline text-green-700'>dumy design</h2>
            <div className="bg-white shadow rounded  p-5 mt-4">
                <div className='flex justify-between items-center'>
                    <div className='flex gap-8 items-center '>
                        <img src={user} className='w-11 h-11 rounded-lg' alt="" />
                        <p className='font-medium text-lg'>Emily T</p>
                        <span className=" text-lg font-medium text-[#5737B4] ">Bosch Car Battery</span>
                        <p className="text-lg text-gray-700">Date : 20 May 2025, Time : 3:20 PM</p>
                    </div>
                    <div className="bg-[#5737B4]  text-white rounded-lg px-2.5 py-2 cursor-pointer text-md">Replay to Review</div>
                </div>
                <div className='flex gap-4 py-2'>
                    <p className='flex gap-3 items-center'><BsStar className='text-yellow-600' /> 4.5</p>
                    <p className='font-semibold'>Excellent Product</p>
                </div>
                <p className='lg:w-3xl sm:w-lg'>Excellent battery backup. My car starts instantly even on cold mornings. Highly recommended! </p> <Link className='text-[#5737B4] font-thin'>View more!</Link>
            </div>
        </div>
    )
}

export default ReviewList