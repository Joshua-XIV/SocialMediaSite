import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import { useState } from "react";
import { likePost, removeLikePost } from "../api/post";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { FiHeart } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

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
  const { postColor, textColor, postTextColor, borderColor } = useThemeStyles();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(total_likes);
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();
  const location = useLocation();
  const heartColor = 'red';

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

  const onPage = location.pathname === `/post/${id}`
  return (
    <>
      {!onPage && <Link
        className={`border-b-2 p-2 ${borderColor} w-full opacity-80 hover:opacity-100 hover:bg-gray-500/20`}
        style={{}}
        to={`/post/${id}`}
        >
        <div className={`${textColor} flex items-center gap-x-2`}>
          <p className="text-md font-bold">{`${display_name}`}</p>
          <p className="text-sm">{`@${username} ${formatTimeShort(created_at)}`}</p>
        </div>
        <div className={`text-md mt-2 ${postTextColor}`}>{content}</div>
        <div className="flex justify-between">
          <div className="flex gap-x-3 items-center">
            <FiHeart
              className="heart hover:cursor-pointer"
              style={{color: `${isLiked ? heartColor : ""}`, fill: `${isLiked ? heartColor : ""}`}}
              onClick={(e) => {e.preventDefault(); `${isLoggedIn ? handleToggleLike() : openLogin("login")}`}}
            />
              <p className={`text-gray-400`}>{likeCount}</p>
          </div>
        </div>
      </Link>}
      {onPage && <div
        className={`border-b-2 p-2 ${borderColor} w-full`}
        style={{}}
        >
        <div className={`${textColor} flex items-center gap-x-2`}>
          <p className="text-md font-bold">{`${display_name}`}</p>
          <p className="text-sm">{`@${username} ${formatTimeShort(created_at)}`}</p>
        </div>
        <div className={`text-md mt-2 ${postTextColor}`}>{content}</div>
        <div className="flex justify-between">
          <div className="flex gap-x-3 items-center">
            <FiHeart
              className="heart hover:cursor-pointer"
              style={{color: `${isLiked ? heartColor : ""}`, fill: `${isLiked ? heartColor : ""}`, backgroundSize : 150}}
              onClick={() => {`${isLoggedIn ? handleToggleLike() : openLogin("login")}`}}
            />
            <p className={`text-gray-400`}>{likeCount}</p>
          </div>
        </div>
      </div>}
    </>
  );
};

export default Post