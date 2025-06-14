import React, { useCallback, useEffect, useRef, useState } from 'react'

interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

const PostFeed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  const fetchPost = useCallback(async () => {

  }, []);

  useEffect(() => {

  }, []);

  return (
    <div className='w-full h-[calc(100vh-3rem)] overflow-y-auto p-4'>

    </div>
  )
}

export default PostFeed