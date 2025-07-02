import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { FiHeart } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import type { CommentData } from "../util/types";
import { likeComment, removeLikeComment } from "../api/comment";

const Comment = ({id, username, content, created_at, display_name, liked, total_likes, total_replies} : CommentData) => {
  const { textColor, postTextColor, borderColor } = useThemeStyles();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(total_likes || 0);
  const replyCount = total_replies ?? 0;
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();
  const location = useLocation();
  const heartColor = 'red';

  const handleToggleLike = async () => {
    setIsLiked(prev => !prev);
    setLikeCount(prev => Number(prev) + (isLiked ? -1 : 1));
    try {
      if (!isLiked) likeComment(id);
      else removeLikeComment(id);
    } catch (err) {
      console.error(err);
    }
  };

  const onPage = location.pathname === `/comment/${id}`
  return (
    <>
      {!onPage && <Link
        className={`p-2 ${borderColor} border-b-1 w-full hover:bg-gray-500/20`}
        style={{}}
        to={`/comment/${id}`}
        >
        <section>
          <div className="flex flex-row space-x-2">
            <div className={`bg-blue-500 flex items-center justify-center ${textColor} border-2 ${borderColor} rounded-full w-14 h-14 flex-shrink-0 z-10`}>
              PFP
            </div>
            <section className="break-all">
              <div className={`${textColor} flex items-center gap-x-2`}>
                <p className="text-md font-bold">{`${display_name}`}</p>
                <p className="text-sm">{`@${username} ${formatTimeShort(created_at)}`}</p>
              </div>
              <div className={`text-md mt-2 ${postTextColor} break-words`}>{content}</div>
              <div className="flex justify-between">
                <div className="flex gap-x-3 items-center">
                  <FiHeart
                    className="heart hover:cursor-pointer"
                    style={{color: `${isLiked ? heartColor : ""}`, fill: `${isLiked ? heartColor : ""}`}}
                    onClick={(e) => {e.preventDefault(); e.stopPropagation(); `${isLoggedIn ? handleToggleLike() : openLogin("login")}`}}
                  />
                    <p className={`text-gray-400`}>{likeCount}</p>
                    <p className={`text-gray-400`}>Replies: {replyCount}</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </Link>}
      {onPage && 
      <div
        className={`border-b-1 p-2 ${borderColor} w-full`}
        style={{}}
      >
        <div className="flex flex-row items-start space-x-2">
          <div className={`bg-blue-500 flex items-center justify-center ${textColor} border-2 ${borderColor} rounded-full w-14 h-14 flex-shrink-0 z-10`}>
            PFP
          </div>
          <section className="break-all">
            <div className={`${textColor} flex items-center gap-x-2`}>
              <p className="text-md font-bold">{`${display_name}`}</p>
              <p className="text-sm">{`@${username} ${formatTimeShort(created_at)}`}</p>
            </div>
            <p className={`text-md mt-2 ${postTextColor} break-words`}>{content}</p>
            <div className="flex justify-between">
              <div className="flex gap-x-3 items-center">
                <FiHeart
                  className="heart hover:cursor-pointer"
                  style={{color: `${isLiked ? heartColor : ""}`, fill: `${isLiked ? heartColor : ""}`, backgroundSize : 150}}
                  onClick={() => {`${isLoggedIn ? handleToggleLike() : openLogin("login")}`}}
                />
                <p className={`text-gray-400`}>{likeCount}</p>
                <p className={`text-gray-400`}>Replies: {replyCount}</p>
              </div>
            </div>
          </section>
        </div>
      </div>}
    </>
  );
}

export default Comment