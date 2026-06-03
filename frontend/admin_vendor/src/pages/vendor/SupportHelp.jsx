import React, { useState } from "react";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { PiRocketLaunch, PiUserCircleDashedBold } from "react-icons/pi";
import { GoKey } from "react-icons/go";
import { Link } from "react-router-dom";

const SupportHelp = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const cards = [
    {
      icon: <PiRocketLaunch className="text-black w-5 h-5 mr-2" />,
      title: "Getting Started",
      desc: "Learn more about setting up your account. Explore key features and get the most.",
      link: "#",
    },
    {
      icon: <GoKey className="text-black w-5 h-5 mr-2" />,
      title: "Security and Protection",
      desc: "Keep your account safe with our advanced security measures.",
      link: "#",
    },
    {
      icon: <PiUserCircleDashedBold className="text-black w-5 h-5 mr-2" />,
      title: "Account",
      desc: "Manage your account settings, profile info, and more.",
      link: "#",
    },
  ];

  const faqs = [
    {
      question: "How do I add a new product?",
      answer:
        'Go to the “Product Management” section and click “Add Product”. Fill in the required details like product name, category, images, price, and specifications.',
    },
    {
      question: "How do I track customer orders?",
      answer:
        'Go to the "Orders" tab in your dashboard and click on individual orders to view their current status and tracking details.',
    },
    {
      question: "What happens when a customer requests a return?",
      answer: "You will be notified to review the return request and respond accordingly.",
    },
    {
      question: "When will I receive my earnings?",
      answer: "Earnings are disbursed weekly after a successful transaction and delivery.",
    },
    {
      question: "Is KYC mandatory?",
      answer: "Yes, completing KYC is mandatory to receive payouts.",
    },
    {
      question: "Can I respond to customer reviews?",
      answer: "Yes, you can reply to customer reviews from your dashboard under the 'Reviews' section.",
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page and follow the instructions.",
    },
    {
      question: "How do I contact support?",
      answer: "You can email support at admin@caroora.com or create a ticket using the 'Create a Ticket' button.",
    },
  ];

  return (
    <div className="p-6 sm:p-6 bg-gray-100 min-h-screen rounded-2xl text-[#1E1E2F]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#5737B4]">Support / Help</h1>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between min-h-[176px]"
          >
            <div className="flex items-center mb-2">
              {card.icon}
              <h3 className="text-base font-semibold text-gray-800">{card.title}</h3>
            </div>
            <p className="text-sm text-gray-600 flex-grow">{card.desc}</p>
            <a
              href={card.link}
              className="text-sm text-[#7F56D9] font-medium mt-4 hover:underline"
            >
              Learn More
            </a>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm flex flex-col lg:flex-row w-full gap-6">
        {/* Left Side */}
        <div className="lg:w-1/3">
          <h2 className="text-lg font-semibold mb-1">FAQs</h2>
          <p className="text-sm text-gray-600">Learn more about setting up your account.</p>
          <p className="text-sm text-gray-600 mb-2">Explore key features and get the most out of the platform.</p>
          <p className="text-sm text-[#5737B4] font-semibold">
            Send your queries at{" "}
            <span className="underline">admin@caroora.com</span>
          </p>
          <Link to="/vendor/createticket">
            <button className="border border-[#5737B4] text-[#5737B4] rounded mt-4 px-4 py-2 text-sm font-semibold hover:bg-[#5737B4] hover:text-white transition">
              Create a Ticket
            </button>
          </Link>
        </div>

        {/* Right Side */}
        <div className="lg:w-2/3 space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="py-2 border-b border-gray-200">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="font-medium text-sm sm:text-base">{faq.question}</h3>
                {openIndex === index ? (
                  <MdKeyboardArrowUp size={20} />
                ) : (
                  <MdKeyboardArrowDown size={20} />
                )}
              </div>
              {openIndex === index && (
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportHelp;
