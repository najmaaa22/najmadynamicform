import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      
      if (typeof window !== "undefined") {
      
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        window.location.href = "/login";
      }
    }

    console.error("API ERROR:", {
      status: status,
      data: error.response?.data,
      message: error.message
    });

    return Promise.reject(error);
  }
);

export default API;