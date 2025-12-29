import API_URL, { getHeaders } from "../config";
const POSTS = `${API_URL}/posts`;

export async function getPostsByUser(userId) {
  const res = await fetch(`${POSTS}/by-user/${userId}`, {
    headers: getHeaders(),
    credentials: "include",
  });
  return res.json();
}

export async function deletePost(postId) {
  const res = await fetch(`${POSTS}/${postId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}

export async function toggleLike(postId) {
  const res = await fetch(`${POSTS}/like/${postId}`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
