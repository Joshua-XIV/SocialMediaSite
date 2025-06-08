export async function login(emailOrUsername: string, password: string) {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;
  const res = await fetch(`${API_URL}/api/user/login-account`, {
    method: "POST",
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to login");
  }

  return res.json();
}