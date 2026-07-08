import React, { useState } from "react";
import { requestCategoryApi } from "../../services/allAPI";
import { toast } from "react-toastify";

const NewCategoryRequest = () => {
    const [categoryImage, setCategoryImage] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        discription: "", // spelling matches backend
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append("name", formData.name);
        form.append("discription", formData.discription);
        if (categoryImage) {
            form.append("image", categoryImage);
        }

        try {
            const result = await requestCategoryApi(form);
            console.log("Category Request Successful:", result);
            toast("Category request submitted successfully!");
            setFormData({ name: "", discription: "" });
            setCategoryImage(null);
        } catch (error) {
            console.error("Error submitting category:", error);
            toast("Something went wrong!");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow">
            <div className=" mb-2">
                <h2 className="text-lg font-semibold">Category Request</h2>
                <span className="text-sm text-gray-500">
                    (Use this section to request a new category if you can't find the appropriate one.)
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name
                    </label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter a category name"
                        className="w-full border rounded px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCategoryImage(e.target.files[0])}
                        className="w-full border rounded px-4 py-2 mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        name="discription"
                        value={formData.discription}
                        onChange={handleChange}
                        placeholder="Enter description"
                        className="w-full border rounded px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#5737B4]"
                    ></textarea>
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={!formData.name || !formData.discription}
                    className="bg-[#5737B4] text-white px-6 py-2 rounded hover:bg-[#442f96] transition"
                >
                    Submit Request
                </button>
            </div>
        </form>
    );
};

export default NewCategoryRequest;
