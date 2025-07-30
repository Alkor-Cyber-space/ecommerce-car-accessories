import axios from "axios";
import { serverurl } from "./serverURL";
import { commonAPI } from "./commonAPI";

// vendor register 
export const vendorRegisterApi = async (vendorData) =>{
    console.log("inside register", vendorData);
    
  return await commonAPI("POST", `${serverurl}/auth/vendor/register/`, vendorData, {
     "content-Type" : "application/json"
  })
}
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

// product
export const addProductApi = async (productData) => {
    try {
        const response = await axios.post(`${serverurl}/vendor/products/`, productData, {
            headers: {
                "Content-Type": "application/json",
            }

        })
        return response.data
    } catch (error) {

    }
}