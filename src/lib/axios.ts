import axios from "axios";
import { getStoredToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    console.log("Making API request:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      token: token ? `${token.substring(0, 10)}...` : 'none'
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("API response success:", {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.log("API response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
