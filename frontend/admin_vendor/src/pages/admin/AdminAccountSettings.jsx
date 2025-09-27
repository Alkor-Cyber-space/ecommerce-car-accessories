import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import user from "../../assets/user.jpg";
import { 
  getAdminAccountSettingsApi, 
  updateAdminAccountSettingsApi, 
} from "../../services/allAPI";


const AdminAccountSettings = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    old_password: "",
    new_password: "",
    company: ""
  });

  const [loading, setLoading] = useState(false);

  // Fetch admin profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getAdminAccountSettingsApi(); 
        console.log(res);
        // hardcoded id=1 for super admin
        setFormData({
          username: res.username || "",
          first_name: res.first_name || "",
          last_name: res.last_name || "",
          email: res.email || "",
          phone_number: res.phone_number || "",
          old_password: "",
          new_password: "",
          company: res.company || ""
        });
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
        toast.error("Failed to fetch admin profile");
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update submission
  const handleEditProfile = async () => {
    setLoading(true);
    try {
      const response = await updateAdminAccountSettingsApi( formData);
      console.log("Profile update response:", response);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };


  const handleDeactivateConfirm = () => {
    confirmAlert({
      title: "Confirm Account Deactivation",
      message: "Are you sure you want to deactivate your account? This action cannot be undone.",
      buttons: [
        {
          label: "Yes, Deactivate",
          onClick: () => handleDeactivateAccount()
        },
        {
          label: "Cancel"
        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setTimeout(() => {
          window.location.href = '/login';
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
      <div className="bg-[#ECECF0] px-3 md:px-6 py-6 md:py-10 rounded-2xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-[#232832] text-xl font-semibold">Admin Account Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 pb-16 rounded-xl shadow-md">
          <div className="flex flex-col lg:flex-row justify-between gap-3 items-start lg:items-center">

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <img src={user} alt="profile" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{formData?.username || ''}</h2>
                <p className="text-sm text-gray-500">{formData?.company || ''}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1 border border-[#5737B3] text-[#5737B3] rounded-md text-sm hover:bg-[#f3f0ff]">
                Replace Profile Picture
              </button>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData?.first_name || ''}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData?.last_name || ''}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData?.email || ''}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5737B3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData?.phone_number || ''}

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
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
          disabled={loading}
          className="px-8 py-1 border border-red-500 text-red-500 rounded-md text-sm bg-red-200 hover:bg-red-300 disabled:opacity-50"
        >
          Deactivate Account
        </button>
        <button
          onClick={handleEditProfile}
          disabled={loading}
          className="px-9 py-1 border border-gray-200 text-white rounded-md text-sm bg-[#5737B3] hover:bg-[#5737B3]/80 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};


export default AdminAccountSettings;
