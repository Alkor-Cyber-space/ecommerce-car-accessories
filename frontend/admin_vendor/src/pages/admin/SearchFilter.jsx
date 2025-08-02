import React, { useState } from 'react';

const SearchFilter = () => {
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [regDateFrom, setRegDateFrom] = useState('');
  const [regDateTo, setRegDateTo] = useState('');

  const handleReset = () => {
    setLocationFilter('');
    setStatusFilter('');
    setActiveStatusFilter('');
    setYearFilter('');
    setUserTypeFilter('');
    setRegDateFrom('');
    setRegDateTo('');
  };

  return (

    <div className='bg-white rounded-xl px-8 py-5 w-full md:w-4xl'>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4  ">
      {/* Row 1 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
        >
          <option value="">Select Year</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
        <input
          type="text"
          className="border rounded px-3 py-2 text-sm w-full"
          placeholder="Search location"
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
        />
      </div>

      {/* Row 2 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">User Type</label>
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={userTypeFilter}
          onChange={e => setUserTypeFilter(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="User">User</option>
          <option value="Vendor">Vendor</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Row 3 */}
      <div className="flex flex-col gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reg. Date From</label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full"
            value={regDateFrom}
            onChange={e => setRegDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reg. Date To</label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full"
            value={regDateTo}
            onChange={e => setRegDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Row 4 - Active/Inactive + Buttons */}
      <div className="md:col-span-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        {/* <div className="w-full md:ml-60">
          <label className="block text-xs font-medium text-gray-600 mb-1">Active/Inactive</label>
          <select
            className="border rounded px-3 py-2 text-sm w-full"
            value={activeStatusFilter}
            onChange={e => setActiveStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Suspended">Inactive</option>
          </select>
        </div> */}
        
      </div>
      
    </div>
    <div className="flex gap-3 justify-end mt-5">
          <button
            className="border border-[#5737B4] text-[#5737B4] rounded p-2 w-50 sm:w-32"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="bg-[#5737B4] text-white rounded p-2 w-50 sm:w-32 hover:bg-[#452fa4] transition"
          >
            Search
          </button>
       </div>
    </div>
  );
};

export default SearchFilter;
