import API_URL, { getHeaders } from "../config";
const COMMENTS = `${API_URL}/comments`;

// Get all comments for a post
export async function getCommentsByPost(postId) {
  const res = await fetch(`${COMMENTS}/${postId}`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Add a comment to a post

export async function getCommentCount(postId) {
  const res = await fetch(`${COMMENTS}/count/${postId}`, {
    credentials: "include",
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.count;
}
export async function addComment(postId, text) {
  const res = await fetch(`${COMMENTS}/${postId}`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Add a reply to a comment

export async function addReply(commentId, text, postId) {
  const res = await fetch(`${COMMENTS}/reply/${commentId}`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify({ text, postId }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateCommentApi(commentId, text) {
  const res = await fetch(`${COMMENTS}/${commentId}`, {
    method: "PUT",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteCommentApi(commentId) {
  const res = await fetch(`${COMMENTS}/${commentId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
