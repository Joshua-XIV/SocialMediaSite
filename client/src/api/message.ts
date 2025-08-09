const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export interface MessageData {
  id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

export interface ConversationData {
  other_user_id: number;
  last_message_at: string;
  total_messages: number;
  unread_count: number;
  username: string;
  display_name: string;
  avatar_color: string;
  last_message_content: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const res = await fetch(`${API_URL}/api/messages/search/users?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to search users");
  }

  return res.json();
}

export async function getConversations(limit: number = 20, offset: number = 0): Promise<ConversationData[]> {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const res = await fetch(`${API_URL}/api/messages/conversations?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch conversations");
  }

  return res.json();
}

export async function getMessages(userId: number, limit: number = 50, offset: number = 0): Promise<MessageData[]> {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const res = await fetch(`${API_URL}/api/messages/${userId}?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch messages");
  }

  return res.json();
}

export async function sendMessage(receiverId: number, content: string): Promise<MessageData> {
  if (!content.trim()) throw new Error("Message cannot be empty");

  const res = await fetch(`${API_URL}/api/messages/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ receiverId, content: content.trim() })
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to send message");
  }

  return res.json();
}

export async function deleteMessage(messageId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to delete message");
  }
} 