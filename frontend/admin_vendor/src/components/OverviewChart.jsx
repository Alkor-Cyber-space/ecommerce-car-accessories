import React from "react";

export default function OverviewChart({ title, total, breakdown }) {
  const radius = 90;
  const cx = 100;
  const cy = 100;

  // Ensure all item values are numbers
  const safeBreakdown = breakdown.map(item => ({
    ...item,
    value: Number(item.value) || 0,
  }));

  const totalValue = safeBreakdown.reduce((acc, item) => acc + item.value, 0);

  const getArcPath = (startAngle, endAngle, r) => {
    const start = {
      x: cx + r * Math.cos(startAngle),
      y: cy + r * Math.sin(startAngle),
    };
    const end = {
      x: cx + r * Math.cos(endAngle),
      y: cy + r * Math.sin(endAngle),
    };
    return `M${start.x},${start.y} A${r},${r} 0 0 1 ${end.x},${end.y}`;
  };

  let currentAngle = Math.PI;

  return (
    <div className="bg-white rounded-[1rem] p-6 shadow border border-[#D8D8D8] max-w-xl w-full">
      {/* Chart */}
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 110" className="w-full max-w-xs">
          {safeBreakdown.map((item, index) => {
            // Avoid division by zero
            const valuePercent = totalValue ? item.value / totalValue : 0;
            const angle = Math.PI * valuePercent;

            if (angle === 0) return null; // skip zero-value slices

            const path = getArcPath(currentAngle, currentAngle + angle, radius);
            currentAngle += angle;

            return (
              <path
                key={index}
                d={path}
                fill="none"
                stroke={item.color}
                strokeWidth="12"
              />
            );
          })}
        </svg>

        {/* Total */}
        <div className="text-center mt-[-45px]">
          <div className="text-3xl font-bold text-gray-900">
            {(Number(total) || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>

        {/* Breakdown List */}
        <div className="mt-6 w-full px-4 space-y-2 text-sm text-gray-700">
          {safeBreakdown.map((item, index) => (
            <div className="flex justify-between items-center" key={index}>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.label}
              </div>
              <span>{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
