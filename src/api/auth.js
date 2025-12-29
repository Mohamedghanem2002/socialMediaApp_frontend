const API = import.meta.env.VITE_API_URL || "https://social-media-app-backend-mu.vercel.app/users";

// const token = localStorage.getItem("token");
export async function registerApi(payload) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Register failed");
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
  return data;
}

// Logout

export async function logoutApi() {
  const res = await fetch(`${API}/logout`, {
    method: "POST",

    credentials: "include",
  });

  return res.json();
}

// Get my profile
export async function getMeApi() {
  const res = await fetch(`${API}/me/profile`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Not authenticated");

  return data;
}

// Get user profile by id
export async function getUserProfile(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json();
  return data;
}

// Update user profile
export async function updateMyAvatar(userId, avatarUrl) {
  const res = await fetch(`${API}/${userId}/avatar`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json", // Add this!
    },
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
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Follow failed");
  return data;
}
