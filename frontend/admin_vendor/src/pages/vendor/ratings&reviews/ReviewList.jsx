import React from 'react'
import user from '../../../assets/user.jpg'
import { BsStar } from 'react-icons/bs'
import { Link } from 'react-router-dom'

const ReviewList = () => {
    return (
        <div className='mt-10'>
            <p className="font-medium my-3">Customer Reviews</p>
            <div className="space-y-4">
                <div className="bg-white shadow rounded  p-5">
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
                    <p className='w-3xl'>Excellent battery backup. My car starts instantly even on cold mornings. Highly recommended! Excellent battery backup. My car starts instantly even on cold mornings.</p> <Link className='text-[#5737B4] font-thin'>View more!</Link>
                </div>
                  <div className="bg-white shadow rounded  p-5">
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
                    <p className='w-3xl'>Excellent battery backup. My car starts instantly even on cold mornings. Highly recommended! </p> <Link className='text-[#5737B4] font-thin'>View more!</Link>
                </div>
            </div>
        </div>
    )
}

export default ReviewList