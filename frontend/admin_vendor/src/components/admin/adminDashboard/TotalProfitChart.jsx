import { BsGraphUpArrow } from 'react-icons/bs';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const ProfitCard = ({
  title = "Total Profit",
  profit = 0,
  percentage = 0,
  bars = [],
  xLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  onDownload = () => { },
  filterOptions = ["This Month", "Last 3 Months", "Last 6 Months", "Last 12 Months"],
}) => {
  const [visibleBars, setVisibleBars] = useState(bars);
  const [visibleLabels, setVisibleLabels] = useState(xLabels);
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let barsToShow = bars;
      let labelsToShow = xLabels;

      if (width < 640) {
        barsToShow = bars.slice(-6);
        labelsToShow = xLabels.slice(-6);
      } else if (width < 1024) {
        barsToShow = bars.slice(-9);
        labelsToShow = xLabels.slice(-9);
      }

      setVisibleBars(barsToShow);
      setVisibleLabels(labelsToShow);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bars, xLabels]);

  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setSelectedFilter(filter);

    if (filter === "This Month") {
      setVisibleBars(bars.slice(-1));
      setVisibleLabels(xLabels.slice(-1));
    } else if (filter === "Last 3 Months") {
      setVisibleBars(bars.slice(-3));
      setVisibleLabels(xLabels.slice(-3));
    } else if (filter === "Last 6 Months") {
      setVisibleBars(bars.slice(-6));
      setVisibleLabels(xLabels.slice(-6));
    } else if (filter === "Last 12 Months") {
      setVisibleBars(bars.slice(-12));
      setVisibleLabels(xLabels.slice(-12));
    } else {
      setVisibleBars(bars);
      setVisibleLabels(xLabels);
    }
  };

  return (
    <div className="bg-white border-l border-[#D8D8D8] p-8 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-1">
            <BsGraphUpArrow className="w-3 h-3" />
            <h3 className="text-md text-gray-500 mb-1">{title}</h3>
          </div>
          <div className="flex gap-2">
            <h1 className="text-3xl font-bold">{profit.toLocaleString()}</h1>
          </div>
        </div>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={selectedFilter}
          onChange={handleFilterChange}
        >
          {filterOptions.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Bars */}
      <div className="mt-4 flex gap-2 items-end">
        {Array.isArray(visibleBars) &&
          visibleBars.map((height, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Bar */}
              <div
                style={{
                  height: `${height}px`,
                  maxHeight: '96px',
                  backgroundColor: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
                  width: '12px',
                  borderRadius: '4px',
                  transition: 'height 0.3s ease-in-out',
                }}
              />
              {/* Label */}
              <span className="text-xs text-gray-500 mt-1">{visibleLabels[i]}</span>
            </div>
          ))}
      </div>
      <div className="mt-4 flex justify-end">
        <p
          className="text-sm text-violet-600 hover:underline cursor-pointer"
          onClick={onDownload}
        >
          Download Report
        </p>
      </div>
    </div>
  );
};

export default ProfitCard;
