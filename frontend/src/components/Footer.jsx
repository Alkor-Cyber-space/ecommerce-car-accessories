import React from 'react';
import { FaGooglePlay, FaApple, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import footer from '../assets/footerbg.png';
import razorpay from '../assets/razorpay.png';
import stripe from '../assets/stripe.jpg';
import paypal from '../assets/paypal.png';
const Footer = () => {
  return (
    <footer className="bg-[#D9D9D9] text-black mt-10">
      {/* Download Section */}
      <div className="max-w-7xl m-auto  py-15 flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <p className="text-5xl font-bold text-[#292929] tracking-wide">Download<br />Our Mobile App</p>
          <p className="m-2 py-3 text-xl text-gray-700 w-75 tracking-wide">Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 border-3  px-3  rounded bg-white hover:bg-gray-100 transition duration-300">
            <FaGooglePlay size={55} />
            <div className='flex flex-col items-start'>
              <span className='text-xl font-semibold uppercase'>get it on</span>
              <span className='text-4xl font-semibold'>Google Play</span>
            </div>
          </button>
          <button className="flex items-center gap-3 border-3 px-3  py-1 rounded bg-white hover:bg-gray-100 transition duration-300">
            <FaApple size={61} />
            <div className='flex flex-col items-start'>
              <span className='text-2xl font-semibold  '>Download</span>
              <span className='text-4xl font-semibold'>App Store</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div
        className="text-white py-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${footer})` }}
      >
        <div className="mx-auto px-7 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Contact */}
          <div>
            <h5 className="font-bold my-3">CONTACT</h5>
            <div className="flex flex-col items-start">
              <p>contacttest@gmail.com</p>
              <p>+91-1234567890</p>
              <p>+91-1234567890</p>
            </div>
            <div className="flex gap-2 text-xl">
              <div className='border bg-white rounded-full text-black p-1'><FaWhatsapp /></div>
              <div className='border bg-white rounded-full text-black p-1'><FaInstagram /></div>

            </div>
          </div>

          {/* Discounted Products */}
          <div>
            <h5 className="font-bold my-3 ">DISCOUNTED PRODUCTS</h5>
            <div className="flex flex-col items-start">
              <p>50% Discount</p>
              <p>30% Discount</p>
              <p>10% Discount</p>
              <p>05% Discount</p>                     
            </div>
            

          </div>

          {/* Account */}
          <div>
            <h5 className="font-bold  my-3">ACCOUNT</h5>
            <div className="flex flex-col items-start">
              <p>Sign-In</p>
              <p>Create an Account</p>
              <p>Delivery Timelines</p>
              <p>Returns and Refund</p>
              <p>Privacy Policy</p>
              <p>About Us</p>
            </div>
            {/* <ul className="space-y-1 text-gray-100 text-left w-full">
              <li>Sign-In</li>
              <li>Create an Account</li>
              <li>Delivery Timelines</li>
              <li>Returns and Refund</li>
              <li>Privacy Policy</li>
              <li>About Us</li>
            </ul> */}

          </div>

          {/* Payment Options */}
          <div >
            <h5 className="font-bold my-3">PAYMENT OPTIONS</h5>
           <div className='flex flex-col items-start gap-3'>
              <div>
                <img src={razorpay} alt="Razorpay" className="h-6" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex gap-3">
                  <img src={stripe} alt="Stripe" className="h-9 bg-white z-10 rounded shadow-md" />
                  <img src={paypal} alt="PayPal" className="h-9 bg-white z-10 rounded shadow-md" />
                </div>
              </div>
           </div>
          </div>
        </div>
      </div>

      <div className='bg-[#292929] text-white ' style={{
        background: 'radial-gradient( #1f1f1f 0%, #000000 80%)',
      }}>
        <p className="text-center text-xl text-white py-4">
          Copyright@www.test.com 2025. All rights reserved
        </p>
      </div>

    </footer>
  );
};

export default Footer;
