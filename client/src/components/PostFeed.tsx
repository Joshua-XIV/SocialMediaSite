import { useCallback, useEffect, useRef, useState } from 'react'
import { getHomePosts } from '../api/post';
import Post from './Post';
import type { PostData } from '../util/types';

const PostFeed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const loader = useRef(null);
  const MAX_POST_LIMIT = 10;

  const fetchPost = useCallback(async () => {
    if (!hasMore) return;
    setIsFetching(true);
    try {
      const newPosts = await getHomePosts(MAX_POST_LIMIT, offset);
      setPosts((prev) => {
        const ids = new Set(prev.map(p => p.id));
        const uniqueNewPosts = newPosts.filter((p: { id: number; }) => !ids.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });
      setHasMore(newPosts.length === MAX_POST_LIMIT);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setIsFetching(false);
    }
  }, [offset, hasMore, isFetching]);

  useEffect(() => {
    fetchPost();
  }, [offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
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
  }, [hasMore, isFetching]);

  return (
    <div className='flex flex-col px-3 w-full h-[calc(100vh-3rem)]'>
      <div className='flex flex-col p-4 items-center gap-y-3'>
        {posts.map((post) => (
          <Post key={post.id} {...post}/>
        ))}
      </div>
      <div ref={loader} className= 'text-gray-400 text-center pb-4'>
        {!hasMore && !isFetching && <p>No More Posts!</p>}
      </div>
    </div>
  )
}

export default PostFeed