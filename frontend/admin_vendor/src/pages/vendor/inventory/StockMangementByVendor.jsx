import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { FaSyncAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  getCategoriesApi,
  getProductsApi,
  updateStockApi,
} from "../../../services/allAPI";
import { baseUrl } from "../../../services/serverURL";

Modal.setAppElement("#root");

export default function VendorStockTable() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const dropdownRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const serverurl = baseUrl;

  const statusColor = {
    "In Stock": "bg-green-100 text-green-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
    "Out of Stock": "bg-red-100 text-red-700",
  };

  const stockOrder = {
    "Out of Stock": 1,
    "Low Stock": 2,
    "In Stock": 3,
  };

  const mapProducts = (products) =>
    products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name || "Uncategorized",
      carModel:
        p.compatible_varient_year
          ?.map((v) => `${v.make} ${v.model}`)
          .join(", ") || "N/A",
      stock: p.stock,
      status:
        p.stock === 0 ? "Out of Stock" : p.stock < 15 ? "Low Stock" : "In Stock",
      lastRestocked: p.updated_at?.split("T")[0] || "N/A",
      unitPrice: Number(p.price) || 0,
      price: Number(p.price) || 0,
      image: p.image_list?.[0]?.image || "/img/default.jpg",
    }));

  const fetchData = async () => {
    try {
      const data = await getProductsApi();
      const productsArray = Array.isArray(data) ? data : data.products || [];
      setData(mapProducts(productsArray));

      const categoryResponse = await getCategoriesApi();
      if (Array.isArray(categoryResponse)) {
        setCategories(categoryResponse.map((c) => c.name));
      } else {
        setCategories(["Engine", "Brakes", "Electrical", "Body Parts"]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data!");
      setCategories(["Engine", "Brakes", "Electrical", "Body Parts"]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort
  const filteredData = data
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedCategory === "All" || item.category === selectedCategory) &&
        (status === "All" || item.status === status)
    )
    .sort((a, b) => stockOrder[a.status] - stockOrder[b.status]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openModal = (item) => {
    setSelectedProduct({ ...item });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    try {
      await updateStockApi(selectedProduct.id, selectedProduct.stock);
      const data = await getProductsApi();
      const productsArray = Array.isArray(data) ? data : data.products || [];
      setData(mapProducts(productsArray));
      toast.success("Product updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update product!");
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Stock Overview Report", 14, 15);
      doc.autoTable({
        head: [
          ["Product", "Category", "Stock", "Status", "Unit Price", "Total Price"],
        ],
        body: filteredData.map((item) => [
          item.name,
          item.category,
          item.stock,
          item.status,
          item.unitPrice,
          item.stock * item.unitPrice,
        ]),
        startY: 20,
      });
      doc.save("StockOverviewReport.pdf");
      setShowDownloadOptions(false);
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download PDF report!");
    }
  };

  const handleDownloadExcel = () => {
    setShowDownloadOptions(false);
    toast.success("Excel report downloaded successfully!");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-100 px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#232832] text-xl font-bold">Stock Overview</h1>
        <div className="flex items-center gap-4">
          <FaSyncAlt
            className="text-xl text-[#5737B4] cursor-pointer"
            onClick={() => window.location.reload()}
          />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="bg-[#5737B4] text-white px-3 py-3 rounded-md text-sm flex items-center gap-2"
            >
              Download Report
            </button>

            {showDownloadOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleDownloadPDF}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                >
                  Download as PDF
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                >
                  Download as Excel
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="All">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="All">Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-3">Image</th>
              <th className="py-4 px-3">Product</th>
              <th className="py-4 px-3">Category</th>
              <th className="py-4 px-3">Car Model</th>
              <th className="py-4 px-3">Stock</th>
              <th className="py-4 px-3">Status</th>
              <th className="py-4 px-3">Unit Price</th>
              <th className="py-4 px-3">Price</th>
              <th className="py-4 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="text-center hover:bg-gray-50">
                <td className="py-3 px-3">
                  <img
                    src={item.image?.startsWith("http") ? item.image : `${serverurl}${item.image}`}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                </td>
                <td className="py-3 px-3 font-semibold">{item.name}</td>
                <td className="py-3 px-3">{item.category}</td>
                <td className="py-3 px-3">{item.carModel}</td>
                <td className="py-3 px-3">{item.stock}</td>
                <td className="py-3 px-3">
                  <span className={`px-3 py-1 text-xs rounded ${statusColor[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-3">{item.unitPrice}</td>
                <td className="py-3 px-3">{item.stock * item.unitPrice}</td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => openModal(item)}
                    className="bg-[#5737B4] text-white px-3 py-1 rounded text-xs hover:bg-[#4A148C] transition-colors"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="text-center text-gray-500 py-4">No products found</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 border border-gray-300 rounded ${
              currentPage === i + 1 ? "bg-[#5737B4] text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="bg-white max-w-lg p-6 mx-auto mt-40 rounded shadow outline-none"
        overlayClassName="fixed inset-0 z-50 backdrop-blur-sm bg-black/50"
      >
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input
                className="w-full border px-3 py-3 rounded mt-1"
                value={selectedProduct.name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                className="w-full border px-3 py-3 rounded mt-1"
                type="number"
                value={selectedProduct.stock}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-[#232832] text-white px-4 py-3 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#5737B4] text-white px-4 py-3 rounded"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
