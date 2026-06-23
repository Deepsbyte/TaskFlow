import axios from "axios";

// Create Axios instance
// Use REACT_APP_API_URL from env, fallback to localhost for dev
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1/",
});

// Add token to every request automatically
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("access"); // ✅ standard key

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;