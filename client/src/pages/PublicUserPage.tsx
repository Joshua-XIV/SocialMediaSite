import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { getUserPosts } from "../api/post";
import { getUserReplies } from "../api/comment";
import Post from "../components/Post";
import Reply from "../components/Reply";
import type { PostData } from "../util/types";

interface UserData {
  username: string;
  display_name: string;
  avatar_color: string;
  created_at?: string;
}

interface ReplyData {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  post_id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  liked: boolean;
  total_likes: number;
  total_replies: number;
  post_content?: string;
  post_created_at?: string;
  parent_comment_content?: string;
  parent_username?: string;
  parent_display_name?: string;
}

const PublicUserPage = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "replies">("posts");
  const [postsOffset, setPostsOffset] = useState(0);
  const [repliesOffset, setRepliesOffset] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [repliesLoadingMore, setRepliesLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [repliesError, setRepliesError] = useState<string | null>(null);
  const { textColor, bgColor, borderColor } = useThemeStyles();
  const errorColor = "text-red-500";

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/user/${username}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load user data");
          }
          return;
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!username || !userData) return;

      try {
        setPostsLoading(true);
        setPostsError(null);
        const postsData = await getUserPosts(username, 10, 0);
        setPosts(postsData);
        setPostsOffset(10);
        setHasMorePosts(postsData.length === 10);
      } catch (err) {
        setPostsError("Failed to load posts");
      } finally {
        setPostsLoading(false);
      }
    };

    const fetchUserReplies = async () => {
      if (!username || !userData) return;

      try {
        setRepliesLoading(true);
        setRepliesError(null);
        const repliesData = await getUserReplies(username, 10, 0);
        setReplies(repliesData);
        setRepliesOffset(10);
        setHasMoreReplies(repliesData.length === 10);
      } catch (err) {
        setRepliesError("Failed to load replies");
      } finally {
        setRepliesLoading(false);
      }
    };

    if (userData) {
      fetchUserPosts();
      fetchUserReplies();
    }
  }, [username, userData]);

  const loadMorePosts = useCallback(async () => {
    if (!username || postsLoadingMore || !hasMorePosts) return;

    try {
      setPostsLoadingMore(true);
      const postsData = await getUserPosts(username, 10, postsOffset);
      setPosts((prev) => {
        // Filter out any posts that already exist to prevent duplicates
        const existingIds = new Set(prev.map((post: PostData) => post.id));
        const newPosts = postsData.filter(
          (post: PostData) => !existingIds.has(post.id)
        );
        return [...prev, ...newPosts];
      });
      setPostsOffset((prev) => prev + 10);
      setHasMorePosts(postsData.length === 10);
    } catch (err) {
      setPostsError("Failed to load more posts");
    } finally {
      setPostsLoadingMore(false);
    }
  }, [username, postsLoadingMore, hasMorePosts, postsOffset]);

  const loadMoreReplies = useCallback(async () => {
    if (!username || repliesLoadingMore || !hasMoreReplies) return;

    try {
      setRepliesLoadingMore(true);
      const repliesData = await getUserReplies(username, 10, repliesOffset);
      setReplies((prev) => {
        // Filter out any replies that already exist to prevent duplicates
        const existingIds = new Set(prev.map((reply: ReplyData) => reply.id));
        const newReplies = repliesData.filter(
          (reply: ReplyData) => !existingIds.has(reply.id)
        );
        return [...prev, ...newReplies];
      });
      setRepliesOffset((prev) => prev + 10);
      setHasMoreReplies(repliesData.length === 10);
    } catch (err) {
      setRepliesError("Failed to load more replies");
    } finally {
      setRepliesLoadingMore(false);
    }
  }, [username, repliesLoadingMore, hasMoreReplies, repliesOffset]);

  // Intersection observer for infinite scroll
  const postsObserver = useCallback(
    (node: HTMLDivElement | null) => {
      if (postsLoadingMore || !hasMorePosts) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && hasMorePosts && !postsLoadingMore) {
              loadMorePosts();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (node) {
        observer.observe(node);
      }

      return () => observer.disconnect();
    },
    [hasMorePosts, postsLoadingMore, loadMorePosts]
  );

  const repliesObserver = useCallback(
    (node: HTMLDivElement | null) => {
      if (repliesLoadingMore || !hasMoreReplies) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && hasMoreReplies && !repliesLoadingMore) {
              loadMoreReplies();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (node) {
        observer.observe(node);
      }

      return () => observer.disconnect();
    },
    [hasMoreReplies, repliesLoadingMore, loadMoreReplies]
  );

  if (loading) {
    return <div className={`${textColor} text-center`}>Loading...</div>;
  }

  if (error) {
    return <div className={`${errorColor} text-center`}>Error: {error}</div>;
  }

  if (!userData) {
    return <div className={`${errorColor} text-center`}>User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Avatar
            displayName={userData.display_name}
            avatarColor={userData.avatar_color}
            size="lg"
          />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${textColor}`}>
          {userData.display_name}
        </h1>
        <p className="text-gray-500 mb-2">@{userData.username}</p>
        {userData.created_at && (
          <p className="text-sm text-gray-400">
            Joined {new Date(userData.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 font-medium ${
            activeTab === "posts"
              ? `${textColor} border-b-2 border-blue-500`
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("replies")}
          className={`px-4 py-2 font-medium ${
            activeTab === "replies"
              ? `${textColor} border-b-2 border-blue-500`
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Replies
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {postsLoading && (
            <div className={`${textColor} text-center`}>Loading posts...</div>
          )}

          {postsError && (
            <div className={`${errorColor} text-center`}>{postsError}</div>
          )}

          {!postsLoading && !postsError && posts.length === 0 && (
            <div className={`${textColor} text-center text-gray-500`}>
              No posts yet
            </div>
          )}

          <div className={`${borderColor} border-1`}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{ backgroundColor: bgColor }}
                className="flex w-full"
              >
                <Post {...post} />
              </div>
            ))}
          </div>

          {/* Intersection observer target for posts */}
          {hasMorePosts && (
            <div
              ref={postsObserver}
              className="h-4 flex items-center justify-center"
            >
              {postsLoadingMore && (
                <div className={`${textColor} text-sm`}>
                  Loading more posts...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "replies" && (
        <div className="space-y-4">
          {repliesLoading && (
            <div className={`${textColor} text-center`}>Loading replies...</div>
          )}

          {repliesError && (
            <div className={`${errorColor} text-center`}>{repliesError}</div>
          )}

          {!repliesLoading && !repliesError && replies.length === 0 && (
            <div className={`${textColor} text-center text-gray-500`}>
              No replies yet
            </div>
          )}

          <div className={`${borderColor} border-1`}>
            {replies.map((reply) => (
              <div
                key={reply.id}
                style={{ backgroundColor: bgColor }}
                className="flex w-full"
              >
                <Reply {...reply} />
              </div>
            ))}
          </div>

          {/* Intersection observer target for replies */}
          {hasMoreReplies && (
            <div
              ref={repliesObserver}
              className="h-4 flex items-center justify-center"
            >
              {repliesLoadingMore && (
                <div className={`${textColor} text-sm`}>
                  Loading more replies...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicUserPage;
