import { image } from 'framer-motion/client';
import React from 'react';
import { FaAward, FaTags, FaBullseye } from 'react-icons/fa';
import verified from '../assets/verified.png';
import affordable from '../assets/price.png';
import veriety from '../assets/wide.png';
const whyData = [
    {
        image: verified,
        title: 'Original Products',
        description:
            'We offer original and aftermarket spare parts for reliable vehicle or machinery maintenance. Choose OEM for guaranteed fit or cost-effective alternatives that meet industry standards.',
    },
    {
        image: affordable,
        title: 'Affordable Price',
        description:
            'Repairing a damaged vehicle can be costly for the owner. High-quality aftermarket products provide reliable performance at a lower price, making them ideal for restoring vehicles without sacrificing functionality.',
    },
    {
        image: veriety,
        title: 'Wide variety',
        description:
            'Our aftermarket products meet various needs. Apply the ‘Aftermarket’ filter in the catalogue to view tailored offerings.',
    },
];

const WhyChoose = () => {
    return (
        <div className="container max-w-7xl mx-auto px-4 py-12">
            <div className='mb-10'>
                <p className="text-5xl font-extrabold text-[#82828226] tracking-wide">Aftermarket Products</p>
                <p className="text-3xl font-bold text-[#070707] tracking-wide	" style={{ marginTop: '-30px' }}>Why Choose Aftermarket Products</p>

            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {whyData.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#D9D9D9] px-3 py-8 border rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.6)]
 text-left"
                    >
                        <img src={item.image} alt={item.title} className="h-12 " />
                        <h3 className="text-xl font-semibold text-black my-2">{item.title}</h3>
                        <p className="text-gray-700 text-md">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhyChoose;
