import axios from "axios";
import { commonAPI } from "./commonAPI";
import { serverUrl } from "./serverURL";

// register
// export const registerAPI = async (reqBody) => {
//   const url = `${serverUrl}/auth/user/register/`;
//   return await commonAPI("POST", url, reqBody);
// };
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh'); // Assume the refresh token is also stored
  if (!refreshToken) {
    throw new Error('No refresh token found in localStorage');
  }

  try {
    const response = await axios.post(`${serverUrl}/token/refresh/`, {
      refresh: refreshToken,
    });
    const newAccessToken = response.data.access;
    localStorage.setItem('access', newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error.response || error.message);
    throw error;
  }
};

export const registerApi = async (userDetails) => {
  return await commonAPI("POST", `${serverUrl}/auth/user/register/`, userDetails, "");
};

export const loginApi = async (userDetails) => {
  return await commonAPI("POST", `${serverUrl}/auth/user/login/`, userDetails, "");
};

export const forgotPasswordApi = async (email) => {
  return await commonAPI("POST", `${serverUrl}/auth/password/forgot-password/`, { email }, "");
};  