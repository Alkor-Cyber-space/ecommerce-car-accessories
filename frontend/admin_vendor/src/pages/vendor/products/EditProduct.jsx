import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import {
  deleteProductApi,
  getCategoriesApi,
  getVariantYearsApi,
  updateProductApi,
  deleteProductImageAPi,
} from "../../../services/allAPI";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { fetchProductById } from "../../../store/productSlice";

export default function EditProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { productDetails } = useSelector((state) => state.products);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: null,
    size: "",
    manufacturing_date: "",
    tag: [],
    isActive: false,
    is_available: false,
    length: "",
    breadth: "",
    height: "",
    weight: "",
    compatible_varient_year_ids: [],
  });
  const [productImages, setProductImages] = useState({});
  const [categories, setCategories] = useState([]);
  const [varientYears, setVarientYears] = useState([]);

  const [imagePreviews, setImagePreviews] = useState(Array(6).fill(null));
  const inputRefs = useRef([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  //  Sync fetched product to formData
  useEffect(() => {
    if (productDetails && productDetails.id) {
      setFormData({
        name: productDetails.name || "",
        description: productDetails.description || "",
        price: productDetails.price || "",
        stock: productDetails.stock || "",
        category: productDetails.category || null,
        size: productDetails.size || "",
        manufacturing_date: productDetails.manufacturing_date || "",
        tag: Array.isArray(productDetails.tag) ? productDetails.tag : [],
        isActive: Boolean(productDetails.isActive),
        // prefer explicit is_available if backend provides it, otherwise mirror isActive
        is_available: productDetails.hasOwnProperty("is_available")
          ? Boolean(productDetails.is_available)
          : Boolean(productDetails.isActive),
        length: productDetails.length || "",
        breadth: productDetails.breadth || "",
        height: productDetails.height || "",
        weight: productDetails.weight || "",
        compatible_varient_year_ids:
          productDetails.compatible_varient_year?.map((v) => v.id) || [],
      });

      if (productDetails.image_list?.length) {
        const previews = Array(6).fill(null);
        productDetails.image_list.forEach((img, idx) => {
          if (img.image && idx < 6) {
            previews[idx] = img;
          }
        });
        setImagePreviews(previews);
      }
    }
  }, [productDetails]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesApi();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVariantYears = async () => {
      try {
        const data = await getVariantYearsApi();
        setVarientYears(data);
      } catch (error) {
        setVarientYears([]);
      }
    };
    fetchVariantYears();
  }, []);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setFormData((prev) => {
        // Prevent duplicate tags
        if (!prev.tag.includes(inputValue.trim())) {
          return { ...prev, tag: [...prev.tag, inputValue.trim()] };
        }
        return prev;
      });
      setInputValue("");
    }
  };

  // Remove tag
  const removeTag = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tag: prev.tag.filter((_, index) => index !== indexToRemove),
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "tag"
          ? value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : value,
    }));
  };

  const handleReplace = (index) => {
    if (imagePreviews[index]) {
      // If there's an existing image, delete it first
      handleImageDelete(index).then(() => {
        // After successful deletion, trigger file input
        inputRefs.current[index]?.click();
      });
    } else {
      // If no existing image, just trigger file input
      inputRefs.current[index]?.click();
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Create object URL for the new file
    const imageUrl = URL.createObjectURL(file);

    // Update imagePreviews while preserving other images
    setImagePreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      newPreviews[index] = {
        id: null,
        image: imageUrl,
        url: imageUrl, // Add url property for consistency
        file, // Store file reference
      };
      return newPreviews;
    });

    // Update productImages while preserving other images
    const keys = ["main", "close", "other1", "other2", "other3", "other4"];
    const key = keys[index];
    setProductImages((prevImages) => ({
      ...prevImages,
      [index]: file, // use index as the key
    }));

    // Clear the file input for future use
    e.target.value = "";
  };

  const [loading, setLoading] = useState(false);

  const handleImageDelete = async (index) => {
    try {
      setLoading(true);
      const imgObj = imagePreviews[index];

      // Delete from server if it's an existing image with an ID
      if (imgObj?.id) {
        await deleteProductImageAPi(imgObj.id);
        toast.success("Image deleted successfully!");
      }

      // Clear local preview state
      const newPreviews = [...imagePreviews];
      newPreviews[index] = null;
      setImagePreviews(newPreviews);

      // Clear the file input
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = "";
      }

      // Clear from productImages state
      const keys = ["main", "close", "other1", "other2", "other3", "other4"];
      const key = keys[index];
      setProductImages((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting product image:", error);
      toast.error("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const form = new FormData();
    form.append("name", formData.name || "");
    form.append("description", formData.description || "");
    form.append("price", formData.price || "");
    form.append("stock", formData.stock || "");
    form.append("category_id", formData.category?.id || "");
    form.append("size", formData.size || "");
    form.append("manufacturing_date", formData.manufacturing_date || "");
    form.append("tag", formData.tag || "");
    form.append("isActive", formData.isActive ? "true" : "false");
    // include availability flag (mirror AddProduct behaviour)
    form.append("is_available", formData.is_available ? "true" : "false");
    form.append("length", formData.length || "");
    form.append("breadth", formData.breadth || "");
    form.append("height", formData.height || "");
    form.append("weight", formData.weight || "");
    //     if (Array.isArray(formData.compatible_varient_year)) {
    //      form.append(
    //   "compatible_varient_year_ids",
    //   JSON.stringify(formData.compatible_varient_year.map((id) => parseInt(id)))
    // );
    // if (Array.isArray(formData.compatible_varient_year_ids)) {
    //   formData.compatible_varient_year_ids.forEach(id => {
    //     form.append("compatible_varient_year_ids", id); // append each separately
    //   });
    // }

    //     }
    if (Array.isArray(formData.compatible_varient_year_ids)) {
      formData.compatible_varient_year_ids.forEach((id) => {
        form.append("compatible_varient_year_ids", id); // append each separately
      });
    }

    Object.values(productImages).forEach((file) => {
      if (file) {
        form.append("images", file);
      }
    });

    try {
      await updateProductApi(id, form);
      toast.success("Product updated successfully!");
      navigate("/vendor/products");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err.response?.data?.compatible_varient_year_ids?.[0] ||
          err.response?.data?.detail ||
          "Failed to update product."
      );
    }
  };

  const handleDeleteConfirm = () => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this product?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleDelete(id),
        },
        { label: "No" },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteProductApi(id);

      toast.success(" Product deleted successfully!", response);

      setTimeout(() => {
        navigate("/vendor/products", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(" Failed to delete product.");
    }
  };

  const handleCancel = () => {
    navigate(`/vendor/products/`);
  };

  const ProductImagesSection = () => (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Product Images</h2>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1 group">
            <label className="text-sm font-medium text-gray-700">
              Image {i + 1}
            </label>
            <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm cursor-pointer group">
              {imagePreviews[i] ? (
                <img
                  src={
                    typeof imagePreviews[i] === "string"
                      ? imagePreviews[i]
                      : imagePreviews[i]?.url
                  }
                  alt={`Preview ${i + 1}`}
                  className="object-cover h-full w-full rounded-lg"
                />
              ) : (
                <span>Upload an image</span>
              )}

              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center gap-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {/* Replace */}
                <button
                  type="button"
                  onClick={() => handleReplace(i)}
                  className="flex flex-col items-center text-white"
                >
                  <RiArrowLeftRightFill className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Replace</span>
                </button>
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleImageDelete(i)}
                  className="flex flex-col items-center text-white"
                >
                  <RxCross2 className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>

              {/* Hidden input */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => (inputRefs.current[i] = el)}
                onChange={(e) => handleFileChange(e, i)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#ECECF0] min-h-screen">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-semibold mb-6">
          <Link
            to="/vendor/products"
            className="text-[#5737B4] hover:underline pr-3"
          >
            Product Management
          </Link>
          / Edit {formData.name}
        </h1>
        <div className="sm:flex items-center gap-3">
          <span className="text-md font-medium text-[#5737B4]">
            Product Active
          </span>
          <div
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                // flip isActive and is_available; if is_available is undefined use isActive as source
                isActive: !prev.isActive,
                is_available: !(prev.is_available ?? prev.isActive),
              }))
            }
            className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              formData.is_available ?? formData.isActive
                ? "bg-[#5737B4]"
                : "bg-gray-300"
            }`}
          >
            {/* reflect combined availability for visual position */}
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                formData.is_available ?? formData.isActive
                  ? "translate-x-7"
                  : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div>
              <label className="font-medium">Product Name</label>
              <input
                name="name"
                value={
                  formData.name ||
                  "LumoBeam X9 LED Car Headlight -  6000K Cool White (H4, 60W) "
                }
                onChange={handleChange}
                type="text"
                className="mt-1 border px-3 py-2 rounded-md w-full"
              />
            </div>
            <div>
              <label className="font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="mt-1 border px-3 py-2 rounded-md w-full"
              />
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow">
            <h2 className="text-lg font-semibold">Price</h2>
            <div className="flex gap-4 md:flex-col sm:flex-row">
              <div className="flex-1">
                <label className="text-sm font-medium">Stock Number</label>
                <input
                  name="stock"
                  value={formData.stock || "h667h"}
                  onChange={handleChange}
                  type="text"
                  className="mt-1 border px-3 py-2 rounded-md w-full"
                />
              </div>
              <div className="flex-1">
                <label className="font-medium">Unit Price</label>
                <input
                  name="price"
                  value={formData.price || "5600"}
                  onChange={handleChange}
                  type="number"
                  className="mt-1 border px-3 py-2 rounded-md w-full"
                />
              </div>
            </div>
          </div>

          {/* Others */}
          <div className="bg-white rounded-xl p-6 space-y-4 shadow">
            <h2 className="text-lg font-semibold">Others</h2>
            <div className="flex gap-4 md:flex-col sm:flex-row">
              <div className="flex gap-4 flex-col ">
                <div className="flex flex-col flex-1">
                  <label className="font-medium">Sizes Available</label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="border rounded px-4 py-2 mt-1"
                  >
                    <option value="">(Optional)</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="X-Large">X-Large</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* First row: Length and weight */}
                  <div className="flex flex-col">
                    <label htmlFor="length" className="font-medium">
                      Length{" "}
                    </label>
                    <input
                      id="length"
                      name="length"
                      value={formData.length || ""}
                      onChange={handleChange}
                      type="number"
                      className="border rounded px-4 py-2 mt-1"
                      placeholder="0 cm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="weight" className="font-medium">
                      weight{" "}
                    </label>
                    <input
                      id="weight"
                      name="weight"
                      value={formData.weight || ""}
                      onChange={handleChange}
                      type="number"
                      className="border rounded px-4 py-2 mt-1"
                      placeholder="0 grams"
                    />
                  </div>

                  {/* Second row: Height and Breadth */}
                  <div className="flex flex-col">
                    <label htmlFor="height" className="font-medium">
                      Height{" "}
                    </label>
                    <input
                      id="height"
                      name="height"
                      value={formData.height || ""}
                      onChange={handleChange}
                      type="number"
                      className="border rounded px-4 py-2 mt-1"
                      placeholder="0 cm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="breadth" className="font-medium">
                      Breadth{" "}
                    </label>
                    <input
                      id="breadth"
                      name="breadth"
                      value={formData.breadth || ""}
                      onChange={handleChange}
                      type="number"
                      className="border rounded px-4 py-2 mt-1"
                      placeholder="0 cm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <label className="font-medium">Manufacturing Date</label>
                <input
                  name="manufacturing_date"
                  value={formData.manufacturing_date || ""}
                  onChange={handleChange}
                  type="date"
                  className="mt-1 border px-3 py-2 rounded-md w-full"
                />
              </div>
            </div>
            <div>
              <label className="font-medium">Product Category</label>
              <select
                name="category"
                value={formData.category?.id || ""}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selectedName =
                    e.target.options[e.target.selectedIndex].text;
                  setFormData((prev) => ({
                    ...prev,
                    category: { id: selectedId, name: selectedName },
                  }));
                }}
                className="mt-1 border px-3 py-2 rounded-md w-full"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 w-full lg:w-[45%]">
          {/* Product Images */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Product Images</h2>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1 group">
                  <label className="text-sm font-medium text-gray-700">
                    Image {i + 1}
                  </label>
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm cursor-pointer group">
                    {imagePreviews[i] ? (
                      <img
                        src={imagePreviews[i].image}
                        alt={`Preview ${i + 1}`}
                        className="object-cover h-full w-full rounded-lg"
                      />
                    ) : (
                      <span>Upload an image</span>
                    )}

                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center gap-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {/* Replace Button */}
                      <button
                        type="button"
                        onClick={() => handleReplace(i)}
                        className="flex flex-col items-center text-white"
                      >
                        <RiArrowLeftRightFill className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">Replace</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleImageDelete(i)}
                        className="flex flex-col items-center text-white"
                        disabled={loading}
                      >
                        <RxCross2 className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">
                          {loading ? "Deleting..." : "Delete"}
                        </span>
                      </button>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => (inputRefs.current[i] = el)}
                      onChange={(e) => handleFileChange(e, i)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {/* <div className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <input
                            name="tags"
                            value={Array.isArray(formData.tag) ? formData.tag.join(", ") : formData.tag || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tag: e.target.value.split(",").map((tag) => tag.trim()),
                                })
                            }
                            placeholder=" tags"
                            className="mt-1 border px-3 py-2 rounded-md w-full"
                        />
                    </div> */}
          {/* Tags */}
          <div className="border bg-white rounded-md px-3 py-2 flex flex-wrap gap-2 w-full min-h-[45px]">
            {Array.isArray(formData.tag) &&
              formData.tag.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[#ECECF0] text-[#505050] px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press Enter"
              className="flex-1 outline-none text-sm min-w-[120px]"
            />
          </div>
          {/* Compatible Variant Years */}
          <div className="bg-white rounded-xl p-6 shadow overflow-y-auto max-h-30 scrollbar-none">
            <h2 className="text-lg font-semibold mb-2">
              Compatible Variant Years
            </h2>

            {Array.isArray(varientYears) && varientYears.length > 0 ? (
              <div className="space-y-2">
                {varientYears.map((year) => (
                  <label
                    key={year.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="compatible_varient_year_ids"
                      value={year.id}
                      checked={formData.compatible_varient_year_ids?.includes(
                        year.id
                      )}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        let updatedYears = [
                          ...(formData.compatible_varient_year_ids || []),
                        ];

                        if (checked) {
                          updatedYears.push(year.id);
                        } else {
                          updatedYears = updatedYears.filter(
                            (id) => id !== year.id
                          );
                        }

                        setFormData({
                          ...formData,
                          compatible_varient_year_ids: updatedYears,
                        });
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span>
                      {year.make} {year.model} {year.variant} ({year.year})
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading or no data</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex sm:flex-col md:flex-row justify-end gap-4">
        <button
          className="border border-[#FF5A65] text-[#FF5A65] bg-[#FFDEE0] rounded-sm px-5 py-1"
          onClick={handleDeleteConfirm}
        >
          Delete Product
        </button>

        <button
          className="border border-[#5737B4] text-[#5737B4] rounded-sm px-10 py-1"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <button
          className="border bg-[#5737B4] text-white rounded-sm px-14 py-1"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
