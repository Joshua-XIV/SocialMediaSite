const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function login(emailOrUsername: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login-account`, {
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

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout-account`, {
    method: "POST",
    headers: { "Content-Type" : "application/json"},
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to logout");
  }
}

export async function signUp(username: string, display_name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/create-account`, {
    method: 'POST',
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({username, display_name, email, password})
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to Create Account");
  }
  
  return res.json();
}