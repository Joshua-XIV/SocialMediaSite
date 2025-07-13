import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import { useState } from "react";
import { likePost, removeLikePost } from "../api/post";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { FiHeart } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import type { PostData } from "../util/types";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";

const Post = ({
  username,
  content,
  created_at,
  display_name,
  avatar_color,
  id,
  liked,
  total_likes,
  total_replies,
}: PostData) => {
  const { textColor, postTextColor, borderColor } = useThemeStyles();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(total_likes);
  const replyCount = total_replies ?? 0;
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();
  const location = useLocation();
  const heartColor = "red";
  const navigate = useNavigate();

  const handleToggleLike = async () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => Number(prev) + (isLiked ? -1 : 1));
    try {
      if (!isLiked) await likePost(id);
      else await removeLikePost(id);
    } catch (err) {
      console.error(err);
    }
  };

  const homePage = location.pathname === `/`;
  const commentPage = location.pathname.startsWith("/comment/");
  return (
    <>
      {homePage && (
        <Link
          className={`border-2 rounded-2xl p-2 ${borderColor} w-full hover:bg-gray-500/20`}
          to={`/post/${id}`}
        >
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
                      `${isLoggedIn ? handleToggleLike() : openLogin("login")}`;
                    }}
                  />
                  <p className={`text-gray-400`}>{likeCount}</p>
                  <p className={`text-gray-400`}>Replies: {replyCount}</p>
                </div>
              </div>
            </section>
          </div>
        </Link>
      )}
      {!homePage && (
        <div
          className={`border-b-1 p-2 ${borderColor} w-full ${
            commentPage ? "hover:cursor-pointer hover:bg-gray-500/20" : ""
          }`}
          style={{}}
          onClick={() => {
            if (commentPage) {
              navigate(`/post/${id}`);
            }
          }}
        >
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
                      backgroundSize: 150,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      `${isLoggedIn ? handleToggleLike() : openLogin("login")}`;
                    }}
                  />
                  <p className={`text-gray-400`}>{likeCount}</p>
                  <p className={`text-gray-400`}>Replies: {replyCount}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
