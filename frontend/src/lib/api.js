import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

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
