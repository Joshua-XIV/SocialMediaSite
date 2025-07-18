const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function login(emailOrUsername: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    const errorMsg = data.message || data.error || "Failed to login";
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
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
  const res = await fetch(`${API_URL}/api/auth/register`, {
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

export async function verifyCode(email: string, code: string) {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, code })
  });

  if (!res.ok) {
    const { error, message } = await res.json();
    throw new Error(error || message || "Failed to verify code");
  }
  return res.json();
}

export async function resendCode(email: string) {
  const res = await fetch(`${API_URL}/api/auth/resend-code`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const { error, message } = await res.json();
    throw new Error(error || message || "Failed to resend code");
  }
  return res.json();
}