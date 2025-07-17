const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function searchAll(query: string, type: 'all' | 'posts' | 'people' | 'jobs' = 'all') {
  const params = new URLSearchParams({
    q: query,
    type: type
  });

  const res = await fetch(`${API_URL}/api/search?${params.toString()}`, {
    method: 'GET',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to search: ${res.statusText}`);
  }
  
  return await res.json();
} 