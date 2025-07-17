import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { FiHeart } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import type { CommentData } from "../util/types";
import { likeComment, removeLikeComment } from "../api/comment";
import Avatar from "./Avatar";

const Comment = ({
  id,
  username,
  content,
  created_at,
  display_name,
  avatar_color,
  liked,
  total_likes,
  total_replies,
}: CommentData) => {
  const { textColor, postTextColor, borderColor } = useThemeStyles();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(Number(total_likes) || 0);
  const replyCount = total_replies ?? 0;
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();
  const location = useLocation();
  const heartColor = "red";

  const handleToggleLike = async () => {
    const newIsLiked = !isLiked;
    const newLikeCount = likeCount + (newIsLiked ? 1 : -1);

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    try {
      if (newIsLiked) {
        await likeComment(id);
      } else {
        await removeLikeComment(id);
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    }
  };

  const onPage = location.pathname === `/comment/${id}`;
  return (
    <>
      {!onPage && (
        <Link
          className={`p-2 ${borderColor} border-b-1 w-full hover:bg-gray-500/20`}
          style={{}}
          to={`/comment/${id}`}
        >
          <section>
            <div className="flex flex-row space-x-2">
              <div className="flex-shrink-0">
                <Avatar
                  displayName={display_name}
                  avatarColor={avatar_color}
                  size="md"
                />
              </div>
              <section className="flex-1 min-w-0">
                <div className={`${textColor} flex items-center gap-x-2`}>
                  <p className="text-md font-bold">{`${display_name}`}</p>
                  <p className="text-sm">{`@${username} ${formatTimeShort(
                    created_at
                  )}`}</p>
                </div>
                <div className={`text-md mt-2 ${postTextColor} break-words`}>
                  {content}
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-x-3 items-center">
                    <FiHeart
                      className="heart hover:cursor-pointer"
                      style={{
                        color: `${isLiked ? heartColor : ""}`,
                        fill: `${isLiked ? heartColor : ""}`,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isLoggedIn) {
                          handleToggleLike();
                        } else {
                          openLogin("login");
                        }
                      }}
                    />
                    <p className={`text-gray-400`}>{likeCount}</p>
                    <span className={`text-gray-400`}>💬 {replyCount}</span>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </Link>
      )}
      {onPage && (
        <div className={`border-b-1 p-2 ${borderColor} w-full`} style={{}}>
          <div className="flex flex-row items-start space-x-2">
            <div className="flex-shrink-0">
              <Avatar
                displayName={display_name}
                avatarColor={avatar_color}
                size="md"
              />
            </div>
            <section className="flex-1 min-w-0">
              <div className={`${textColor} flex items-center gap-x-2`}>
                <p className="text-md font-bold">{`${display_name}`}</p>
                <p className="text-sm">{`@${username} ${formatTimeShort(
                  created_at
                )}`}</p>
              </div>
              <p className={`text-md mt-2 ${postTextColor} break-words`}>
                {content}
              </p>
              <div className="flex justify-between">
                <div className="flex gap-x-3 items-center">
                  <FiHeart
                    className="heart hover:cursor-pointer"
                    style={{
                      color: `${isLiked ? heartColor : ""}`,
                      fill: `${isLiked ? heartColor : ""}`,
                      backgroundSize: 150,
                    }}
                    onClick={() => {
                      if (isLoggedIn) {
                        handleToggleLike();
                      } else {
                        openLogin("login");
                      }
                    }}
                  />
                  <p className={`text-gray-400`}>{likeCount}</p>
                  <span className={`text-gray-400`}>💬 {replyCount}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};

export default Comment;
