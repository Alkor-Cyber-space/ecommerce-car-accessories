import { BsGraphUpArrow } from 'react-icons/bs';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const ProfitCard = ({
  title = "Total Profit",
  profit = 0,
  percentage = 0,
  bars = [],
  durationLabel = "Last 12 months",
  xLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  onDownload = () => {},
  filterOptions = ["Last 12 months", "Last 6 months", "Last 3 months"],
}) => {
  const [visibleBars, setVisibleBars] = useState(bars);
  const [visibleLabels, setVisibleLabels] = useState(xLabels);
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  // Handle screen resize for responsive bars
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let barsToShow = bars;
      let labelsToShow = xLabels;

      if (width < 640) {
        barsToShow = bars.slice(0, 6);
        labelsToShow = xLabels.slice(0, 6);
      } else if (width < 1024) {
        barsToShow = bars.slice(0, 9);
        labelsToShow = xLabels.slice(0, 9);
      }

      setVisibleBars(barsToShow);
      setVisibleLabels(labelsToShow);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bars, xLabels]);

  // Handle filter selection
  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setSelectedFilter(filter);

    // Simple example: slice arrays based on filter
    if (filter === "Last 12 months") {
      setVisibleBars(bars);
      setVisibleLabels(xLabels);
    } else if (filter === "Last 6 months") {
      setVisibleBars(bars.slice(-6));
      setVisibleLabels(xLabels.slice(-6));
    } else if (filter === "Last 3 months") {
      setVisibleBars(bars.slice(-3));
      setVisibleLabels(xLabels.slice(-3));
    }
  };

  return (
    <div className="bg-white border-l border-[#D8D8D8] p-8 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-1">
            <BsGraphUpArrow className="w-3 h-3" />
            <h3 className="text-md text-gray-500 mb-1">{title}</h3>
          </div>
          <div className="flex gap-2">
            <h1 className="text-3xl font-bold">{profit.toLocaleString()}</h1>
            {/* Optional: percentage indicator */}
            {/* <div
              className={`flex items-center gap-1 px-1 py-1 rounded-lg text-sm ${
                percentage >= 0
                  ? "text-green-600 bg-green-100"
                  : "text-red-600 bg-red-100"
              }`}
            >
              {percentage}% {percentage >= 0 ? <FiArrowUpRight className="w-4 h-4" /> : <FiArrowDownRight className="w-4 h-4" />}
            </div> */}
          </div>
        </div>

        {/* Filter dropdown */}
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
          {visibleLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between">
        <span className="text-sm">{durationLabel}</span>
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
