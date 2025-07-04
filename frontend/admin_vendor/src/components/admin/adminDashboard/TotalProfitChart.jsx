import { BsGraphUpArrow } from 'react-icons/bs';
import { FiArrowUpRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const TotalProfitCard = () => {
  const totalProfit = 12520000;
  const fullBars = [35, 45, 50, 40, 48, 38, 55, 44, 42, 40, 35, 45, 50, 40, 48, 38, 55, 44];
  const [visibleBars, setVisibleBars] = useState(fullBars);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleBars(fullBars.slice(0, 10)); // Mobile
      } else if (width < 1024) {
        setVisibleBars(fullBars.slice(0, 14)); // Tablet
      } else {
        setVisibleBars(fullBars); // Desktop
      }
    };

    handleResize(); // initial
    window.addEventListener('resize', handleResize); // resize
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="text-black border border-[#D8D8D8] bg-white p-3 w-full">
      <div className="flex flex-col justify-between items-start">
        <div className="flex items-center gap-1">
          <BsGraphUpArrow className="w-3 h-3" />
          <h3 className="text-md text-gray-500 mb-1">Total profit</h3>
        </div>
        <div className="flex gap-2">
          <h1 className="text-3xl font-bold">₹{totalProfit.toLocaleString()}</h1>
          <div className="flex items-center gap-1 text-green-600 bg-green-100 px-1 py-1 rounded-lg text-sm">
            28.5% <FiArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-24 flex items-end gap-1">
          {visibleBars.map((height, i) => (
            <div
              key={i}
              style={{
                height: `${height}px`,
                backgroundColor: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
                width: '6px',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>12 AM</span>
          <span>8 AM</span>
          <span>4 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <span className="text-sm">Last 12 months</span>
        <p className="text-sm text-violet-600 hover:underline cursor-pointer">
          Download Report
        </p>
      </div>
    </div>
  );
};

export default TotalProfitCard;
