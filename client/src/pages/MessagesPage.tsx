import { useEffect, useState, useRef } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  searchUsers,
} from "../api/message";
import type {
  ConversationData,
  MessageData,
  UserSearchResult,
} from "../api/message";
import ConversationItem from "../components/ConversationItem";
import Message from "../components/Message";
import Avatar from "../components/Avatar";

const MessagesPage = () => {
  const { textColor, bgColor, borderColor, inputColor } = useThemeStyles();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationUsername, setNewConversationUsername] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.other_user_id);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      setError("Failed to load conversations");
    } finally {
      setConversationsLoading(false);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      setMessagesLoading(true);
      const data = await getMessages(userId);
      setMessages(data);
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await sendMessage(
        selectedConversation.other_user_id,
        newMessage
      );
      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      // Update conversation in list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.other_user_id === selectedConversation.other_user_id
            ? {
                ...conv,
                last_message_at: message.created_at,
                last_message_content: message.content,
                unread_count: 0,
              }
            : conv
        )
      );
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err) {
      setError("Failed to delete message");
    }
  };

  const handleConversationSelect = (conversation: ConversationData) => {
    setSelectedConversation(conversation);
    setError(null);
  };

  const handleUserSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      setError("Failed to search users");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartNewConversation = async (
    userId: number,
    username: string
  ) => {
    try {
      // Create a new conversation object for the selected user
      const newConversation: ConversationData = {
        other_user_id: userId,
        username: username,
        display_name:
          searchResults.find((u) => u.id === userId)?.display_name || username,
        avatar_color:
          searchResults.find((u) => u.id === userId)?.avatar_color || "#3B82F6",
        last_message_at: new Date().toISOString(),
        total_messages: 0,
        unread_count: 0,
        last_message_content: "",
      };

      // Set the new conversation as selected
      setSelectedConversation(newConversation);
      setMessages([]); // Start with empty messages

      // Add the new conversation to the conversations list
      setConversations((prev) => [newConversation, ...prev]);

      setShowNewConversation(false);
      setNewConversationUsername("");
      setSearchResults([]);
    } catch (err) {
      setError("Failed to start conversation. User may not exist.");
    }
  };

  if (loading) {
    return (
      <div className={`${textColor} text-center p-8`}>
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-3em)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-300 flex flex-col">
        <div className={`p-4 ${borderColor} border-b`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${textColor}`}>Messages</h1>
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              {showNewConversation ? "Cancel" : "New Chat"}
            </button>
          </div>

          {showNewConversation && (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConversationUsername}
                  onChange={(e) => {
                    setNewConversationUsername(e.target.value);
                    handleUserSearch(e.target.value);
                  }}
                  placeholder="Search users by username..."
                  className={`flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${borderColor} ${textColor} ${inputColor}`}
                />
              </div>

              {/* Search Results */}
              {searching && (
                <div
                  className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${textColor}`}
                >
                  Searching...
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${textColor}`}
                      onClick={() =>
                        handleStartNewConversation(user.id, user.username)
                      }
                    >
                      <Avatar
                        displayName={user.display_name}
                        avatarColor={user.avatar_color}
                        size="sm"
                      />
                      <div>
                        <div className={`font-medium text-sm ${textColor}`}>
                          {user.display_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className={`${textColor} text-center p-4`}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div
              className={`${textColor} text-center p-4 text-gray-500 dark:text-gray-400`}
            >
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.other_user_id}
                conversation={conversation}
                isActive={
                  selectedConversation?.other_user_id ===
                  conversation.other_user_id
                }
                onClick={() => handleConversationSelect(conversation)}
              />
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div
              className={`p-4 ${borderColor} border-b flex items-center gap-3 flex-shrink-0`}
            >
              <Avatar
                displayName={selectedConversation.display_name}
                avatarColor={selectedConversation.avatar_color}
                size="md"
              />
              <div>
                <h2 className={`font-semibold ${textColor}`}>
                  {selectedConversation.display_name}
                </h2>
                <p className="text-sm text-gray-500">
                  @{selectedConversation.username}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messagesLoading ? (
                <div className={`${textColor} text-center`}>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div
                  className={`${textColor} text-center text-gray-500 dark:text-gray-400`}
                >
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      onDelete={handleDeleteMessage}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className={`p-4 ${borderColor} border-t flex-shrink-0`}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${borderColor} ${textColor} ${inputColor}`}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center ${textColor}`}>
              <h2 className="text-xl font-semibold mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-3 text-white hover:text-red-100 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
