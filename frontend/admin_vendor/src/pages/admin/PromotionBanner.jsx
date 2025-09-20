import React, { useEffect, useState } from "react";
import { AiFillPlusSquare } from "react-icons/ai";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  createPromotionBannerApi,
  getAllPromotionBannersApi,
  deletePromotionBannerApi,
} from "../../services/allAPI";

const PromotionBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await getAllPromotionBannersApi();
      setBanners(data);
    } catch (error) {
      console.error("Failed to fetch banners", error);
      toast.error("Failed to load banners");
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImage) {
      toast.error("Title and Image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", bannerTitle);
    formData.append("image", bannerImage);

    try {
      setLoading(true);
      await createPromotionBannerApi(formData);
      toast.success("Banner created successfully");
      setBannerTitle("");
      setBannerImage(null);
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteBanner = (id) => {
    setBannerToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;
    try {
      await deletePromotionBannerApi(bannerToDelete);
      toast.success("Banner deleted successfully");
      setDeleteModalOpen(false);
      setBannerToDelete(null);
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="mb-8">
      {/* Heading with Plus Icon */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Award className="mr-2 text-purple-600" />
          Featured Promotions
        </h2>
        <AiFillPlusSquare
          size={40}
          className="text-[#5727B4] cursor-pointer hover:text-purple-800"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Banner Slider */}
      {banners.length > 0 ? (
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((promo) => (
              <div key={promo.id} className="w-full flex-shrink-0 relative">
                <div className="flex flex-col items-center p-8">
                  <img
                    src={promo.image}
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                  {/* <h3 className="text-xl font-bold text-gray-800">
                    {promo.title}
                  </h3> */}
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => confirmDeleteBanner(promo.id)}
                  className="text-red-700  p-2 rounded-lg flex items-center justify-center hover:text-red-700 transition-colors shadow cursor-pointer absolute top-10 right-10 bg-white/70 hover:bg-white"
                >
                  <RiDeleteBin6Line size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? "bg-purple-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No banners available</p>
      )}

      {/* Create Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create New Banner</h3>
            <form onSubmit={handleCreateBanner}>
              <input
                type="text"
                placeholder="Banner Title"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImage(e.target.files[0])}
                className="w-full mb-3 p-2 border rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this banner?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBanner}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionBanner;
