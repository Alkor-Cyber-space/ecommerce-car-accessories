import React, { useEffect, useState } from 'react';
import { promotionByIdApi } from '../../services/allAPI';

const PromotionCard = ({ promotion, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const data = await promotionByIdApi(promotion.id);
        console.log("Fetched promotion details:", data);
        // You can set the fetched data to state if needed
      } catch (error) {
        console.error('Error fetching promotion details:', error);
      }
    };
    fetchPromotion();
  }, []);

  return (
    <>
      {/* Promotion Card */}
      <div
        className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center mb-2">
          <div className="bg-red-500 text-white p-2 rounded-full mr-2">🛒</div>
          <div>
            <h3 className="font-semibold">{promotion.name}</h3>
            <p className="text-sm font-bold">
              {promotion.promotion_type === 'BOGO'
                ? 'Buy One Get One Free'
                : `₹${promotion.value} OFF`}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {promotion.details?.map(d => d.category_name).join(', ')}
        </p>
        <p className="text-xs text-gray-500">{promotion.details?.length} items</p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h2 className="text-xl font-bold mb-4">{promotion.name}</h2>
            <p className="mb-2">
              <strong>Type:</strong>{' '}
              {promotion.promotion_type === 'BOGO'
                ? 'Buy One Get One Free'
                : promotion.promotion_type}
            </p>
            {promotion.promotion_type !== 'BOGO' && (
              <p className="mb-2">
                <strong>Value:</strong> ₹{promotion.value}
              </p>
            )}
            <p className="mb-2">
              <strong>Code:</strong> {promotion.code}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {promotion.description}
            </p>
            <p className="mb-2">
              <strong>Start Date:</strong> {promotion.start_date}
            </p>
            <p className="mb-2">
              <strong>End Date:</strong> {promotion.end_date}
            </p>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  onEdit(promotion);
                  setIsModalOpen(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(promotion.id);
                  setIsModalOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Usage Example
const PromotionsList = ({ promotions, handleEdit, handleDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {promotions.map(promo => (
        <PromotionCard
          key={promo.id}
          promotion={promo}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default PromotionsList;
