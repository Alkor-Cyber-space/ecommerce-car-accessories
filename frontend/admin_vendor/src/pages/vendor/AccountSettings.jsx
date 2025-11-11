import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import user from "../../assets/user.jpg";
import {
  getMeApi,
  updateAccountApi,
  updateVendorProfileApi,
  deactivateAccountApi,
} from "../../services/allAPI";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    profile_image: null,
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    old_password: "",
    new_password: "",
    company: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const serverUrl = "http://127.0.0.1:8000/";

  // Optional context callback
  const { handleProfileUpdate } =
    (typeof useOutletContext === "function" ? useOutletContext() : {}) || {};

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMeApi();
        setFormData({
          profile_image: res.profile_image || null,
          username: res.username || "",
          first_name: res.first_name || "",
          last_name: res.last_name || "",
          email: res.email || "",
          contact_number: res.contact_number || "",
          old_password: "",
          new_password: "",
          company: res.company || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Image select/preview
  const handleReplaceImageClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFormData((prev) => ({ ...prev, profile_image: file }));
  };

  // Form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // === Submit Profile Update ===
  const handleEditProfile = async (e) => {
    e?.preventDefault?.();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      for (const key in formData) {
        const value = formData[key];

        // Only send if valid
        if (key === "profile_image") {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          }
        } else if (value) {
          formDataToSend.append(key, value);
        }
      }

      // Ensure user-level phone_number is sent to edit_account (User model expects 'phone_number')
      if (formData.contact_number) {
        formDataToSend.append("phone_number", formData.contact_number);
      }

      console.log("Submitting data:", [...formDataToSend.entries()]);

      const response = await updateAccountApi(formDataToSend);
      console.log("Profile update response:", response);

      let updatedImage = response?.profile_image ?? formData.profile_image;

      if (updatedImage && typeof updatedImage === "string" && !updatedImage.startsWith("http")) {
        updatedImage = `${serverUrl}${updatedImage}`;
      }

      // Update local state
      setFormData((prev) => ({
        ...prev,
        ...response,
        profile_image: updatedImage,
        old_password: "",
        new_password: "",
      }));

      // Also update vendor_profile.contact_number (stored on VendorProfile)
      try {
        if (formData.contact_number) {
          await updateVendorProfileApi({ contact_number: formData.contact_number });
          // reflect updated contact_number in local state
          setFormData((prev) => ({ ...prev, contact_number: formData.contact_number }));
        }
      } catch (err) {
        console.warn("Failed to update vendor_profile contact_number:", err);
      }
      if (updatedImage) setImagePreview(updatedImage);

      // Dispatch event for VendorHome
      window.dispatchEvent(
        new CustomEvent("vendorProfileUpdated", {
          detail: {
            profile_image: updatedImage,
            username: response?.username ?? formData.username,
            email: response?.email ?? formData.email,
          },
        })
      );

      // Save in localStorage
      const localStorageData = {
        profile_image: updatedImage,
        username: response?.username ?? formData.username,
        first_name: response?.first_name ?? formData.first_name,
        last_name: response?.last_name ?? formData.last_name,
        email: response?.email ?? formData.email,
        contact_number: response?.contact_number ?? formData.contact_number,
        company: response?.company ?? formData.company,
      };
      localStorage.setItem("vendorProfile", JSON.stringify(localStorageData));

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error?.response?.data?.profile_image?.[0] ||
        error?.response?.data?.detail ||
        "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // === Deactivate Account ===
  const handleDeactivateConfirm = () => {
    confirmAlert({
      title: "Confirm Account Deactivation",
      message:
        "Are you sure you want to deactivate your account? This action cannot be undone.",
      buttons: [
        { label: "Yes, Deactivate", onClick: handleDeactivateAccount },
        { label: "Cancel" },
      ],
    });
  };

  const handleDeactivateAccount = async () => {
    setLoading(true);
    try {
      const response = await deactivateAccountApi();
      if (response.status === 200) {
        toast.success("Account deactivated successfully!");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        toast.error(response.data.message || "Deactivation failed");
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast.error("Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#ECECF0] px-4 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-[#232832] text-xl font-semibold">
          Account Settings
        </h1>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-6 pb-16 rounded-xl shadow-md">
        <div className="flex flex-col lg:flex-row justify-between gap-3 items-start lg:items-center">
          <div className="flex items-center gap-3">
            <img
              src={
                imagePreview
                  ? imagePreview
                  : formData.profile_image
                  ? typeof formData.profile_image === "string"
                    ? `${serverUrl}${formData.profile_image}`
                    : URL.createObjectURL(formData.profile_image)
                  : user
              }
              alt="profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {formData.username || ""}
              </h2>
              <p className="text-sm text-gray-500">{formData.company || ""}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
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
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name || ""}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number || ""}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5737B3]"
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
              value={formData.old_password}
              onChange={handleFormChange}
              placeholder="Enter current password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleFormChange}
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5737B3]"
            />
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-2 flex-wrap items-center justify-end mt-6">
        <button
          type="button"
          onClick={handleDeactivateConfirm}
          disabled={loading}
          className="px-8 py-1 border border-red-500 text-red-500 rounded-md text-sm bg-red-200 hover:bg-red-300 disabled:opacity-50"
        >
          Deactivate Account
        </button>
        <button
          type="button"
          onClick={handleEditProfile}
          disabled={loading}
          className="px-9 py-1 text-white rounded-md text-sm bg-[#5737B3] hover:bg-[#5737B3]/80 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
