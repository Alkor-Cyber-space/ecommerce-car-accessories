import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Ban, X } from 'lucide-react';
import { deleteProductCategoryApi, getProductcategorylist, updateProductCategoryApi } from '../../../services/allAPI';
import { toast } from 'react-toastify';
import ProductCategory from './ProductCatogery';

const ProductTable = () => {
  const [productcategorylist, setProductcategorylist] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCategoryCreated = (newCategory) => {
    // Immediately add the new category to the list
    setProductcategorylist(prev => {
      // Create a new array with the new category at the start
      const updated = [newCategory, ...prev];
      // Sort by ID in descending order
      return updated.sort((a, b) => b.id - a.id);
    });
  };

  const fetchProductcategorylist = async () => {
    try {
      const data = await getProductcategorylist();
      console.log("API Response:", data);

      const categoryArray = Array.isArray(data)
        ? data
        : data?.results || [];

      const availableCategories = categoryArray.filter(item => item.available === true);

      const sortedData = [...availableCategories].sort((a, b) => b.id - a.id);
      setProductcategorylist(sortedData);
    } catch (error) {
      console.error("Error fetching productcategorylist:", error);
      setProductcategorylist([]);
    }
  };

  useEffect(() => {
    fetchProductcategorylist();
  }, []);

  const handleEditClick = (item) => {
    setSelectedCategory(item);
    setEditedName(item.name);
    setShowEditModal(true);
  };

  const handleDeleteClick = (item) => {
    setCategoryToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDisableClick = (item) => {
    console.log("Disable clicked", item);
    toast.info(`Category "${item.name}" disabled!`);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editedName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    try {
      const updatedCategory = {
        name: editedName,
        image: selectedCategory.image, // include new image if chosen
      };

      const response = await updateProductCategoryApi(selectedCategory.id, updatedCategory);

      if (response.status === 200 || response.status === 201) {
        setProductcategorylist(prev =>
          prev.map(cat =>
            cat.id === selectedCategory.id ? response.data : cat
          )
        );
        toast.success("Category updated successfully!");
      } else {
        toast.error("Failed to update category.");
      }
      setShowEditModal(false);
    } catch (error) {
      toast.error("An error occurred while updating the category.");
      console.error("Update error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteProductCategoryApi(categoryToDelete.id);
      // Remove the category from the list immediately
      setProductcategorylist(prev =>
        prev.filter(cat => cat.id !== categoryToDelete.id)
      );
      toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
    } catch (error) {
      toast.error("Failed to delete the category.");
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <ProductCategory onCategoryCreated={handleCategoryCreated} />
      {/* Categories Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          {productcategorylist.length > 0 ? (
            <table className="w-full min-w-[350px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {productcategorylist.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {/* Category Name */}
                    <td className="px-2 md:px-4 py-2 md:py-3 text-sm text-gray-900 break-words max-w-[120px] md:max-w-none">
                      {item.name}
                    </td>

                    {/* Category Image */}
                    <td className="px-2 md:px-4 py-2 md:py-3 text-sm text-gray-900 text-left">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.image}
                          className="w-12 h-12 object-cover rounded-md mx-auto"
                        />
                      ) : (
                        <span className="text-gray-400 italic">No Image</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-2 md:px-4 py-2 md:py-3 text-center space-x-1 md:space-x-2 flex justify-center">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1 md:p-2 rounded-full hover:bg-blue-100 transition-colors text-blue-600"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-1 md:p-2 rounded-full hover:bg-red-100 transition-colors text-red-600"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDisableClick(item)}
                        className="p-1 md:p-2 rounded-full hover:bg-orange-100 transition-colors text-orange-600"
                        title="Disable Category"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            ''
          )}
        </div>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowEditModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Image input */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSelectedCategory({ ...selectedCategory, image: e.target.files[0] })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />

            {/* Preview */}
            {selectedCategory?.image && typeof selectedCategory.image === "string" ? (
              <img
                src={selectedCategory.image}
                alt="Category"
                className="w-20 h-20 object-cover rounded mb-4"
              />
            ) : selectedCategory?.image instanceof File ? (
              <img
                src={URL.createObjectURL(selectedCategory.image)}
                alt="Preview"
                className="w-20 h-20 object-cover rounded mb-4"
              />
            ) : null}

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                onClick={handleEditSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDeleteModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Category</h2>
            <p className="mb-4">
              Are you sure you want to delete the category{' '}
              <strong className="text-red-600">{categoryToDelete.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;