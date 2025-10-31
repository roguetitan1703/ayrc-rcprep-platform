import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.aryc.delpat.in/api/v1",
  withCredentials: false,
});

// Add Authorization header from localStorage token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("arc_token");
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.error || err.message;
    if (status === 401) {
      // optional: clear token on unauthorized
      // localStorage.removeItem('arc_token')
    }
    console.error("API Error:", msg);
    return Promise.reject(err);
  }
);