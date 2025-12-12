import axios from "axios";
import i18n from "../i18n";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor for adding token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("SonnenhofAuthToken");
  const language = i18n.language || "en";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Accept-Language"] = language;
  return config;
});

export default API;
