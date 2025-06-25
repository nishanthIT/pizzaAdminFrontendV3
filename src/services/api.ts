// // import axios from 'axios';
// // import { API_URL } from './config';

// // const api = axios.create({
// //   baseURL: API_URL,
// //   withCredentials: true,
// //   headers: {
// //     'Content-Type': 'application/json'
// //   }
// // });

// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem('adminToken');
// //   if (token && config.headers) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // }, (error) => {
// //   return Promise.reject(error);
// // });

// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       console.error('Auth error:', error.response.data);
// //       // Only clear token if it's an actual auth error
// //       if (error.response.data.message === 'Authentication required' || 
// //           error.response.data.message === 'Invalid token') {
// //         localStorage.removeItem('adminToken');
// //         window.location.href = '/login';
// //       }
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;

// import axios from "axios";
// import { API_URL } from "./config";
// import { getStoredToken, removeStoredToken } from "./auth";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = getStoredToken();
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       if (
//         error.response.data?.message === "Authentication required" ||
//         error.response.data?.message === "Invalid token"
//       ) {
//         removeStoredToken();
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
 import axios from "axios";
import { API_URL } from "./config";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Auth error:', error.response.data);
      // Only clear token if it's an actual auth error
      if (
        error.response.data.message === 'Authentication required' ||
        error.response.data.message === 'Invalid token'
      ) {
        Cookies.remove("adminToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
