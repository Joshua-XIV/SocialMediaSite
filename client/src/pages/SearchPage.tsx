import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { searchAll } from "../api/search";
import Avatar from "../components/Avatar";
import { formatTimeShort } from "../util/formatTime";
import { FiHeart } from "react-icons/fi";
import { likePost, removeLikePost } from "../api/post";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

type SearchResult = {
  type: "post" | "person" | "job";
  id: number;
  title?: string;
  content?: string;
  display_name?: string;
  username?: string;
  avatar_color?: string;
  created_at?: string;
  category?: string;
  location?: string;
  commitment?: string;
  total_likes?: number;
  total_replies?: number;
  liked?: boolean;
};

export default function SearchPage() {
  const { textColor, borderColor, bgColor } =
    useThemeStyles();
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "posts" | "people" | "jobs"
  >(type as any);

  // Like state management
  const [likeStates, setLikeStates] = useState<{
    [key: number]: { isLiked: boolean; likeCount: number };
  }>({});

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const searchResults = await searchAll(query, activeTab);
          setResults(searchResults);

          // Initialize like states for posts
          const initialLikeStates: {
            [key: number]: { isLiked: boolean; likeCount: number };
          } = {};
          searchResults.forEach((result: SearchResult) => {
            if (result.type === "post") {
              initialLikeStates[result.id] = {
                isLiked: result.liked || false,
                likeCount: Number(result.total_likes) || 0,
              };
            }
          });
          setLikeStates(initialLikeStates);
        } catch (err) {
          console.error("Failed to search:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setLikeStates({});
      }
    };

    fetchResults();
  }, [query, activeTab]);

  const handleToggleLike = async (postId: number) => {
    const currentState = likeStates[postId];
    if (!currentState) return;

    const newIsLiked = !currentState.isLiked;
    const newLikeCount = currentState.likeCount + (newIsLiked ? 1 : -1);

    // Optimistic update
    setLikeStates((prev) => ({
      ...prev,
      [postId]: {
        isLiked: newIsLiked,
        likeCount: newLikeCount,
      },
    }));

    try {
      if (newIsLiked) {
        await likePost(postId);
      } else {
        await removeLikePost(postId);
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setLikeStates((prev) => ({
        ...prev,
        [postId]: currentState,
      }));
    }
  };

  const renderPostResult = (result: SearchResult) => {
    const likeState = likeStates[result.id] || { isLiked: false, likeCount: 0 };
    const heartColor = "red";

    return (
      <Link to={`/post/${result.id}`} className="block">
        <div
          className={`p-4 rounded-lg border ${borderColor} ${textColor} hover:shadow-md transition-shadow`}
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-start gap-3">
            <Avatar
              displayName={result.display_name || ""}
              avatarColor={result.avatar_color || "#3B82F6"}
              size="md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{result.display_name}</span>
                <span className="text-sm text-gray-500">
                  @{result.username}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {formatTimeShort(result.created_at || "")}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{result.content}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <FiHeart
                  className="heart hover:cursor-pointer"
                  style={{
                    color: `${likeState.isLiked ? heartColor : ""}`,
                    fill: `${likeState.isLiked ? heartColor : ""}`,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLoggedIn) {
                      handleToggleLike(result.id);
                    } else {
                      openLogin("login");
                    }
                  }}
                />
                <span>{likeState.likeCount}</span>
                <span>💬 {result.total_replies || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderPersonResult = (result: SearchResult) => (
    <Link to={`/user/${result.username}`} className="block">
      <div
        className={`p-4 pb-6 rounded-lg border ${borderColor} ${textColor} hover:shadow-md transition-shadow`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center gap-3">
          <Avatar
            displayName={result.display_name || ""}
            avatarColor={result.avatar_color || "#3B82F6"}
            size="lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{result.display_name}</h3>
            <p className="text-sm text-gray-500">@{result.username}</p>
            <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderJobResult = (result: SearchResult) => (
    <div
      className={`p-4 rounded-lg border ${borderColor} ${textColor} hover:shadow-md transition-shadow cursor-pointer`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex justify-between items-start pb-2">
        <h3 className="font-semibold text-lg">{result.title}</h3>
        <span className="text-sm text-gray-500">
          {formatTimeShort(result.created_at || "")}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 pb-2">
        <span>{result.category}</span>
        <span>•</span>
        <span>{result.location}</span>
        <span>•</span>
        <span>{result.commitment}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed pb-3">
        {result.content?.substring(0, 200)}...
      </p>
      <button
        className={`px-4 py-1 bg-green-500 text-black rounded-full text-sm hover:bg-green-600 transition-colors cursor-pointer`}
      >
        Apply Now
      </button>
    </div>
  );

  return (
    <div className="px-4 pb-4">
      <div className="pb-6">
        <h1 className={`${textColor} pt-2 text-2xl font-bold pb-2`}>
          Search Results
        </h1>
        <p className="text-gray-500">Results for "{query}"</p>
      </div>

      {/* Tabs */}
      <div className="flex pb-6">
        {[
          { key: "all", label: "All", count: results.length },
          {
            key: "posts",
            label: "Posts",
            count: results.filter((r) => r.type === "post").length,
          },
          {
            key: "people",
            label: "People",
            count: results.filter((r) => r.type === "person").length,
          },
          {
            key: "jobs",
            label: "Jobs",
            count: results.filter((r) => r.type === "job").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Searching...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={`${result.type}-${result.id}-${index}`}>
              {result.type === "post" && renderPostResult(result)}
              {result.type === "person" && renderPersonResult(result)}
              {result.type === "job" && renderJobResult(result)}
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            No results found for "{query}"
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Enter a search term to get started</p>
        </div>
      )}
    </div>
  );
}
