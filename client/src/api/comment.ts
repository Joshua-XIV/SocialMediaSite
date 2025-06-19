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

export async function getComment(commentID: number) {
  const res = await fetch(`${API_URL}/api/comment/${commentID}`, {
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
    postId?: number;
    parentId?: number;
    limit?: number;
    offset?: number;
  }
) {
  const { postId, parentId, limit = 10, offset = 0 } = options;

  if (!postId && !parentId) {
    throw new Error("Must provide either postId or parentId");
  }

  const params = new URLSearchParams();
  if (postId !== undefined) params.append("postId", postId.toString());
  if (parentId !== undefined) params.append("parentId", parentId.toString());
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const res = await fetch(`${API_URL}/api/comment/get-comments?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch comments");
  }

  return res.json();
}