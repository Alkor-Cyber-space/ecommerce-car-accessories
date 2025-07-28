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