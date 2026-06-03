import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaBell, FaSyncAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const initialData = [
  {
    id: 1,
    name: 'Air Filter',
    sku: 'AF-124',
    category: 'Engine',
    carModel: 'Swift 2018',
    stock: 32,
    status: 'In Stock',
    lastRestocked: '2025-06-12',
    vendor: 'XYZ Motors',
    unitPrice: 450,
    price: 650,
    image: '/img/airfilter.jpg',
  },
  {
    id: 2,
    name: 'Brake Pad',
    sku: 'BP-567',
    category: 'Brakes',
    carModel: 'Innova 2020',
    stock: 3,
    status: 'Low Stock',
    lastRestocked: '2025-06-10',
    vendor: 'Autoplus',
    unitPrice: 700,
    price: 950,
    image: '/img/brakepad.jpg',
  },
];

export default function StockTable() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [vendor, setVendor] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const statusColor = {
    'In Stock': 'bg-green-100 text-green-700',
    'Low Stock': 'bg-yellow-100 text-yellow-700',
    'Out of Stock': 'bg-red-100 text-red-700',
  };

const stockOrder = {
  "Out of Stock": 1,
  "Low Stock": 2,
  "In Stock": 3,
};

const filteredData = data
  .filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || item.category === category) &&
      (status === "All" || item.status === status) &&
      (vendor === "All" || item.vendor === vendor)
    );
  })
  .sort((a, b) => stockOrder[a.status] - stockOrder[b.status]);


  const openModal = (item) => {
    setSelectedProduct({ ...item });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = () => {
    setData((prev) =>
      prev.map((item) => (item.id === selectedProduct.id ? selectedProduct : item))
    );
    toast.success('Product updated successfully!');
    closeModal();
  };

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-[#232832] text-xl font-bold">Stock Overview</h1>
        <div className="flex items-center gap-4">
          <FaBell className="text-xl text-gray-600 cursor-pointer" />
          <FaSyncAlt className="text-xl text-gray-600 cursor-pointer" />
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
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded w-full">
          <option value="All">  Categories</option>
          <option>Engine</option>
          <option>Brakes</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded w-full">
          <option value="All"> Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
        </select>
        <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="p-2 border rounded w-full">
          <option value="All"> Vendors</option>
          <option>XYZ Motors</option>
          <option>Autoplus</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-md text-sm shadow">
          <thead className="text-gray-600">
            <tr>
              <th className="py-4 px-2">Image</th>
              <th className="py-4 px-2">Product</th>
              <th className="py-4 px-2">Category</th>
              <th className="py-4 px-2">Car Model</th>
              <th className="py-4 px-2">Stock</th>
              <th className="py-4 px-2">Status</th>
              <th className="py-4 px-2">Vendor</th>
              <th className="py-4 px-2">Unit Price</th>
              <th className="py-4 px-2">Price</th>
              <th className="py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="text-center hover:bg-gray-50">
                <td className="py-2 px-2">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded" />
                </td>
                <td className="py-2 px-2">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                </td>
                <td className="py-2 px-2">{item.category}</td>
                <td className="py-2 px-2">{item.carModel}</td>
                <td className="py-2 px-2">{item.stock}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 text-xs rounded ${statusColor[item.status]}`}>{item.status}</span>
                </td>
                <td className="py-2 px-2">{item.vendor}</td>
                <td className="py-2 px-2">{item.unitPrice}</td>
                <td className="py-2 px-2">{item.price}</td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => openModal(item)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="bg-white max-w-lg p-6 mx-auto mt-40 rounded shadow outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40"
      >
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input
                className="w-full border px-3 py-2 rounded mt-1"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                className="w-full border px-3 py-2 rounded mt-1"
                type="number"
                value={selectedProduct.stock}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Unit price</label>
              <input
                className="w-full border px-3 py-2 rounded mt-1"
                type="number"
                value={selectedProduct.unitPrice}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, unitPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                className="w-full border px-3 py-2 rounded mt-1"
                type="number"
                value={selectedProduct.price}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
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
