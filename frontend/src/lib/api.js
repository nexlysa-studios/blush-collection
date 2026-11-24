import axios from "axios";
import { demoFallback } from "@/lib/demoFallback";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

if (!process.env.REACT_APP_BACKEND_URL) {
  console.error("REACT_APP_BACKEND_URL is not set — API calls will fail. Set it in your hosting environment variables and rebuild.");
}

export const api = axios.create({ baseURL: API });

api.interceptors.response.use(
  (res) => {
    const type = res.headers?.["content-type"] || "";
    if (type.includes("application/json")) return res;
    return demoFallback(res.config) || Promise.reject(new Error(`API returned non-JSON response from ${res.config?.url}`));
  },
  (err) => (err.response?.status >= 400 && err.response?.status < 500 ? Promise.reject(err) : demoFallback(err.config) || Promise.reject(err)),
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jfh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function waLink(number, message) {
  const clean = (number || "").replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message || "")}`;
}

export function formatZAR(n) {
  const num = Number(n || 0);
  return `R${num.toFixed(0)}`;
}
