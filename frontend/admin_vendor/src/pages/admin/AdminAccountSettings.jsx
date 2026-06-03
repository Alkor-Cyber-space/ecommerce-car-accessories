import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import user from "../../assets/user.jpg";
import {
  getAdminAccountSettingsApi,
  updateAdminAccountSettingsApi,
} from "../../services/allAPI";
const AdminAccountSettings = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    profile_image: null,
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    old_password: "",
    new_password: "",
    company: "",
    id: null, 
  });
  const [loading, setLoading] = useState(false);
  const serverUrl = "http://127.0.0.1:8000/"
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getAdminAccountSettingsApi();
        console.log(res);
        setFormData({
          username: res.username || "",
          first_name: res.first_name || "",
          last_name: res.last_name || "",
          email: res.email || "",
          phone_number: res.phone_number || "",
          old_password: "",
          new_password: "",
          company: res.company || "",
          id: res.id || null, 
          profile_image: res.profile_image || null,
        });
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
        toast.error("Failed to fetch admin profile");
      }
    };
    fetchProfile();
  }, []);
  const fileInputRef = useRef(null);
  const handleReplaceImageClick = () => {

    fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditProfile = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        const value = formData[key];

        // Only append profile_image if it's a File
        if (key === "profile_image") {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          }
        } else {
          if (value !== null && value !== "" && value !== undefined) {
            formDataToSend.append(key, value);
          }
        }
      }

      const response = await updateAdminAccountSettingsApi(formData.id, formDataToSend);
      console.log("Update Response:", response);

      let updatedImage = response.profile_image;
      if (updatedImage && !updatedImage.startsWith("http")) {
        updatedImage = `${serverUrl}${updatedImage}`;
      }

      setFormData((prev) => ({
        ...prev,
        ...response,
        profile_image: updatedImage,
        old_password: "",
        new_password: "",
      }));
      if (updatedImage) setImagePreview(updatedImage);

      // Save to localStorage
      const localStorageData = {
        profile_image: updatedImage || formData.profile_image,
        username: response.username || formData.username,
        first_name: response.first_name || formData.first_name,
        last_name: response.last_name || formData.last_name,
        email: response.email || formData.email,
        phone_number: response.phone_number || formData.phone_number,
        company: response.company || formData.company,
      };
      localStorage.setItem("adminProfile", JSON.stringify(localStorageData));

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("adminProfileUpdated", {
          detail: localStorageData,
        })
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);

      // If API returns any password-related errors, show the fixed toast
      if (error?.response?.data?.non_field_errors?.length) {
        toast.error(
          "Password must have at least 8 characters and include both letters and numbers"
        );
        setFormData(prev => ({ ...prev, new_password: "" }));
        setLoading(false);
        return;
      }


      toast.error("Failed to update profile");

    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateConfirm = () => {
    confirmAlert({
      title: "Confirm Account Deactivation",
      message:
        "Are you sure you want to deactivate your account? This action cannot be undone.",
      buttons: [
        {
          label: "Yes, Deactivate",
          onClick: () => handleDeactivateAccount(),
        },
        {
          label: "Cancel",
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  };
  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    setLoading(true);
    try {
      const response = await deactivateAdminAccountApi();
      console.log("Deactivation response:", response);
      if (response.status === 200) {
        toast.success("Account deactivated successfully!");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to deactivate account");
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast.error("Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="bg-gray-100 px-3 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#5737B4]">
            Admin Account Settings
          </h1>
        </div>
        {/* Profile Card */}
        <div className="bg-white p-6 pb-16 rounded-xl shadow-md">
          <div className="flex flex-col lg:flex-row justify-between gap-3 items-start lg:items-center">
            <div className="flex items-center gap-3">
              <img
                src={
                  imagePreview ||
                  (formData?.profile_image
                    ? formData.profile_image.startsWith("http")
                      ? formData.profile_image
                      : `${serverUrl}${formData.profile_image}`
                    : user)
                }
                alt="profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formData?.username || ""}
                </h2>
                <p className="text-sm text-gray-500">{formData?.company || ""}</p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <div>
                {/* Replace Profile Picture Button */}
                <button
                  onClick={handleReplaceImageClick}
                  type="button"
                  className="px-3 py-1 border border-[#5737B3] text-[#5737B3] rounded-md text-sm hover:bg-[#f3f0ff]"
                >
                  Replace Profile Picture
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  name="profile_image"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <button
                onClick={handleDeactivateConfirm}
                className="px-3 py-1 border border-red-300 text-red-500 rounded-md text-sm bg-red-200 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
          {/* Profile Form */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData?.first_name || ""}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData?.last_name || ""}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData?.email || ""}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData?.phone_number || ""}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
          </div>
        </div>
        {/* Password Section */}
        <div>
          <h3 className="font-medium my-2">Password</h3>
          <div className="bg-white p-6 rounded-xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 shadow-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="old_password"
                value={formData?.old_password}
                onChange={handleFormChange}
                placeholder="Enter current password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="new_password"
                value={formData?.new_password}
                onChange={handleFormChange}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Footer Buttons */}
      <div className="flex gap-2 flex-wrap items-center justify-end mt-6">
        <button
          onClick={handleDeactivateConfirm}
          disabled={loading} // Keep disabled prop
          className="px-8 py-1 border border-red-500 text-red-500 rounded-md text-sm bg-red-200 hover:bg-red-300 disabled:opacity-50"
        >
          Deactivate Account
        </button>
        <button
          onClick={handleEditProfile}
          disabled={loading}
          className="px-9 py-1 border border-gray-200 text-white rounded-md text-sm bg-[#5737B3] hover:bg-[#5737B3]/80 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};
export default AdminAccountSettings;
