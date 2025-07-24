import axios from "axios";
import { serverurl } from "./serverURL";
import { commonAPI } from "./commonAPI";


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