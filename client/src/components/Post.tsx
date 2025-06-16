import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import { useState } from "react";
import { likePost, removeLikePost } from "../api/post";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

interface PostProps {
  username: string;
  display_name: string;
  content: string;
  created_at: string;
  id: number;
  liked: boolean;
  total_likes: number;
}

const Post = ({ username, content, created_at, display_name, id, liked, total_likes }: PostProps) => {
  const { postColor, textColor, postTextColor } = useThemeStyles();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(total_likes);
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();

  const handleToggleLike = async () => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => Number(prev) + (isLiked ? -1 : 1));
    try {
      if (!isLiked) await likePost(id);
      else await removeLikePost(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className={`rounded-xl p-4 shadow w-full max-w-4xl`}
      style={{background : postColor}}
      >
      <div className={`${textColor} flex items-center gap-x-2`}>
        <p className="text-md font-bold">{`${display_name}`}</p>
        <p className="text-sm">{`@${username} ${formatTimeShort(created_at)}`}</p>
      </div>
      <div className={`text-md mt-2 ${postTextColor}`}>{content}</div>
      <div className="flex justify-between">
        <div 
          className={`${isLiked ? "bg-red-500" : "bg-amber-50"} hover:cursor-pointer`} 
          onClick={() => {`${isLoggedIn ? handleToggleLike() : openLogin("login")}`}}>{likeCount}</div>
      </div>
    </div>
  );
};

export default Post