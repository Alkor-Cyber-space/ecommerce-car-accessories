import axios from "axios";
import { serverurl } from "./serverURL";
import { commonAPI } from "./commonAPI";

const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token"); // ensure your key name matches here

  if (!refresh) {
    throw new Error("No refresh token found in localStorage");
  }

  try {
    const response = await axios.post(`${serverurl}/api/token/refresh/`, {
      refresh, // ✅ correct key
    });

    const newAccessToken = response.data.access; // ✅ not access_token, just "access"
    localStorage.setItem("access_token", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const api = axios.create({
  baseURL: serverurl,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post(`${serverurl}/token/refresh/`, {
          refresh,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        // Update request with new token
        originalRequest.headers["Authorization"] = `JWT ${newAccessToken}`;
        return api(originalRequest); // retry
      } catch (err) {
        console.error("Refresh token failed:", err);
        // Optional: redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// auth.js
export const logout = () => {
  // Clear tokens
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Optional: clear other user info
  localStorage.removeItem("user");

  // Redirect to login page
  window.location.href = "/login";
};
//-------------------------------------------------------------auth
// Admin Login
export const AdminLoginApi = async (adminData) => {
  return await commonAPI("POST", `${serverurl}/admin/login/`, adminData, {
    "Content-Type": "application/json",
  });
};
// vendor login & register
export const vendorLoginApi = async (vendorData) => {
  return await commonAPI(
    "POST",
    `${serverurl}/auth/vendor/login/`,
    vendorData,
    {
      "Content-Type": "application/json",
    }
  );
};

export const vendorRegisterApi = async (vendorData) => {
  console.log("inside register", vendorData);

  return await commonAPI(
    "POST",
    `${serverurl}/auth/vendor/register/`,
    vendorData,
    {
      "content-Type": "application/json",
    }
  );
};

export const verifyVendorOtpApi = (data) => {
  return commonAPI("POST", `${serverurl}/auth/otp-verification/`, data);
};

export const resendOtpApi = async (email) => {
  return await axios.post(`${serverurl}/auth/resend-otp/`, { email });
};

export const companyDetailsApi = async (vendorData, vendorId) => {
  console.log("inside companyDetailsApi", vendorData);

  return await commonAPI(
    "POST",
    `${serverurl}/auth/vendor/step1/${vendorId}/`,
    vendorData,
    {
      "Content-Type": "application/json",
    }
  );
};
export const contactDetailsApi = async (vendorId, vendorData) => {
  console.log("inside contactDetailsApi", vendorId, vendorData);

  return await commonAPI(
    "POST",
    `${serverurl}/auth/vendor/step2/${vendorId}/`,
    vendorData,
    {
      "Content-Type": "application/json",
    }
  );
};

export const uploadKYCDocumentsApi = (vendorId, formData) => {
  return axios.post(`${serverurl}/auth/vendor/step3/${vendorId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadBussinessDocApi = async (vendorId, formData) => {
  return await axios.post(
    `${serverurl}/auth/vendor/step4/${vendorId}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const uploadBankAndTaxDocsApi = async (vendorId, formData) => {
  return await axios.post(
    `${serverurl}/auth/vendor/step5/${vendorId}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const uploadAgreementsApi = async (vendorId, formData) => {
  return await axios.post(
    `${serverurl}/auth/vendor/step6/${vendorId}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// vendor product
export const addProductApi = async (productData) => {
  const response = await api.post("/vendor/products/", productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getProductsApi = async () => {
  try {
    const response = await api.get("/vendor/products/");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductByIdApi = async (productId) => {
  try {
    const response = await api.get(`/vendor/products/${productId}/`);
    return response; // ✅ return full response
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const deleteProductApi = async (productId) => {
  try {
    const response = await api.delete(`/vendor/products/${productId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const updateProductApi = async (productId, productData) => {
  try {
    const response = await api.patch(
      `/vendor/products/${productId}/`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// categories
export const getCategoriesApi = async () => {
  try {
    const response = await api.get("/products/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getVariantYearsApi = async () => {
  try {
    const response = await api.get("/vehicles/compatible-year/");
    return response.data;
  } catch (error) {
    console.error("Error fetching variant years:", error);
    throw error;
  }
};

// Account Settings
// Get logged-in vendor profile
export const getMeApi = async () => {
  try {
    const response = await api.get("/auth/vendor/me/");
    return response.data; // return only data, not the whole axios response
  } catch (error) {
    console.error("Error fetching account settings:", error);
    throw error;
  }
};

// Update user profile
export const updateAccountApi = async (userData) => {
  try {
    const response = await api.patch("/auth/vendor/edit_account/", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

// Change password
// export const changePasswordApi = async (passwordData) => {
//   try {
//     const token = localStorage.getItem("access_token");
//     const response = await axios.patch(`${serverurl}/auth/vendor/edit_account/`, passwordData, {
//       headers: {
//         Authorization: `JWT ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     return response;
//   } catch (error) {
//     console.error("Error changing password:", error);
//     throw error;
//   }
// }

// Deactivate vendor account
export const deactivateAccountApi = async () => {
  try {
    const response = await api.post(
      "/auth/vendor/deactivate_account/",
      {} // empty body
    );
    return response.data;
  } catch (error) {
    console.error("Error deactivating account:", error);
    throw error;
  }
};

// profile & kyc
export const getVendorProfileApi = async () => {
  const response = await api.get("/auth/vendor/profile_details/");
  return response.data;
};

// Update vendor profile
export const updateVendorProfileApi = async (profileData) => {
  try {
    const response = await api.patch("/auth/vendor/edit_profile/", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    throw error;
  }
};

// admin
// vendor list
// export const getVendorList = async () => {
//   try {
//     const token = localStorage.getItem("access_token");
//     const response = await axios.get(`${serverurl}/admin/vendors/`, {
//       headers: {
//         Authorization: `JWT ${token}`
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     throw error;
//   }
// }
export const getVendorList = async () => {
  try {
    const response = await api.get("/admin/vendors/");
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
};

export const productcategories = async (productData) => {
  const token = localStorage.getItem("access_token");

  const response = await api.post("/admin/categories/", productData, {
    headers: {
      Authorization: `JWT ${token}`,
      "Content-Type": "multipart/form-data", // ✅ important
    },
  });
  return response.data;
};

export const getProductcategorylist = async () => {
  try {
    const response = await api.get("/admin/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw error;
  }
};

export const updateProductCategoryApi = async (categoryid, category) => {
  try {
    const response = await api.put(
      `/admin/categories/${categoryid}/`,
      category,
    );
    return response;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

export const getVendorByIdApi = async (vendorId) => {
  try {
    const response = await api.post("/admin/vendor/details/", {
      pk: vendorId, // send ID in body
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor by ID:", error);
    throw error;
  }
};

export const getUnverifiedVendorsApi = async () => {
  try {
    const response = await api.get("/admin/vendors/unverified/");
    return response.data;
  } catch (error) {
    console.error("Error fetching unverified vendors:", error);
    throw error;
  }
};

export const getVendorProfileDocumentsApi = async (vendorId) => {
  try {
    const response = await api.get(`/auth/vendor_profile_update/${vendorId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor profile documents:", error);
    throw error;
  }
};

export const ApproveorRejectApi = async (vendorId, documentKey, action) => {
  try {
    const response = await api.put(
      `/auth/vendor_profile_update/${vendorId}/`,
      { [documentKey]: action } // dynamic key update (e.g. "pan_card_status": "approved")
    );
    return response.data;
  } catch (error) {
    console.error("Error approving/rejecting document:", error);
    throw error;
  }
};

export const FinalApproveVendorApi = async (
  vendorId,
  finalStatus = "approved"
) => {
  try {
    const response = await api.post(
      `/auth/vendor-final-approve/${vendorId}/`,
      { final_status: finalStatus } // Send status in body
    );

    return response.data;
  } catch (error) {
    console.error("Error updating final status for vendor:", error);
    throw error;
  }
};

export const getUserList = async () => {
  try {
    const response = await api.get(`/admin/users/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin users:", error);
  }
};

// Delete product category
export const deleteProductCategoryApi = async (categoryId) => {
  try {
    const response = await api.delete(`/admin/categories/${categoryId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product category:", error);
    throw error;
  }
};

export const getAdminsList = async () => {
  try {
    const response = await api.get(`/admin/list_admins/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// vehicle category
// Create vehicle category
export const vehicleCategoryApi = async (vehicleData) => {
  try {
    const response = await api.post(`/admin/vehicle-create/`, vehicleData);
    return response.data;
  } catch (error) {
    console.error("Error creating vehicle category:", error);
    throw error;
  }
};

export const getVehicleCategoriesApi = async () => {
  try {
    const response = await api.get("/vehicles/compatible-year/");
    return response.data; // ✅ return only data
  } catch (error) {
    console.error("Error fetching vehicle categories:", error);
    throw error;
  }
};

// Update vehicle category
export const editVehicleCategoryApi = async (categoryId, updatedData) => {
  try {
    const response = await api.put(
      `/admin/vehicles/${categoryId}/update/`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

// Delete vehicle category
export const deletevehiclecategory = async (categoryId) => {
  try {
    const response = await api.delete(`/admin/vehicles/${categoryId}/delete/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vehicle category:", error);
    throw error;
  }
};

// Forgot password request
export const forgotPasswordApi = async (email) => {
  try {
    const response = await api.post(
      "/auth/password/forgot-password/",
      { email },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending forgot password request:", error);
    throw error;
  }
};

export const getVendorProductListApi = async (vendorId) => {
  try {
    const response = await api.post(`/admin/list-vendor-products/`, {
      pk: vendorId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    throw error;
  }
};

// Create vendor address
export const VendorAddressesApi = async (address) => {
  try {
    const response = await api.post("/auth/addresses/", address, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating vendor address:", error);
    throw error;
  }
};

export const resetPasswordApi = async (
  uidb64,
  token,
  currentPassword,
  newPassword
) => {
  try {
    const response = await api.post(
      `/auth/password/reset-password/${uidb64}/${token}/`,
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
// Get vendor address by ID
export const getVendorAddressesApi = async () => {
  try {
    const response = await api.get(`/auth/addresses/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor addresses:", error);
    throw error;
  }
};

// Update vendor address
export const updateVendorAddressApi = async (id, address) => {
  try {
    if (!id) throw new Error("Address ID is required");

    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found");

    const res = await api.patch(`/auth/addresses/${id}/`, address, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error(
      "Error updating vendor address:",
      err.response?.data || err.message
    );
    throw err;
  }
};

//Adding new sub-admins
export const addSubAdminApi = async (adminData) => {
  try {
    const response = await api.post("/admin/create_admin/", adminData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding sub-admin:", error);
    throw error;
  }
};

export const deleteAdminApi = async (adminId) => {
  try {
    const response = await api.delete(`/admin/delete_admins/${adminId}/`, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
      data: { id: adminId }, // Sending adminId in the request body
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

export const getUserOrderListApi = async (vendorId) => {
  try {
    const response = await api.get(`/auth/addresses/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor addresses:", error);
    throw error;
  }
};
// update order status
export const updateOrderStatusApi = async (orderId) => {
  try {
    const response = await api.post(`/orders/vendor/orders/${orderId}/confirm/`);
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};


export const getAuditLogsApi = async () => {
  try {
    const response = await api.get("/auth/vendor-audit-log-all/");
    return response.data;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

export const createPromotionApi = async (promoData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${serverurl}/coupon_promo/promotion/`,
      promoData,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating promotion:", error);
  }
};
export const VendorDocumentCheckApi = async () => {
  try {
    const response = await api.get(`/auth/vendor-document-check/`);
    return response.data;
  } catch (error) {
    console.log("error fetching vendordocumentcheck", error);
    throw error;
  }
};

export const getVendorKycDocuments = async (vendorId) => {
  try {
    const response = await api.get(`/auth/vendor_profile_update/${vendorId}/`);
    return response.data;
  } catch (error) {
    console.error("Error loading KYC documents:", error);
    throw error;
  }
};

export const getCategoriesByAll = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(`${serverurl}/products/categories/`, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `${serverurl}/products/categories/${categoryId}/products/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getAllPromotionsApi = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `${serverurl}/coupon_promo/promotion/all/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};

export const promotionByIdApi = async (promotionId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `${serverurl}/coupon_promo/promotion/${promotionId}/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // ✅ return data directly
  } catch (error) {
    console.error("Error fetching promotion by ID:", error);
    throw error;
  }
};

export const editPromotionApi = async (promotionId, updatedData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.put(
      `${serverurl}/coupon_promo/promotion/${promotionId}/`,
      updatedData, // send updated fields
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating promotion:", error);
    throw error;
  }
};

export const updateKycDocuments = async (vendorId, formData) => {
  try {
    const response = await api.put(
      `/auth/vendor_profile_update/${vendorId}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating KYC documents:",
      error.response?.data || error
    );
    throw error;
  }
};

export const createCouponApi = async (couponData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${serverurl}/coupon_promo/coupon/`,
      couponData,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};

export const getAllCouponsApi = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(`${serverurl}/coupon_promo/coupon/`, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
};
export const deleteCouponsApi = async (id) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.delete(
      `${serverurl}/coupon_promo/coupon/${id}/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

export const deletePromotionApi = async (id) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.delete(
      `${serverurl}/coupon_promo/promotion/${id}/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting promotion:", error);
    throw error;
  }
};
export const deleteProductImageAPi = async (id) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.delete(
      `${serverurl}/vendor/products/${id}/delete-image/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw error;
  }
};
export const createPromotionBannerApi = async (bannerData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${serverurl}/coupon_promo/banner-create/`,
      bannerData,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating promotion banner:", error);
    throw error;
  }
};
export const getAllPromotionBannersApi = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `${serverurl}/coupon_promo/banner-create/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
        },
      }
    );
    return response.data.message || [];
  } catch (error) {
    console.error("Error fetching promotion banners:", error);
    throw error;
  }
};
export const deletePromotionBannerApi = async (id) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.delete(
      `${serverurl}/coupon_promo/banner-update-delete/${id}/`,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting promotion banner:", error);
    throw error;
  }
};
export const getAdminAccountSettingsApi = async (id) => {
  try {
    const response = await api.get(`${serverurl}/admin/profile/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin details:", error);
    throw error;
  }
};

export const updateStockApi = async (productId, stock) => {
  try {
    const response = await api.patch(
      `/vendor/inventory/${productId}/update-stock/`,
      {
        id: productId,
        stock: stock, // must be an integer
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};

export const updateAdminAccountSettingsApi = async (id, formData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.put(
      `${serverurl}/admin/profile/`,
      formData,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestCategoryApi = async (categoryData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${serverurl}/products/new-category-request`,
      categoryData,
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting category:", error);
    throw error;
  }
};

export const approveOrRejectCategoryApi = async (categoryId, action) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await api.post(
      "/products/new-request-approve",
      {
        id: categoryId,
        status: action, // "approved" or "rejected"
      },
      {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error approving/rejecting category:", error);
    throw error;
  }
};
// -------------------------------------vendor dashboard
export const getVendorDashboardApi = async () => {
  try {
    const response = await api.get("/vendor/dashboard/");   
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor dashboard:", error);
    throw error;
  }
};

// -------------------------------------order-management
export const getOrdersApi = async () => {
  try {
    const response = await api.get("/orders/vendor/orders/");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders by vendor:", error);
    throw error;
  }
};
// -------------------------------------ratings & reviews
export const getProductReviewsApi = async () => {
  try {
    const response = await api.get("/vendor/product-reviews/");
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews by product:", error);
    throw error;
  }
}
export const supportTicketApi = async (ticketData) => {
  try {
    const response = await api.post("/admin/support-tickets/", ticketData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating support ticket:", error);
    throw error;
  }
};


export const notificationApi = async (notificationData) => {
  try {
    const response = await api.post("/admin/notifications/", notificationData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getSupportTicketsApi = async () => {
  try {
    const response = await api.get("/admin/support-tickets/");  // Replace with the actual API endpoint
    return response.data;
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    throw error;
  }
};
export const getNotificationsApi = async () => {
  try {
    const response = await api.get("/admin/notifications/sent/");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const updateSupportTicketApi = async (Id, updatedData) => {
  try {
    const response = await api.post(
      `/admin/support-tickets/${Id}/answer_ticket/`, // ✅ FIXED URL
      updatedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating support ticket:", error);
    throw error;
  }
};

// /api/admin/support-tickets/{id}/mark_resolved/

export const markTicketResolvedApi = async (ticketId) => {
  try {
    const response = await api.post(
      `/admin/support-tickets/${ticketId}/mark_resolved/`,
      {}, // empty body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking ticket as resolved:", error);
    throw error;
  }
};
export const markNotificationAsReadApi = async (notificationId) => {
  try {
    const response = await axios.post(`${serverurl}/admin/notifications/${notificationId}/mark-as-read/`,{},
      {
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
export const getAdminDashboardApi = async () => {
  try {
    const response = await api.get("/admin/ad-dashboard/");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

// /api/admin/support-tickets/{id}/mark_in_progress/

export const markTicketInProgressApi = async (ticketId) => {
  try {
    const response = await api.post(
      `/admin/support-tickets/${ticketId}/mark_in_progress/`,
      {}, // empty body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking ticket as in progress:", error);
    throw error;
  }
};

export const exportReportApi = async (reportType, format, data) => {
  try {
    const response = await api.post(
      "/auth/export-report/",
      {
        report_type: reportType,
        format: format,
        data: data,
      },
      {
        responseType: "blob", // important for downloading files
      }
    );
    return response;
  } catch (error) {
    console.error("Error exporting report:", error);
    throw error;
  }
};

    export const InventorystatsAPi = async () => {
  try {
    const response = await api.get("/admin/inventory/stats/");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    throw error;
  }
};

export const PaymentsPayoutApi = async () => {
  try {
    const response = await api.get("/vendor/payments/");
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
};
