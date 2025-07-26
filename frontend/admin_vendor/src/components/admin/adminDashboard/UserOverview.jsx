import React from "react";

export default function UsersOverview() {
  const totalUsers = 23648;
  const breakdown = [
    { label: "Active Consumers", value: 15624, color: "#C32AFF" },
    { label: "Active Vendors", value: 5546, color: "#8E70FF" },
    { label: "Any other data", value: 2478, color: "#21D0FF" },
  ];

  const radius = 90;
  const cx = 100;
  const cy = 100;
  const totalArcLength = Math.PI * radius;
  const totalValue = breakdown.reduce((acc, item) => acc + item.value, 0);

  // Convert value to arc path
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

  let currentAngle = Math.PI; // Start from leftmost point

  return (
    <div className="bg-white rounded-[1rem] p-9 shadow border border-[#D8D8D8] max-w-xl w-full">
      {/* Title */}
     

      {/* Chart */}
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 110" className="w-full max-w-xs">
          {breakdown.map((item, index) => {
            const valuePercent = item.value / totalValue;
            const angle = Math.PI * valuePercent;
            const path = getArcPath(currentAngle, currentAngle + angle, radius);
            currentAngle += angle;
            return (
              <path
                key={index}
                d={path}
                fill="none"
                stroke={item.color}
                strokeWidth="12"
                strokeLinecap=""
              />
            );
          })}
        </svg>

        {/* Total Users */}
        <div className="text-center mt-[-45px]">
          <div className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>

        {/* Breakdown List */}
        <div className="mt-6 w-full px-4 space-y-4 text-sm text-gray-700">
          {breakdown.map((item, index) => (
            <div className="flex justify-between items-center" key={index}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
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
