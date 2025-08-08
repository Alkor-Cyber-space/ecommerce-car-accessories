import axios from "axios";
import { serverurl } from "./serverURL";
import { commonAPI } from "./commonAPI";

const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token'); // ensure your key name matches here

  if (!refresh) {
    throw new Error('No refresh token found in localStorage');
  }

  try {
    const response = await axios.post(`${serverurl}/api/token/refresh/`, {
      refresh, // ✅ correct key
    });

    const newAccessToken = response.data.access; // ✅ not access_token, just "access"
    localStorage.setItem('access_token', newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw error;
  }
};


//admin register & login
export const AdminLoginApi = async (adminData) => {
  return await commonAPI("POST", `${serverurl}/admin/login/`, adminData, {
    "Content-Type": "application/json"
  });
}


// auth
// vendor register & login
export const vendorLoginApi = async (vendorData) => {
  return await commonAPI("POST", `${serverurl}/auth/vendor/login/`, vendorData, {
    "Content-Type": "application/json"
  });
}


export const vendorRegisterApi = async (vendorData) => {
  console.log("inside register", vendorData);

  return await commonAPI("POST", `${serverurl}/auth/vendor/register/`, vendorData, {
    "content-Type": "application/json"
  })
}

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

    const token = localStorage.getItem("access_token");

    const response = await axios.post(`${serverurl}/vendor/products/`, productData, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "multipart/form-data"
      }
    })
    return response.data
  } 

export const getProductsApi = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.get(`${serverurl}/vendor/products/`, {
      headers: {
        Authorization: `JWT ${token}`
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
export const getProductByIdApi = async (productId) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(`${serverurl}/vendor/products/${productId}/`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
    return response; // ✅ return full response
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};
// delete product by id
// export const deleteProductByIdApi = async (productId) => {
//   try {
//     const token = localStorage.getItem("access_token");
//     const response = await axios.delete(`${serverurl}/vendor/products/${productId}/`, {
//       headers: {
//         Authorization: `JWT ${token}`,
//       },
//     });
//     return response.data; 
//   } catch (error) {
//     console.error("Error deleting product by ID:", error);
//     throw error;
//   }
// };

export const deleteProductApi = async (productId) => {
  const token = localStorage.getItem("access_token");
  return await commonAPI("DELETE", `${serverurl}/vendor/products/${productId}/`, "", {
    Authorization: `JWT ${token}`,
  });
};
export const updateProductApi = async (productId, productData) => {
  try {
    const token = localStorage.getItem("access_token");   
    const response = await axios.patch(`${serverurl}/vendor/products/${productId}/`, productData, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// categories
export const getCategoriesApi = async () => {
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
    const token = localStorage.getItem("access_token");
export const getVariantYearsApi = async () => {
  try {
    const response = await axios.get(`${serverurl}/vehicles/compatible-year/`,{
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // ✅ return data directly
  } catch (error) {
    console.error("Error fetching variant years:", error);
    throw error;
  }
};

// Account Settings
// Get current user profile
export const getMeApi = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(`${serverurl}/auth/vendor/me/`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching account settings:", error);
    throw error;
  }
}

// Update user profile
export const updateAccountApi = async (userData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.patch(`${serverurl}/auth/vendor/edit_account/`, userData, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
}

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

// Deactivate account
export const deactivateAccountApi = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(`${serverurl}/auth/vendor/deactivate_account/`, {}, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error deactivating account:", error);
  }
};

// profile & kyc
export const getVendorProfileApi = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(`${serverurl}/auth/vendor/profile_details/`, {
      headers: {
        Authorization: `JWT ${token}`
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    throw error;
  }
};

export const updateVendorProfileApi = async (profileData) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.patch(`${serverurl}/auth/vendor/edit_profile/`, profileData, {
      headers: {
        Authorization: `JWT ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    throw error;
  }
};

// admin 
// vendor list
export const getVendorList = async () => {
  try {
    const response = await axios.get(`${serverurl}/admin/vendors/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
}


