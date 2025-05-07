import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Penting untuk mengirim cookies
});

// Add request interceptor
axiosInstance.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.authToken) {
    config.headers.Authorization = `Bearer ${authStore.authToken}`;
  }
  return config;
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();

    // If token expired/invalid
    if (error.response?.status === 401) {
      authStore.logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
