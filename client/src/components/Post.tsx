import React from 'react'

interface PostProps {
  username: string;
  content: string;
  created_at: string;
}

const Post = ({ username, content, created_at }: PostProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow mb-4">
      <div className="text-sm text-gray-500">{username} • {new Date(created_at).toLocaleTimeString()}</div>
      <div className="text-md mt-2 text-gray-900 dark:text-gray-100">{content}</div>
    </div>
  );
};

export default Post