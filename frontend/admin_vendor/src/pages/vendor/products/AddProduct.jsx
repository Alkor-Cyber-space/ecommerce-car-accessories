import React, { useEffect, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
// import { useDispatch, useSelector } from "react-redux";
// import { updateField, toggleActive, updateTags, updateImage, resetForm } from "../../../store/productFormSlice";
import { RiArrowLeftRightFill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowDown } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addProductApi, getCategoriesApi, getVariantYearsApi } from "../../../services/allAPI";
import NewCategoryRequest from "../../../components/vendor/NewCategoryRequest";

// tags component
const TagInput = ({ value, onChange }) => {
    const [input, setInput] = useState("");

    const addTag = (e) => {
        if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault();
            const newTags = [...value, input.trim()];
            onChange(newTags);
            console.log(newTags);

            setInput("");
        }
    };

    const removeTag = (index) => {
        const updated = [...value];
        updated.splice(index, 1);
        onChange(updated);
    };



    return (
        <div className="border rounded px-2 py-2 w-full mt-2  flex flex-wrap items-center gap-2">
            {value.map((tag, idx) => (
                <span
                    key={idx}
                    className="flex items-center gap-1 bg-[#ECECF0] text-[#505050] text-lg font-medium px-2 py-1 "
                >
                    {tag}
                    <button onClick={() => removeTag(idx)}>
                        <RxCross2 className="w-4 h-4" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={addTag}
                className="flex-grow outline-none text-sm px-2 py-1"
            />
        </div>
    );
};
// Add Product component
const AddProduct = () => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState([]);
    const [varientYears, setvarientYears] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        manufactureDate: '',
        is_available: true,
        tags: [],
        category: '',
        sizes: '',
        compatible_varient_year: [],
        images: {},
        length: '',
        weight: '',
        height: '',
        breadth: ''
    });
    const [imagePreviews, setImagePreviews] = useState(Array(6).fill(null));
    const [dragActiveIndex, setDragActiveIndex] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const handleToggle = () => {
        setIsActive(prev => {
            const next = !prev;
            // sync into formData so payload includes availability
            setFormData(f => ({ ...f, is_available: next }));
            return next;
        });
    };

    const inputRefs = useRef([]);

    const imageKeys = ["main", "close", "other1", "other2", "other3", "other4"];

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoriesApi();

                const availableCategories = data.filter(cat => cat.available === true);

                setCategories(availableCategories);
            } catch (error) {
                toast.error('Error fetching categories');
            }
        };

        fetchCategories();
    }, []);


    useEffect(() => {
        const fetchVariantYears = async () => {
            try {
                const data = await getVariantYearsApi();
                setvarientYears(data);
                console.log(data);

            } catch (error) {
                setvarientYears([]);
            }
        };

        fetchVariantYears();
    }, []);

    const atLeastOneImageSelected = imageKeys.some((key) => formData.images[key]);

    const isFormComplete =
        formData.name &&
        formData.description &&
        formData.price &&
        formData.category &&
        formData.tags.length > 0 &&
        formData.length &&
        formData.breadth &&
        formData.height &&
        formData.weight &&
        atLeastOneImageSelected;

    const handleSave = async (e) => {
        e.preventDefault();

        if (!isFormComplete) {
            toast.error("Please complete the form");
            return;
        }

        const formDataToSend = new FormData();

        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("price", formData.price);
        formDataToSend.append("stock", formData.stock);
        formDataToSend.append("manufacturing_date", formData.manufactureDate);
        formDataToSend.append("category_id", formData.category);
        formDataToSend.append("length", formData.length);
        formDataToSend.append("weight", formData.weight);
        formDataToSend.append("height", formData.height);
        formDataToSend.append("breadth", formData.breadth);
        // include availability flag
        formDataToSend.append("is_available", formData.is_available ? "true" : "false");
        // also include isActive for compatibility with edit flow
        formDataToSend.append("isActive", formData.is_available ? "true" : "false");
        if (formData.compatible_varient_year) {
            const yearIds = Array.isArray(formData.compatible_varient_year)
                ? formData.compatible_varient_year
                : [formData.compatible_varient_year];

            yearIds.forEach((id) => {
                formDataToSend.append("compatible_varient_year_ids", id);
            });
        }

        // Send tags as comma-separated string for better compatibility
        if (formData.tags && formData.tags.length > 0) {
            const tagsString = formData.tags.join(', ');
            formDataToSend.append("tag", tagsString);
        }

        if (formData.sizes) {
            formDataToSend.append("size", formData.sizes);
        }


        for (let pair of formDataToSend.entries()) {
            console.log(pair[0], pair[1]);
        }

        imageKeys.forEach((key, index) => {
            if (formData.images?.[key]) {
                formDataToSend.append(`images_${index}`, formData.images[key]);
            }
        });

        try {
            const response = await addProductApi(formDataToSend);
            toast.success("Product added successfully");

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                manufactureDate: '',
                is_available: true,
                tags: [],
                category: '',
                sizes: '',
                compatible_varient_year: [],
                images: {},
                length: '',
                weight: '',
                height: '',
                breadth: ''
            });
            setImagePreviews(Array(6).fill(null));
            setIsActive(true);
            navigate("/vendor/products");
        } catch (error) {
            console.error("Error adding product:", error.response?.data || error.message);
            toast.error("Failed to add product");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedValue = name === "category" ? parseInt(value) : value;
        setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    };

    const handleFile = (file, index) => {
        if (!file || !allowedTypes.includes(file.type)) return;
        const newPreviews = [...imagePreviews];
        newPreviews[index] = URL.createObjectURL(file);
        setImagePreviews(newPreviews);

        const key = imageKeys[index];
        if (key) {
            setFormData((prev) => ({
                ...prev,
                images: {
                    ...prev.images,
                    [key]: file,
                },
            }));
        }
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        setDragActiveIndex(null);
        const file = e.dataTransfer.files[0];
        handleFile(file, index);
    };
    const handleBrowse = (index) => {
        if (inputRefs.current[index]) inputRefs.current[index].click();
    };

    return (
        <>
            <div className="flex justify-between items-end gap-4 mb-1">
                <h1 className="text-2xl font-semibold mb-1">
                    <Link to="/vendor/products" className="text-[#5737B4] hover:underline pr-3">
                        Product Management
                    </Link>
                    / Add Product
                </h1>
                <div className="flex md:flex-row lg:flex-row sm:flex-col gap-2  items-center">
                    <div className="sm:flex gap-2">
                        <span className="text-sm font-medium text-[#5737B4]">Product Active</span>
                        <div
                            onClick={handleToggle}
                            className={`w-14 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? "bg-[#5737B4]" : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive
                                    ? "lg:translate-x-8 sm:translate-x-5 translate-x-8"
                                    : "translate-x-0"
                                    }`}
                            />
                        </div>
                    </div>
                    {/* <div className="relative inline-block text-left">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm font-medium text-[#5737B4] border border-[#5737B4] rounded hover:bg-[#5737B4] hover:text-white transition"
                        >
                            Bulk Upload
                            <IoIosArrowDown />
                        </button>

                        {showDropdown && (
                            <div className="absolute left-0 mt-2 w-35 rounded-md shadow-lg bg-white z-10">
                                <ul className="py-1 text-sm text-gray-700">
                                    <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">Upload as Excel</li>
                                    <span className="w-30 h-full">(only .csv % .svg files can upload)</span>
                                </ul>
                            </div>
                        )}
                    </div> */}

                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 mt-2">
                {/* Left Column */}
                <div className="flex flex-col gap-6 flex-1">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl p-4 space-y-3 shadow">
                        <h2 className="text-lg font-semibold underline">Basic Information</h2>
                        <div className="flex flex-col">
                            <label className="font-medium">Product Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} type="text" className="border rounded px-4 py-2 mt-1" />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-medium">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="border rounded px-4 py-2 mt-1" />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-white rounded-xl p-4 space-y-1 shadow">
                        <h2 className="text-lg font-semibold underline">Price</h2>
                        <div className="flex gap-4 flex-col ">
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Stock</label>
                                <input name="stock" value={formData.stock || ''} onChange={handleChange} type="number" className="border rounded px-4 py-2 mt-1" placeholder="0" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Unit Price</label>
                                <input name="price" value={formData.price || ''} onChange={handleChange} type="number" className="border rounded px-4 py-2 mt-1" placeholder="₹" />
                            </div>
                        </div>
                    </div>

                    {/* Others */}
                    <div className="bg-white rounded-xl p-4 space-y-1 shadow">
                        <h2 className="text-lg font-semibold underline">Others</h2>
                        <div className="flex gap-2 flex-col ">
                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Sizes Available</label>
                                <select name="sizes" value={formData.sizes || ''} onChange={handleChange} type="text" className="border rounded px-4 py-2 mt-1" placeholder="(Optional)" >
                                    <option value="" disabled>(Optional)</option>
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                    <option value="X-Large">X-Large</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {/* First row: Length and weight */}
                                <div className="flex flex-col">
                                    <label htmlFor="length" className="font-medium">Length </label>
                                    <input
                                        id="length"
                                        name="length"
                                        value={formData.length || ''}
                                        onChange={handleChange}
                                        type="number"
                                        className="border rounded px-4 py-2 mt-1"
                                        placeholder="0 cm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="weight" className="font-medium">weight </label>
                                    <input
                                        id="weight"
                                        name="weight"
                                        value={formData.weight || ''}
                                        onChange={handleChange}
                                        type="number"
                                        className="border rounded px-4 py-2 mt-1"
                                        placeholder="0 grams"
                                    />
                                </div>

                                {/* Second row: Height and Breadth */}
                                <div className="flex flex-col">
                                    <label htmlFor="height" className="font-medium">Height </label>
                                    <input
                                        id="height"
                                        name="height"
                                        value={formData.height || ''}
                                        onChange={handleChange}
                                        type="number"
                                        className="border rounded px-4 py-2 mt-1"
                                        placeholder="0 cm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="breadth" className="font-medium">Breadth </label>
                                    <input
                                        id="breadth"
                                        name="breadth"
                                        value={formData.breadth || ''}
                                        onChange={handleChange}
                                        type="number"
                                        className="border rounded px-4 py-2 mt-1"
                                        placeholder="0 cm"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col flex-1">
                                <label className="font-medium">Manufacturing Date</label>
                                <input name="manufactureDate" value={formData.manufactureDate || ''} onChange={handleChange} type="date" className="border rounded px-4 py-2 mt-1" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-medium">Product Category</label>
                            <select
                                name="category"
                                value={formData.category || ''}
                                onChange={handleChange}
                                className="border rounded px-4 py-2 mt-1 bg-white"
                            >
                                <option value=""></option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 w-full lg:w-[45%]">
                    {/* Product Images */}
                    <div className="bg-white rounded-xl p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2 underline">Product Images</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {["Main Image", "Close View", "Other Image 1", "Other Image 2", "Other Image 3", "Other Image 4"].map((label, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">{label}</label>
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragActiveIndex(index);
                                        }}
                                        onDragLeave={() => setDragActiveIndex(null)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onClick={() => handleBrowse(index)}
                                        className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center text-center  cursor-pointer transition relative overflow-hidden ${dragActiveIndex === index ? "border-blue-500 bg-blue-50" : "border-gray-400"}`}
                                    >
                                        {imagePreviews[index] ? (
                                            <div className="relative w-full h-full group">
                                                <img
                                                    src={imagePreviews[index]}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />

                                                {/* Overlay shown only on hover */}
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center gap-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    {/* Replace Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            inputRefs.current[index]?.click();
                                                        }}
                                                        className="flex flex-col items-center text-white"
                                                    >
                                                        <RiArrowLeftRightFill className="w-6 h-6 mb-1" />
                                                        <span className="text-sm font-medium">Replace</span>
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newPreviews = [...imagePreviews];
                                                            newPreviews[index] = null;
                                                            setImagePreviews(newPreviews);
                                                            const key = imageKeys[index];
                                                            if (key) {
                                                                setFormData((prev) => {
                                                                    const updatedImages = { ...prev.images };
                                                                    delete updatedImages[key];
                                                                    return { ...prev, images: updatedImages };
                                                                });
                                                            }
                                                        }}
                                                        className="flex flex-col items-center text-white"
                                                    >
                                                        <RxCross2 className="w-6 h-6 mb-1" />
                                                        <span className="text-sm font-medium">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="z-10 flex flex-col items-center">
                                                <GoPlus className="text-3xl text-gray-500 mb-1" />
                                                <span className="text-sm text-gray-500">Drag and drop here</span>
                                                <span className="text-sm text-[#5737B4] font-semibold underline">Browse Files</span>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            onChange={(e) => handleFile(e.target.files[0], index)}
                                            className="hidden"

                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl p-4 shadow">
                        <h2 className="text-lg font-semibold ">Tags</h2>
                        <label className="text-sm mb-2">Type and enter tags</label>
                        <TagInput
                            value={formData.tags}
                            onChange={(newTags) =>
                                setFormData((prev) => ({ ...prev, tags: newTags }))
                            }
                        />
                    </div>

                    {/* Stock */}
                    <div className="bg-white rounded-xl p-4 shadow overflow-y-auto max-h-30 scrollbar-none">
                        <h2 className="text-lg font-semibold mb-2">Compatible Variant Years</h2>

                        {Array.isArray(varientYears) && varientYears.length > 0 ? (
                            <div className="space-y-2">
                                {varientYears.map((year) => (
                                    <label
                                        key={year.id}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            name="compatible_varient_year"
                                            value={year.id}
                                            checked={formData.compatible_varient_year?.includes(year.id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                let updated = [...(formData.compatible_varient_year || [])];

                                                if (checked) {
                                                    updated.push(year.id);
                                                } else {
                                                    updated = updated.filter((id) => id !== year.id);
                                                }

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    compatible_varient_year: updated,
                                                }));
                                            }}
                                            className="h-4 w-4 text-[#5737B4] focus:ring-[#5737B4] border-gray-300 rounded"
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
                    <NewCategoryRequest />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-5">
                <button
                    onClick={() => navigate('/vendor/products')}
                    className="border border-[#5737B4] text-[#5737B4] px-16 py-2 rounded-md text-sm font-medium hover:bg-[#f1edff] transition">Cancel</button>
                <button
                    onClick={(e) => handleSave(e)}
                    disabled={!isFormComplete}
                    className={`px-16 py-2 rounded-md text-sm font-medium transition ${isFormComplete ? "bg-[#5737B4] text-white hover:bg-[#442f96]" : "bg-[#D8D8D8] text-white cursor-not-allowed"}`}
                >
                    Save
                </button>
            </div>
        </>
    );
};

export default AddProduct;
