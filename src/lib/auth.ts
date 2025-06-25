// export const TOKEN_KEY = "adminToken";

// export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
// export const setStoredToken = (token: string) =>
//   localStorage.setItem(TOKEN_KEY, token);
// export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);
import Cookies from "js-cookie";

export const TOKEN_KEY = "adminToken";

export const getStoredToken = () => Cookies.get(TOKEN_KEY);

export const setStoredToken = (token: string) =>
  Cookies.set(TOKEN_KEY, token, { expires: 7 });

export const removeStoredToken = () => Cookies.remove(TOKEN_KEY);