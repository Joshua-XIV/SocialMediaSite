const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function getUserInfo() {
  const res = await fetch(`${API_URL}/api/user/user-info`, {
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