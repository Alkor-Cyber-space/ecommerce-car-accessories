import React, { useState, useEffect } from 'react';
import { getAllPromotionsApi, getCategoriesByAll, getProductsByCategory } from '../services/allAPI';
import PromotionCard from './admin/PromotionCard';

const PromotionsList = () => {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Products filtered by category

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promos = await getAllPromotionsApi();
        setPromotions(promos.message);

        const categories = await getCategoriesByAll();
        setAllCategories(categories);

        if (categories.length > 0) {
          const products = await getProductsByCategory(categories[0].id);
          setAllProducts(products);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);


  // Handler for category selection inside modal
  const handleCategoryChange = async (categoryId) => {
    try {
      const products = await getProductsByCategory(categoryId);
      setFilteredProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const [showAll, setShowAll] = useState(false);

  const displayedPromotions = showAll ? promotions : promotions.slice(0, 6);
  const handleDelete = (deletedId) => {
    setPromotions(prevPromotions => prevPromotions.filter(promotion => promotion.id !== deletedId));
  };
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
              onDelete={handleDelete} // <-- Pass the handler
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
          allProducts={filteredProducts} // Only show filtered products
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          onCategoryChange={handleCategoryChange} // Pass handler to modal
        />
      )}
    </div>
  );
};

export default PromotionsList;

