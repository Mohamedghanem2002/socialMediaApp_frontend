const POSTS = "https://social-media-app-backend-mu.vercel.app/posts";

export async function getPostsByUser(userId) {
  const res = await fetch(`${POSTS}/by-user/${userId}`, {
    credentials: "include",
  });
  return res.json();
}

export async function deletePost(postId) {
  const res = await fetch(`${POSTS}/${postId}`, {
    method: "DELETE",
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
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
