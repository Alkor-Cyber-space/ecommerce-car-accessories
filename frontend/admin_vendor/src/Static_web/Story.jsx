import React from "react";
import work from "../assets/workshop.jpeg";
import profil from "../assets/seller1.png";
import { IoCheckmark } from "react-icons/io5";

const caseStudies = [
  {
    company: "Raghav Auto Solutions (Accessories)",
    challenge:
      "Great catalogue, limited online reach and inconsistent payments elsewhere.",
    why: "Great catalogue, limited online reach and inconsistent payments elsewhere.",
    what: "Cleaned product data, added compatibility tags (make/model/year), refreshed images, and enabled order tracking.",
    result:
      "Higher product visibility, faster report access, and steady, on-schedule products.",
    src: work,
    profile: profil,
  },
  {
    company: "Meera Enterprises (Batteries)",
    challenge: "Frequent order cancellations due to unclear fitment details.",
    why: "Standardized titles, added vehicle compatibility, and published a simple installation guide.",
    what: "Fitment guidance and clear listing templates.",
    result: "Fewer returns, better ratings, and improved customer confidence.",
    src: work,
    profile: profil,
  },
  {
    company: "Raghav Auto Solutions (Accessories)",
    challenge:
      "Great catalogue, limited online reach and inconsistent payments elsewhere.",
    why: "Great catalogue, limited online reach and inconsistent payments elsewhere.",
    what: "Cleaned product data, added compatibility tags (make/model/year), refreshed images, and enabled order tracking.",
    result:
      "Higher product visibility, faster report access, and steady, on-schedule products.",
    src: work,
    profile: profil,
  },
  {
    company: "Meera Enterprises (Batteries)",
    challenge: "Frequent order cancellations due to unclear fitment details.",
    why: "Standardized titles, added vehicle compatibility, and published a simple installation guide.",
    what: "Fitment guidance and clear listing templates.",
    result: "Fewer returns, better ratings, and improved customer confidence.",
    src: work,
    profile: profil,
  },
];

const Story = () => {
  return (
    <div className="font-sans text-gray-800 min-h-screen flex flex-col">
      <h1 className="text-5xl font-bold text-center pb-12">SUCCESS STORIES</h1>

      <div className="p-8 space-y-16 font-sans bg-gray-50">
        {caseStudies.map((item, index) => (
          <div key={index} className="space-y-6">
            {/* Company Name always on top */}
            <h2 className="text-2xl font-bold text-indigo-700 text-left">
              {item.company}
            </h2>

            {/* Grid Content (Image + Text) */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Text Section */}
              <div
                className={`space-y-6 ${
                  index % 2 !== 0 ? "md:order-2" : "md:order-1"
                } text-left`}
              >
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2">
                      <IoCheckmark className="w-5 h-5" />
                      <h3 className="font-semibold text-gray-800">Challenge</h3>
                    </div>
                    <p className="text-gray-600">{item.challenge}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2">
                      <IoCheckmark className="w-5 h-5" />
                      <h3 className="font-semibold text-gray-800">Why Caroora</h3>
                    </div>
                    <p className="text-gray-600">{item.why}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2">
                      <IoCheckmark className="w-5 h-5" />
                      <h3 className="font-semibold text-gray-800">What we did</h3>
                    </div>
                    <p className="text-gray-600">{item.what}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-2">
                      <IoCheckmark className="w-5 h-5" />
                      <h3 className="font-semibold text-gray-800">Results</h3>
                    </div>
                    <p className="text-gray-600">{item.result}</p>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div
                className={`relative ${
                  index % 2 !== 0 ? "md:order-1" : "md:order-2"
                }`}
              >
                <img
                  src={item.src}
                  alt="Workshop"
                  className="rounded-xl w-full object-cover"
                />
                <div className="absolute -top-2 -left-[-30px]  w-28 h-28 sm:w-32 sm:h-32">
                  <div className="absolute inset-0 rounded-full bg-[#02295B] translate-x-2 translate-y-2"></div>
                  <img
                    src={item.profile}
                    alt="Profile"
                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Story;
