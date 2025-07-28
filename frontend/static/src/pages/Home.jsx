import React from 'react';
// import brandLogo from '../assets/brandlogo.png';
import bgImage from '../assets/background.png';
import flag from '../assets/india flag.png'
import home1 from '../assets/home1.png';
import { FaSearch } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { IoCallOutline, IoSearchOutline } from 'react-icons/io5';
import { GiLobArrow } from 'react-icons/gi';
import OfferGallery from '../components/OfferSlider';
const Home = () => {
  return (
    <div
      className="h-screen text-white border-0 rounded-b-4xl shadow-lg"
      style={{
        background: 'radial-gradient(circle at center, #1f1f1f 0%, #000000 80%)',
      }}
    >      {/* login registerr Menu */}
      <div className='container mx-auto '>
        <div className="flex justify-between items-center py-3 bg-black/20 text-sm">
          <div className="flex gap-2">
            <a href="/login" className="hover:underline text-blue-300">Sign in</a>
            or
            <a href="/register" className="hover:underline text-blue-300">Register</a>
          </div>

          {/* Right side: Language */}
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={flag} alt="Language" className="h-10 w-10" />
            <div className="relative cursor-pointer text-white">
              <label className="mr-2">Language:</label>
              <select
                className="bg-black text-white text-sm px-2 py-1 border border-gray-600 rounded focus:outline-none"
                defaultValue="en"
                onChange={(e) => console.log('Selected language:', e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute w-[55%] h-[74%] z-0"
        style={{
          top: '62%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundImage: `url(${home1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1.2,
        }}
      ></div>


      {/* contact no. */}
      <div className="container  mx-auto flex items-center justify-between w-full h-[25%]">
        <div className="flex items-center text-white gap-2 text-xl whitespace-nowrap">
          <span className="text-white text-2xl">
            <IoCallOutline />
          </span>
          <span>+91 - 1234567890</span>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-4 w-full max-w-4xl">
          <div className="flex bg-transparent text-white rounded-full overflow-hidden w-full shadow-lg border-white border-[3px] p-1 h-[60px]">
            <div className="flex items-center px-4 text-white">
              <IoSearchOutline size={28} />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="flex-grow p-3 text-white bg-transparent focus:outline-none"
            />
            <div className="flex items-center border-l-[3px] rounded-lg border-white px-4 gap-2 text-white">
              <select className="bg-transparent text-white focus:outline-none appearance-none pr-6">
                <option>All Categories</option>
                <option>Body Parts</option>
                <option>Engine</option>
                <option>Accessories</option>
              </select>
              <GiLobArrow size={16} />
            </div>
          </div>
          {/* Search Button */}
          <button className="bg-[#0085AD] hover:bg-[#006b8b] 
                   text-white font-semibold border-0 px-[26px] py-2 text-3xl
                   rounded
                   shadow-md transition duration-200 ease-in-out tracking-wide">
            Search
          </button>

        </div>
      </div>

      {/* Hero background image layered over the gradient */}

      {/* <div data-aos="fade-down"></div>
      <div className="container mx-auto flex justify-center items-center h-[49%]">
        <img src={offerimg} alt="" />
      </div> */}

      <OfferGallery />

    </div>
  );
};

export default Home;
