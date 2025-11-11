import React, { useState, useEffect } from 'react';
import {
  getAllPromotionsApi,
  getCategoriesByAll,
  getProductsByCategory,
} from '../services/allAPI';
import PromotionCard from './admin/PromotionCard';

const PromotionsList = () => {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);


  const fetchPromotions = async () => {
    try {
      const res = await getAllPromotionsApi();
      setPromotions(res?.data || res?.message || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      await fetchPromotions();

      const categories = await getCategoriesByAll();
      setAllCategories(categories || []);

      if (categories?.length > 0) {
        const products = await getProductsByCategory(categories[0].id);
        setFilteredProducts(products || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ✅ Category change handler (for modal dropdown)
  const handleCategoryChange = async (categoryId) => {
    try {
      const products = await getProductsByCategory(categoryId);
      setFilteredProducts(products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // ✅ After deletion
  const handleDelete = (deletedId) => {
    setPromotions((prev) => prev.filter((p) => p.id !== deletedId));
  };

  // ✅ Handle after update (live update)
  const handleUpdate = async () => {
    await fetchPromotions();
  };

  const displayedPromotions = showAll
    ? promotions
    : promotions.slice(0, 6);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Active Promotions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(displayedPromotions) && displayedPromotions.length > 0 ? (
          displayedPromotions.map((promo) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              onSelect={() => setSelectedPromotion(promo)}
              onDelete={handleDelete}
              fetchPromotions={handleUpdate} // ✅ refresh instantly after edit
            />
          ))
        ) : (
          <p>No active promotions available.</p>
        )}
      </div>

      {/* View All / Show Less Button */}
      {promotions.length > 6 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {selectedPromotion && (
        <PromotionCard
          promotion={selectedPromotion}
          isModal={true}
          onClose={() => setSelectedPromotion(null)}
          allCategories={allCategories}
          allProducts={filteredProducts}
          fetchPromotions={handleUpdate}
          onUpdate={(updatedPromo) => setSelectedPromotion(updatedPromo)}
        />

      )}
    </div>
  );
};

export default PromotionsList;
