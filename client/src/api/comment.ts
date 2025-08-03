const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function createComment(postID : number | null, content : string, parentID : number | null) {
  if (!content.trim()) throw new Error("Comment cannot be empty");
  const res = await fetch(`${API_URL}/api/comments/`, {
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

export async function getComment(commentID: number) {
  const res = await fetch(`${API_URL}/api/comments/${commentID}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch comment");
  }

  return res.json();
}

export async function getComments(
  options: {
    postID?: number;
    parentID?: number;
    limit?: number;
    offset?: number;
  }
) {
  const { postID, parentID, limit = 10, offset = 0 } = options;

  if (!postID && !parentID) {
    throw new Error("Must provide either postID or parentID");
  }

  const params = new URLSearchParams();
  if (postID !== undefined) params.append("postID", postID.toString());
  if (parentID !== undefined) params.append("parentID", parentID.toString());
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const res = await fetch(`${API_URL}/api/comments/?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch comments");
  }

  return res.json();
}

export async function likeComment (commentID: string | number) {
  const res = await fetch(`${API_URL}/api/comments/${commentID}/like`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    credentials: "include",    
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to like comment");
  }

  return res.json();
}

export async function removeLikeComment (commentID: string | number) {
  const res = await fetch(`${API_URL}/api/comments/${commentID}/unlike`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    credentials: "include",    
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to remove like from comment");
  }

  return res.json();
}

export async function getCommentThread (commentID: string | number) {
  const res = await fetch(`${API_URL}/api/comments/${commentID}/thread`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to get comment thread");
  }

  return res.json();
}

export async function getUserReplies(username: string, limit: number = 10, offset: number = 0) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const res = await fetch(`${API_URL}/api/comments/user/${username}?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to get user replies");
  }

  return res.json();
}