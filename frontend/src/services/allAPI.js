import axios from "axios";
import { commonAPI } from "./commonAPI";
import { serverUrl } from "./serverURL";

// register
// export const registerAPI = async (reqBody) => {
//   const url = `${serverUrl}/auth/user/register/`;
//   return await commonAPI("POST", url, reqBody);
// };

export const registerApi = async (userDetails) => {
  return await commonAPI("POST", `${serverUrl}/auth/user/register/`, userDetails, "");
};