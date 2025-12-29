import API_URL, { getHeaders } from "../config";
const API = `${API_URL}/users`;

export async function registerApi(payload) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Register failed");
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

// Login
export async function loginApi(payload) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

// Logout
export async function logoutApi() {
  const res = await fetch(`${API}/logout`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  localStorage.removeItem("token");
  return res.json();
}

// Get my profile
export async function getMeApi() {
  const res = await fetch(`${API}/me/profile`, {
    headers: getHeaders(),
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Not authenticated");

  return data;
}

// Get user profile by id
export async function getUserProfile(id) {
  const res = await fetch(`${API}/${id}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  return data;
}

// Update user profile
export async function updateMyAvatar(userId, avatarUrl) {
  const res = await fetch(`${API}/${userId}/avatar`, {
    method: "PUT",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify({ avatar: avatarUrl }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Not authenticated");

  return data;
}

// Follow/Unfollow user
export async function followUser(userId) {
  const res = await fetch(`${API}/follow/${userId}`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Follow failed");
  return data;
}
