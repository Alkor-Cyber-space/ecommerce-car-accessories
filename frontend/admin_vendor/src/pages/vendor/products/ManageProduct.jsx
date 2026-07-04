import React, { useEffect, useState } from "react";
import { FiEdit3, FiArrowUpRight } from "react-icons/fi";
import { IoPricetagOutline } from 'react-icons/io5';
import { CiBadgeDollar } from "react-icons/ci";
import { PiToolboxLight } from 'react-icons/pi';
import { IoIosArrowDown } from "react-icons/io";
import { BsSearch } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProductsApi } from "../../../services/allAPI";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsApi();
        const sortedData = (data?.products || data || []).sort(
          (a, b) => b.id - a.id
        );
        setProducts(sortedData);
        // ✅ Store registration status for later use
        if (data?.registration_complete !== undefined) {
          localStorage.setItem(
            "registration_complete",
            JSON.stringify(data.registration_complete)
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );
  const handleAddProduct = () => {
    const storedStatus = localStorage.getItem("registration_complete");
    const isComplete = storedStatus === "true" || storedStatus === true;

    if (isComplete) {
      navigate("/vendor/products/add");
    } else {
      toast.warning("Please complete your registration before adding a product!");
    }
  };

  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1) ||
        (currentPage <= 3 && i <= 4) ||
        (currentPage >= totalPages - 2 && i >= totalPages - 3)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const baseSizes = [1, 10, 20, 50];
  const extraSizes = [100, 500];
  const productCount = products.length;

  // const pageSizeOptions =
  //   pageSize >= 50 && productCount > 50
  //     ? [
  //         ...baseSizes.filter((s) => s <= productCount),
  //         ...extraSizes.filter((s) => s <= productCount),
  //       ]
  //     : baseSizes.filter((s) => s <= productCount);

  const [showDropdown, setShowDropdown] = useState(false);

  const totalProducts = products.length;
  const totalOrders = 200; // static value for now
  const totalStocks = products.reduce(
    (acc, product) => acc + (product.stock || 0),
    0
  );

  const stats = [
    { icon: <IoPricetagOutline />, title: "Total Products", value: totalProducts },
    { icon: <PiToolboxLight />, title: "Total Orders", value: null },
    { icon: <CiBadgeDollar />, title: "Stocks", value: totalStocks },
  ];


  const pageSizeOptions =
    pageSize >= 50 && productCount > 50
      ? [...baseSizes.filter((s) => s <= productCount), ...extraSizes.filter((s) => s <= productCount)]
      : baseSizes.filter((s) => s <= productCount);

  return (
    <>
      <h1 className="text-xl md:text-2xl font-bold text-[#5737B4] mb-4">Product Management</h1>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl text-[#5737B4]">{stat.icon}</span>
              <h4 className="text-sm font-semibold text-gray-500">{stat.title}</h4>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
        {/* Search */}
        <div className="relative w-full md:w-[50%] lg:w-[60%]">
          <BsSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-white px-5 py-3 rounded-3xl w-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5737B4] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleAddProduct}
            className="bg-[#5737B4] text-white px-5 py-3 rounded-md shadow hover:bg-[#442f96] text-sm font-medium w-full md:w-auto transition-colors"
          >
            Add New Product +
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-white py-4 sm:py-4 md:py-3 lg:py-3 px-2 sm:px-6 md:px-2 lg:px-2 rounded-xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="text-gray-700 text-left border-b border-gray-100">
            <tr>
              <th className="p-3 w-10"><input type="checkbox" /></th>
              <th className="p-3 whitespace-nowrap">SI.No</th>
              <th className="p-3">Product Name</th>
              <th className="p-3 whitespace-nowrap">Category</th>
              <th className="p-3 whitespace-nowrap">Price</th>
              <th className="p-3 whitespace-nowrap">Stock</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length ? (
              paginatedItems.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <td className="p-3"><input type="checkbox" /></td>
                  <td className="p-3 whitespace-nowrap">{startIndex + index + 1}</td>
                  <td
                    onClick={() => navigate(`${product.id}`)}
                    className="p-3 font-medium text-[#5737B4] hover:underline cursor-pointer min-w-[150px] max-w-[300px] break-words"
                  >
                    {product.name}
                  </td>
                  <td className="p-3 whitespace-nowrap">{product.category?.name}</td>
                  <td className="p-3 whitespace-nowrap font-medium">₹{product.price}</td>
                  <td className="p-3 whitespace-nowrap">{product.stock}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${product.is_available
                        ? "bg-[#05C16833] text-[#05C168]"
                        : "bg-red-100 text-[#FF5A65]"
                        }`}
                    >
                      {product.is_available ? "Live" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`${product.id}/edit`)}
                      className="text-lg text-gray-500 hover:text-[#5737B4] transition-colors"
                    >
                      <FiEdit3 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="8">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-end items-center gap-3 text-sm">
          {/* Prev Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Prev
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1.5">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center font-medium border transition-all ${
                    currentPage === page
                      ? "bg-[#5737B4] border-[#5737B4] text-white"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default ProductList;
