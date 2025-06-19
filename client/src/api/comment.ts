const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function createComment(postID : number, content : string, parentID : number | null) {
  if (!content.trim()) throw new Error("Comment cannot be empty");
  const res = await fetch(`${API_URL}/api/comment/create-comment`, {
    method: "POST",
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({postID, content, parentID})
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to create comment");
  }

  return res.json();
}