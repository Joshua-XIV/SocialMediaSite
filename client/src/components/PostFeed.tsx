import { useCallback, useEffect, useRef, useState } from "react";
import { getHomePosts } from "../api/post";
import Post from "./Post";
import type { PostData } from "../util/types";
import { useThemeStyles } from "../hooks/useThemeStyles";
import logger from "../utils/logger";

const MAX_POST_LIMIT = 10;

const PostFeed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const { bgColor } = useThemeStyles();
  const loader = useRef(null);

  const fetchPost = useCallback(async () => {
    if (!hasMore) return;

    const startTime = Date.now();
    setIsFetching(true);

    logger.info("Fetching posts", {
      offset,
      limit: MAX_POST_LIMIT,
    });

    try {
      const newPosts = await getHomePosts(MAX_POST_LIMIT, offset);
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const uniqueNewPosts = newPosts.filter(
          (p: { id: number }) => !ids.has(p.id)
        );
        return [...prev, ...uniqueNewPosts];
      });
      setHasMore(newPosts.length === MAX_POST_LIMIT);

      logger.info("Posts fetched successfully", {
        newPostsCount: newPosts.length,
        totalPostsCount: posts.length + newPosts.length,
        hasMore: newPosts.length === MAX_POST_LIMIT,
        duration: Date.now() - startTime,
      });
    } catch (err) {
      logger.error(
        "Failed to load posts",
        {
          offset,
          limit: MAX_POST_LIMIT,
          duration: Date.now() - startTime,
        },
        err instanceof Error ? err : undefined
      );
    } finally {
      setIsFetching(false);
    }
  }, [offset, hasMore, isFetching, posts.length]);

  useEffect(() => {
    fetchPost();
  }, [offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          logger.info("Loading more posts via intersection observer", {
            currentOffset: offset,
            newOffset: offset + MAX_POST_LIMIT,
          });
          setOffset((prev) => prev + MAX_POST_LIMIT);
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isFetching, offset]);

  return (
    <div className="flex flex-col px-3 w-full h-[calc(100vh-3rem)]">
      <div className="flex flex-col p-4 items-center gap-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            style={{ backgroundColor: bgColor }}
            className="flex w-full rounded-3xl"
          >
            <Post key={post.id} {...post} />
          </div>
        ))}
      </div>
      <div ref={loader} className="text-gray-400 text-center pb-4">
        {!hasMore && !isFetching && <p>No More Posts!</p>}
      </div>
    </div>
  );
};

export default PostFeed;
