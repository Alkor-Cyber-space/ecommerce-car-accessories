import React, { useState } from 'react';

const EditPromotionModal = ({ promotion, onClose, onSave, allCategories, allProducts }) => {
  const [formData, setFormData] = useState({
    name: promotion.name,
    description: promotion.description,
    value: promotion.value,
    applicable_category: promotion.applicable_category.map(cat => cat.id),
    applicable_product: promotion.applicable_product.map(prod => prod.id),
    start_date: promotion.start_date,
    end_date: promotion.end_date
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (listType, id) => {
    setFormData(prev => {
      const currentList = prev[listType];
      const updatedList = currentList.includes(id)
        ? currentList.filter(item => item !== id)
        : [...currentList, id];
      return { ...prev, [listType]: updatedList };
    });
  };

  const handleSubmit = () => {
    onSave({
      ...promotion,
      ...formData,
      applicable_category: allCategories.filter(cat => formData.applicable_category.includes(cat.id)),
      applicable_product: allProducts.filter(prod => formData.applicable_product.includes(prod.id))
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[80vh]">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>
        <h3 className="text-xl font-bold mb-4">Edit Promotion</h3>
        
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border rounded p-2 mb-4 w-full"
          placeholder="Name"
        />
        
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border rounded p-2 mb-4 w-full"
          placeholder="Description"
        />

        <input
          name="value"
          type="number"
          value={formData.value}
          onChange={handleChange}
          className="border rounded p-2 mb-4 w-full"
          placeholder="Value"
        />

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Categories</h4>
          <div className="max-h-32 overflow-y-auto border p-2 rounded">
            {allCategories.map(cat => (
              <div key={cat.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={formData.applicable_category.includes(cat.id)}
                  onChange={() => handleCheckboxChange('applicable_category', cat.id)}
                />
                <label className="ml-2">{cat.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Products</h4>
          <div className="max-h-32 overflow-y-auto border p-2 rounded">
            {allProducts.map(prod => (
              <div key={prod.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={formData.applicable_product.includes(prod.id)}
                  onChange={() => handleCheckboxChange('applicable_product', prod.id)}
                />
                <label className="ml-2">{prod.name}</label>
              </div>
            ))}
          </div>
        </div>

        <input
          name="start_date"
          type="datetime-local"
          value={formData.start_date}
          onChange={handleChange}
          className="border rounded p-2 mb-4 w-full"
        />
        <input
          name="end_date"
          type="datetime-local"
          value={formData.end_date}
          onChange={handleChange}
          className="border rounded p-2 mb-4 w-full"
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#5737B4] text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPromotionModal;
