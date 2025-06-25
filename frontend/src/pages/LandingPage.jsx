import React from 'react';
// import brandLogo from '../assets/brandlogo.png';
import bgImage from '../assets/background.png'; // background image
import Home from './Home';
import Categories from './Categories';
import SearchByVehicle from '../components/SearchByVehicle';
import CarMakers from '../components/CarMakers';
import WhyChoose from '../components/WhyChoose';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        // <div
        //     className="h-screen bg-cover bg-center text-white"
        //     style={{ backgroundImage: `url(${bgImage})` }}
        // >
        //     {/* Top Bar with Logo and Right Menu */}
        //     <div className="flex justify-between items-center p-4 border-b border-gray-700 text-sm">
        //         {/* Left side: Login and Register */}
        //         <div className="flex gap-4">
        //             <a href="/login" className="hover:underline text-blue-300">Login</a>
        //             <a href="/register" className="hover:underline text-blue-300">Register</a>
        //         </div>

        //         {/* Right side: Language */}
        //         <div className="flex items-center gap-2 cursor-pointer">
        //             <img src="/india-flag.png" alt="Language" className="h-4 w-6" />
        //             <span>English</span>
        //         </div>
        //     </div>



        //     {/* Search Bar Section */}
        //     <div className="flex flex-col items-center justify-center h-[80%] px-4">
        //         <div className="flex bg-white rounded-full overflow-hidden w-full max-w-3xl shadow-lg">
        //             <input
        //                 type="text"
        //                 placeholder="Search anything..."
        //                 className="flex-grow p-4 text-black focus:outline-none"
        //             />
        //             <select className="bg-gray-200 text-black px-4">
        //                 <option>All Categories</option>
        //                 <option>Body Parts</option>
        //                 <option>Engine</option>
        //                 <option>Accessories</option>
        //             </select>
        //             <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
        //                 Search
        //             </button>
        //         </div>
        //     </div>
        // </div>
<>
            <Home/>
            <SearchByVehicle/>
            <Categories/>
            <WhyChoose/>
            <CarMakers/>
            <Footer/>
</>
    );
};

export default LandingPage;
