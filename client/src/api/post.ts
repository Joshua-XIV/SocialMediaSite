const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function createPost(content: string) {
  const res = await fetch(`${API_URL}/api/post/create-post`, {
    method: 'POST',
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to Create Post");
  }

  return res.json();
}