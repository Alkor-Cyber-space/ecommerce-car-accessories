import React, { useEffect, useState } from 'react';
import { GoArrowDownRight, GoArrowUpRight } from 'react-icons/go';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getVendorByIdApi } from '../../../services/allAPI';
import axios from 'axios';

const VendorDetails = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [vendorData, setVendorData] = useState({});
  const [vendorProducts, setVendorProducts] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorProducts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const payload = { pk: Number(id) };
        console.log("Vendor ID (pk) sent to API:", id);

        const response = await axios.post(
          "http://127.0.0.1:8000/api/admin/list-vendor-products/",
          payload,
          {
            headers: {
              Authorization: `JWT ${token}`,  // or `Bearer ${token}`
              "Content-Type": "application/json",
            },
          }
        );
        setVendorProducts(response.data.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching vendor products:", error.response || error.message);
      }
    };

    fetchVendorProducts();
  }, [id]);

  const handleDropdownToggle = (productId) => {
    setActiveDropdown(activeDropdown === productId ? null : productId);
  };

  const handleAction = (action, productId) => {
    console.log(`${action} action for product ${productId}`);
    setActiveDropdown(null);
  };

  useEffect(() => {
    if (id) {
      fetchVendorDetails(Number(id));
    } else {
      const storedVendor = localStorage.getItem('selected_vendor');
      if (storedVendor) {
        try {
          const parsedVendor = JSON.parse(storedVendor);
          const vendorId = typeof parsedVendor === 'object' ? parsedVendor.id : parsedVendor;
          if (vendorId) {
            fetchVendorDetails(vendorId);
          }
        } catch (error) {
          console.error("Invalid vendor data in localStorage:", error);
        }
      }
    }
  }, [id]);

  const fetchVendorDetails = async (vendorId) => {
    try {
      const data = await getVendorByIdApi(vendorId);
      console.log("vendorrr",data.data);
      setVendorData(data.data);
    } catch (error) {
      console.error("Error loading vendor details:", error);
    }
  };

  return (
    <div className="bg-[#F4F5FA] min-h-screen p-4   text-[#232323] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center bg-white shadow-sm border border-gray-200"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold">
            {vendorData?.username || 'Vendor Details'}
          </h1>
        </div>
        <div className="flex gap-2 ml-auto">
          <Link
            to={`/admin/vendor-documents/${vendorData.id}`}
            className="border border-[#5737B4] text-[#5737B4] px-4 py-2 rounded text-sm"
          >
            View Documents
          </Link>
          <button className="bg-[#5737B4] text-white px-4 py-2 rounded text-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <h2 className="text-2xl font-bold">{vendorData?.totalProducts || 0}</h2>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {vendorData?.totalOrders || 0}
            <span className="text-red-500 text-sm bg-red-100 px-2 py-1 rounded flex items-center gap-1">
              12.6% <GoArrowDownRight />
            </span>
          </h2>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">Stock</p>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            50.8K
            <span className="text-green-700 text-sm bg-green-100 px-2 py-1 rounded flex items-center gap-1">
              8.3% <GoArrowUpRight />
            </span>
          </h2>
        </div>
      </div>

      {/* Vendor Info (Basic, Address, Company) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Basic Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium w-24">Name</span>
              <span className="ml-4">{vendorData?.username || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Email</span>
              <span className="ml-4">{vendorData?.email || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Phone</span>
              <span className="ml-4">{vendorData?.contact_number || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Address</h3>
          <div className="space-y-2 text-sm">
            {vendorData?.addresses?.length > 0 ? (
              vendorData.addresses.map(addr => (
                <div key={addr.id} className="mb-3 space-y-2">
                  <div className="flex">
                    <span className="font-medium w-28">Line 1</span>
                    <span className="ml-4">{addr.line1 || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-28">Line 2</span>
                    <span className="ml-4">{addr.line2 || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-28">City</span>
                    <span className="ml-4">{addr.city || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-28">State</span>
                    <span className="ml-4">{addr.state || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-28">Country</span>
                    <span className="ml-4">{addr.country || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-28">Pincode</span>
                    <span className="ml-4">{addr.postal_code || 'N/A'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No addresses available</p>
            )}
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Company Details</h3>
          {vendorData?.vendor_profile ? (
            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="font-medium w-40">Company Name</span>
                <span className="ml-4">{vendorData.vendor_profile.company_name || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Company Email</span>
                <span className="ml-4">{vendorData.vendor_profile.company_email || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Company Number</span>
                <span className="ml-4">{vendorData.vendor_profile.company_number || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p>No vendor data available</p>
          )}
        </div>
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium w-24">Name</span>
              <span className="ml-4">{vendorData?.vendor_profile?.contact_name || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Designation</span>
              <span className="ml-4">{vendorData?.vendor_profile?.designation || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Email</span>
              <span className="ml-4">{vendorData?.vendor_profile?.contact_email || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Phone</span>
              <span className="ml-4">{vendorData?.vendor_profile?.contact_number || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Vendor Type</span>
              <span className="ml-4">{vendorData?.vendor_profile?.type_of_vendor || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Header */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="font-semibold text-lg">All Products List</h2>
        <button className="text-sm text-[#5737B4] font-medium border border-[#5737B4] px-3 py-2 rounded">
          Bulk Actions
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl p-4 overflow-x-auto">
        <table className="min-w-[700px] w-full text-left text-sm ">
          <thead>
            <tr className="text-xs md:text-sm text-gray-600">
              <th className="px-3 py-2 font-medium">S.NO</th>
              <th className="px-3 py-2 font-medium ">Product Name</th>
              <th className="px-3 py-2 font-medium"></th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Availability</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorProducts.map((product, index) => (

              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 text-[#5737B4] font-semibold  cursor-pointer">
                  {product.name}
                </td>
                <td className="px-3 py-2">{product.sku}</td>
                <td className="px-3 py-2">{product.stock}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-center items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        product.is_available ? "bg-green-500" : "bg-red-500"
                      }`}
                      title={product.is_available ? "Available" : "Unavailable"}
                    ></span>
                  </div>
                </td>
                <td className="px-3 py-2">{product.price}</td>
                <td className="px-3 py-2 relative">
                  <button
                    onClick={() => handleDropdownToggle(product.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <span className="text-lg"><HiOutlineDotsVertical /></span>
                  </button>

                  {activeDropdown === product.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => handleAction('view', product.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAction('edit', product.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAction('suspend', product.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600 rounded-b-lg"
                      >
                        Suspend
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorDetails;
