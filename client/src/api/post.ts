const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function createPost(content: string) {
  const res = await fetch(`${API_URL}/api/posts/`, {
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

export async function getHomePosts(limit: number, offset: number) {
  const cappedLimit = Math.min(limit, 10);
  const res = await fetch(`${API_URL}/api/posts/?limit=${cappedLimit}&offset=${offset}`, {
    method: 'GET',
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Something went wrong");
  }

  return res.json();
}

export async function getPost(id: number) {
  const res = await fetch(`${API_URL}/api/posts/${id}`, {
    method: 'GET',
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Something went wrong");
  }

  return res.json();
}

export async function likePost(postID: string | number) {
  const res = await fetch(`${API_URL}/api/posts/${postID}/like`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to like post");
  }

  return res.json();
}


export async function removeLikePost(postID: string | number) {
  const res = await fetch(`${API_URL}/api/posts/${postID}/unlike`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to remove like from post");
  }

  return res.json();
}

export async function getUserPosts(username: string, limit: number, offset: number) {
  const cappedLimit = Math.min(limit, 10);
  const res = await fetch(`${API_URL}/api/posts/user/${username}?limit=${cappedLimit}&offset=${offset}`, {
    method: 'GET',
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Something went wrong");
  }

  return res.json();
}
