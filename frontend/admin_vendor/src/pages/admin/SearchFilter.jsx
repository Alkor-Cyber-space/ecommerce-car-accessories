import React from 'react';

const SearchFilter = ({
  filters,
  setFilters,
  onSearch,
  onReset,
  showYear = true,
  showStatus = true,
  showLocation = true,
  showOrderStatus = true,
  showBuyerName = true,
  showOrderId = true,
}) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl px-3 py-4 w-full max-w-6xl mx-auto shadow-sm">
      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {showYear && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Year
            </label>
            <select
              className="border rounded px-3 py-2 text-sm w-full"
              value={filters.year || ''}
              onChange={(e) => handleChange('year', e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        )}

        {showLocation && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Search location"
              value={filters.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
        )}

        {showStatus && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              className="border rounded px-3 py-2 text-sm w-full"
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        )}

        {showOrderId && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Order ID
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Search Order ID"
              value={filters.orderId || ''}
              onChange={(e) => handleChange('orderId', e.target.value)}
            />
          </div>
        )}

        {showBuyerName && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Buyer Name
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Search Buyer Name"
              value={filters.buyerName || ''}
              onChange={(e) => handleChange('buyerName', e.target.value)}
            />
          </div>
        )}

        {showOrderStatus && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Order Status
            </label>
            <select
              className="border rounded px-3 py-2 text-sm w-full"
              value={filters.orderStatus || ''}
              onChange={(e) => handleChange('orderStatus', e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reg. Date From
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full"
            value={filters.regDateFrom || ''}
            onChange={(e) => handleChange('regDateFrom', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reg. Date To
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full"
            value={filters.regDateTo || ''}
            onChange={(e) => handleChange('regDateTo', e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
        <button
          className="border border-[#5737B4] text-[#5737B4] rounded px-4 py-2 text-sm font-medium hover:bg-[#f4f1ff] transition w-full sm:w-auto"
          onClick={onReset}
        >
          Reset
        </button>
        <button
          className="bg-[#5737B4] text-white rounded px-4 py-2 text-sm font-medium hover:bg-[#452fa4] transition w-full sm:w-auto"
          onClick={() => onSearch?.()}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
