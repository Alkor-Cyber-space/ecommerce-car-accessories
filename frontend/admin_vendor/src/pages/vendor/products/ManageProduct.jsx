import React, { useEffect, useState } from "react";
import { FiEdit3, FiArrowUpRight } from "react-icons/fi";
import { IoPricetagOutline } from 'react-icons/io5';
import { CiBadgeDollar } from "react-icons/ci";
import { PiToolboxLight } from 'react-icons/pi';
import { IoIosArrowDown } from "react-icons/io";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { getProductsApi } from "../../../services/allAPI";


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsApi();
        console.log(data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const [showDropdown, setShowDropdown] = useState(false);


  const stats = [
    { icon: <IoPricetagOutline />, title: "Total Sales", value: "50.8K" },
    { icon: <PiToolboxLight />, title: "Total Orders", value: "200" },
    { icon: <CiBadgeDollar />, title: "Revenue Summary", value: "50.8K" },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Product Management</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{stat.icon}</span>
              <h4 className="text-sm font-semibold text-gray-500">{stat.title}</h4>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm bg-[#e6fff0] px-2 py-1 rounded mt-2">
                24.6%
                <FiArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full lg:w-[60%] md:w-[50%] ">
          <BsSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-white px-5 py-3 rounded-3xl w-full  "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Bulk Actions + Add */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between gap-2 border-2 border-[#5737B4] px-4 py-2 rounded-md text-sm font-medium text-[#5737B4] hover:bg-gray-50 w-full sm:w-auto"
            >
              Bulk Actions
              <IoIosArrowDown />
            </button>
            {showDropdown && (
              <div className="absolute z-10 mt-2 w-40 rounded-md shadow-lg bg-white">
                <ul className="py-1 text-sm text-gray-700">
                  <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">Delete Selected</li>
                  <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">Mark as Active</li>
                  <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">Mark as Inactive</li>
                </ul>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("add")}
            className="bg-[#5737B4] text-white px-4 py-2 rounded-md shadow hover:bg-[#442f96] text-sm font-medium w-full sm:w-auto">
            Add New Product +
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white py-8 px-4 sm:px-6 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="text-gray-700 text-left ">
            <tr>
              <th className="p-3"><input type="checkbox" /></th>
              <th className="p-3">SI.No</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length ? (
              paginatedItems.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="p-3"><input type="checkbox" /></td>
                  <td className="p-3">{startIndex + index + 1}</td>
                  <td
                    onClick={() => navigate(`${product.id}`)}
                    className="p-3 font-medium w-75 text-[#5737B4]">{product.name}</td>
                  <td className="p-3">{product.category?.name}</td>
                  <td className="p-3">₹{product.price}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${product.status === "Live"
                      ? "bg-[#05C16833] text-green-800"
                      : product.status === "Draft"
                        ? "bg-[#AEB9E133] text-[#6989F9]"
                        : "bg-red-100 text-[#FF5A65]"
                      }`}>
                      {/* {product.status} */}Live
                    </span>

                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate("1/edit")}
                      className="text-xl text-gray-600 hover:text-blue-800">
                      <FiEdit3 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan="8">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}

      </div>
      <div className="mt-6 flex flex-wrap justify-end items-center gap-2 text-sm">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded disabled:opacity-50  hover:bg-gray-200"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1  rounded ${currentPage === index + 1 ? "bg-white text-black" : "hover:bg-blue-100"}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1  rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
        >
          Next
        </button>
      </div>
    </>
  );
};
export default ProductList;
