import React from "react";
import roadbg from "../assets/road.png";
import maruti from '../assets/maruti.png'
import hyundai from '../assets/hyundai.png'
import { Button } from "react-bootstrap";
// Update with your background image path
// const carMakers = [
//     "Maruti", "Hyundai", "Mahindra", "Tata", "Chevrolet", "Honda",
//     "Skoda", "VW", "Toyota", "Nissan", "Ford", "Kia"
// ];
const carMakers = [
    {
        name: "Maruti",
        logo: maruti
    },
    {
        name: "Hyundai",
        logo: hyundai
    },
    {
        name: "Maruti",
        logo: maruti
    },
    {
        name: "Hyundai",
        logo: hyundai
    },
    {
        name: "Maruti",
        logo: maruti
    },
    {
        name: "Hyundai",
        logo: hyundai
    },
    {
        name: "Maruti",
        logo: maruti
    },
    {
        name: "Hyundai",
        logo: hyundai
    },
    {
        name: "Maruti",
        logo: maruti
    },
    {
        name: "Hyundai",
        logo: hyundai
    },
    {
        name: "Maruti",
        logo: maruti
    },
    {
        name: "Hyundai",
        logo: hyundai
    },

]

const CarMakers = () => {
    return (
        <>
            <div className="container m-auto">
                <p className="text-5xl font-extrabold text-[#82828226] tracking-wide">Car Makers</p>
                <p className="text-3xl font-bold text-[#070707] tracking-wide	" style={{ marginTop: '-30px' }}>Popular Car Makers</p>

            </div>
            <div className="relative w-full bg-black overflow-hidden py-12">
                {/* Background road image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: `url(${roadbg})` }}
                ></div>

                {/* Overlay gradient for fading edges */}
                {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent "></div> */}

                <div className="relative z-10 px-16 text-center">
                    {/* Cards grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {carMakers.map((maker, index) => (
                            <div
                                key={index}
                                className="bg-[#0808084A] backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.9)] rounded-xl flex items-center justify-center px-4 py-6 text-lg font-semibold text-white hover:scale-105 transition duration-300"
                            >
                                <img src={maker.logo} alt={maker.name} className="h-12" />
                                {maker.name.toUpperCase()}
                            </div>

                        ))}
                    </div>
                </div>
          
                <div className="flex justify-center mt-10">
                    <button className="border-2 border-white text-white text-2xl font-semibold px-6 py-2 rounded hover:bg-white hover:text-black transition duration-300">
                        View All
                    </button>
                </div>

            </div>
        </>
    );
}
export default CarMakers;
