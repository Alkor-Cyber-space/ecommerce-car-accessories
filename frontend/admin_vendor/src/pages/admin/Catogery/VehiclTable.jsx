import React, { useEffect, useState } from 'react';
import { MoreVertical, Edit, Trash2, Ban, X } from 'lucide-react';
import { deletevehiclecategory, editVehicleCategoryApi, getVehicleCategoriesApi } from '../../../services/allAPI';
import { toast } from 'react-toastify';
import { IoChevronDown } from "react-icons/io5";

const VehicleTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [vehicleData, setVehicleData] = useState([]);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  // Selected item states
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [vehicleToDisable, setVehicleToDisable] = useState(null);

  // Edit form states
  const [editedMake, setEditedMake] = useState('');
  const [editedModel, setEditedModel] = useState('');
  const [editedYear, setEditedYear] = useState('');
  const [editedVariant, setEditedVariant] = useState('');

  // Loading states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  // Put this at the top of VehicleTable component, before return()
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i); // Last 30 years

  const fetchVehicleData = async () => {
    try {
      const response = await getVehicleCategoriesApi();
      const sortedData = response.sort((a, b) => b.id - a.id);
      setVehicleData(sortedData);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };

  useEffect(() => {
    fetchVehicleData();

    // Listen for custom events from VehicleCategory component
    const handleVehicleCreated = (event) => {
      console.log('Vehicle created event received:', event.detail);
      fetchVehicleData(); // Refresh the table data
    };

    window.addEventListener('vehicleCreated', handleVehicleCreated);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('vehicleCreated', handleVehicleCreated);
    };
  }, []);

  const handleAction = (action, item) => {
    setOpenDropdown(null);

    if (action === 'Edit') {
      handleEditClick(item);
    } else if (action === 'Delete') {
      handleDeleteClick(item);
    } else if (action === 'Disable') {
      handleDisableClick(item);
    }
  };

  const handleEditClick = (item) => {
    setSelectedVehicle(item);
    setEditedMake(item.make || '');
    setEditedModel(item.model || '');
    setEditedYear(item.year || '');
    setEditedVariant(item.variant || '');
    setShowEditModal(true);
  };

  const handleDeleteClick = (item) => {
    setVehicleToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDisableClick = (item) => {
    setVehicleToDisable(item);
    setShowDisableModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();

    if (!editedMake.trim() || !editedModel.trim()) {
      toast.error('Make and Model cannot be empty.');
      return;
    }

    try {
      const updatedVehicle = {
        make: editedMake,
        model: editedModel,
        year: editedYear,
        variant: editedVariant,
      };

      await editVehicleCategoryApi(selectedVehicle.id, updatedVehicle);

      toast.success('Vehicle updated successfully!');

      const response = await getVehicleCategoriesApi();
      const sortedData = response.sort((a, b) => b.id - a.id);

      setVehicleData(sortedData);

      setShowEditModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      toast.error('An error occurred while updating the vehicle.');
      console.error('Update error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete?.id) return;

    setDeleteLoading(true);

    try {
      await deletevehiclecategory(vehicleToDelete.id);
      toast.success("Vehicle deleted successfully");

      // Refresh vehicle list
      const response = await getVehicleCategoriesApi();
      const sortedData = response.sort((a, b) => b.id - a.id);
      setVehicleData(sortedData);

      // Close modal
      setShowDeleteModal(false);  
      setVehicleToDelete(null);
    } catch (error) {
      toast.error("Error deleting vehicle");
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDisable = async () => {
    setDisableLoading(true);
    try {
      toast.success(`Vehicle "${vehicleToDisable.make} ${vehicleToDisable.model}" disabled successfully!`);
      const response = await getVehicleCategoriesApi();
      const sortedData = response.sort((a, b) => b.id - a.id);
      setVehicleData(sortedData);
    } catch (error) {
      toast.error('Failed to disable the vehicle.');
      console.error('Disable error:', error);
    } finally {
      setDisableLoading(false);
      setShowDisableModal(false);
      setVehicleToDisable(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden mr-4 sm:mr-6 md:mr-10 lg:mr-16 xl:mr-20 2xl:mr-24">
      {/* Table */}
      <div className="overflow-x-auto">
        {vehicleData.length > 0 ? (
          <div className="relative z-10 w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">BRAND NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">MODEL NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">YEAR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">VARIANT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {vehicleData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : ''}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.make}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.variant}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 relative">
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === item.id && (
                        <div className="absolute flex right-5 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <button
                            onClick={() => handleAction('Edit', item)}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleAction('Delete', item)}
                            className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleAction('Disable', item)}
                            className="flex items-center px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors w-full"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Disable
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (
          ''
        )}
      </div>



      {/* Click outside to close dropdown */}
      {openDropdown && <div className="fixed inset-0 z-5" onClick={() => setOpenDropdown(null)} />}

      {/* ----------- Edit Vehicle Modal ----------- */}
      {
        showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">Edit Vehicle</h2>

              <form onSubmit={handleEditSave} className="space-y-4">
                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <input
                    type="text"
                    value={editedMake}
                    onChange={(e) => setEditedMake(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={editedModel}
                    onChange={(e) => setEditedModel(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Year - Select Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <div className="relative">
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editedYear}
                      onChange={(e) => setEditedYear(e.target.value)}
                    >
                      <option value="">Select Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Variant - Select Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                  <div className="relative">
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md bg-white  appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editedVariant}
                      onChange={(e) => setEditedVariant(e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                    <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ----------- Delete Confirmation Modal ----------- */}
      {
        showDeleteModal && vehicleToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Vehicle</h2>
              <p className="mb-4">
                Are you sure you want to permanently delete the vehicle{' '}
                <strong className="text-red-600">
                  {vehicleToDelete.make} {vehicleToDelete.model} {vehicleToDelete.year}
                </strong>
                ?
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
        )
      }

      {/* ----------- Disable Confirmation Modal ----------- */}
      {
        showDisableModal && vehicleToDisable && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowDisableModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4 text-orange-600">Disable Vehicle</h2>
              <p className="mb-4">
                Are you sure you want to disable the vehicle{' '}
                <strong className="text-orange-600">
                  {vehicleToDisable.make} {vehicleToDisable.model} {vehicleToDisable.year}
                </strong>
                ?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setShowDisableModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm bg-orange-600 text-white hover:bg-orange-700 rounded disabled:opacity-50"
                  onClick={handleConfirmDisable}
                  disabled={disableLoading}
                >
                  {disableLoading ? 'Disabling...' : 'Disable'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default VehicleTable;