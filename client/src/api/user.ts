const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function getUserInfo() {
  const res = await fetch(`${API_URL}/api/user/me`, {
    method: "GET",
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to login");
  }

  const userData = await res.json();
  return userData;
}

export async function updateAvatarColor(avatarColor: string) {
  const res = await fetch(`${API_URL}/api/user/avatar-color`, {
    method: "PATCH",
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({ avatar_color: avatarColor })
  })

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to update avatar color");
  }

  const userData = await res.json();
  return userData;
}