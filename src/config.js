const API_URL = import.meta.env.VITE_API_URL?.replace("/users", "") || "https://social-media-app-backend-mu.vercel.app";

export const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export default API_URL;
