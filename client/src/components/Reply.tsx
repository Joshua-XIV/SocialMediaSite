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

const Reply = ({
  id,
  username,
  content,
  created_at,
  display_name,
  avatar_color,
  liked,
  total_likes,
  total_replies,
  post_content,
  post_created_at,
  parent_comment_content,
  parent_username,
  parent_display_name,
}: ReplyData) => {
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
              <div className="flex-shrink-0 relative z-10">
                <Avatar
                  displayName={display_name}
                  avatarColor={avatar_color}
                  size="md"
                />
              </div>
              <section className="flex-1 min-w-0">
                <div className={`${textColor} flex items-center gap-x-2`}>
                  <Link
                    to={`/user/${username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-md font-bold hover:underline"
                  >
                    {display_name}
                  </Link>
                  <div className="text-sm">
                    <Link
                      to={`/user/${username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      @{username}
                    </Link>
                    <span> {formatTimeShort(created_at)}</span>
                  </div>
                </div>

                {/* Reply context */}
                {(post_content || parent_username) && (
                  <div
                    className={`text-sm mt-1 ${textColor} opacity-70 italic`}
                  >
                    Replying to: @{parent_username || username}
                  </div>
                )}

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
            <div className="flex-shrink-0 relative z-10">
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

              {/* Reply context */}
              {(post_content || parent_username) && (
                <div className={`text-sm mt-1 ${textColor} opacity-70 italic`}>
                  Replying to: @{parent_username || username}
                </div>
              )}

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

export default Reply;
