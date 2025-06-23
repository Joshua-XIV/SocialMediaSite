import Comment from "../components/Comment"
import { useParams, useNavigate } from "react-router-dom"
import { type PostData, type CommentData } from "../util/types";
import { useEffect, useState, useRef } from "react";
import { createComment, getComment, getComments, getCommentThread } from "../api/comment";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { parse } from "@fortawesome/fontawesome-svg-core";
import { getPost } from "../api/post";
import Post from "../components/Post";

const CommentPage = () => {
  const {id} = useParams<{ id:string }>();
  const [mainComment, setMainComment] = useState<CommentData | null>(null);
  const [mainCommentLoading, setMainCommentLoading] = useState(true);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentOffset, setCommentOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isFetchingComments, setIsFetchingComments] = useState(true);
  const commentLoader = useRef(null);
  const MAX_COMMENT_LIMIT = 10;
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const navigator = useNavigate();
  const { textColor, borderColor } = useThemeStyles();
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();
  const fetchLock = useRef(false);
  const [thread, setThread] = useState<CommentData[]>([]);
  const [postID, setPostID] = useState<number | null>(null);
  const [post, setPost] = useState<PostData | null>(null);
  

  // Fetch Main Comment
  useEffect(() => {
    const fetchMainComment = async () => {
      const parsedId = parseInt(id ?? "");
      if (isNaN(parsedId)) return;
      try {
        const data = await getComment(parsedId);
        setMainComment(data);
      } catch(err) {
        console.error("Error Fetching Comment", err);
      } finally {
        setMainCommentLoading(false);
        fetchLock.current = false;
      }
    }

    if (id) fetchMainComment();
  }, [id]);

  // Grabs Comments when needed
  useEffect(() => {
    if (!id || isFetchingComments || !hasMoreComments) return;

    const fetchComments = async () => {
      setIsFetchingComments(true);
      const parsedId = parseInt(id ?? "");
      try {
        const newComments = await getComments({
          parentID: parsedId,
          offset: commentOffset,
          limit: MAX_COMMENT_LIMIT,
        });

        setComments(prev => {
          const ids = new Set(prev.map(c => c.id));
          const uniqueNew = newComments.filter((c: { id: number; }) => !ids.has(c.id));
          return [...prev, ...uniqueNew];
        });

        setHasMoreComments(newComments.length === MAX_COMMENT_LIMIT);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setIsFetchingComments(false);
        fetchLock.current = false;
      }
    };

    fetchComments();
  }, [commentOffset, id]);

  useEffect(() => {
    if (!id) return;

    // Reset comment data
    setComments([]);
    setCommentOffset(0);
    fetchLock.current = false;
    setHasMoreComments(true);

    // Force initial fetch manually
    const fetchInitial = async () => {
      setIsFetchingComments(true);
      const parsedId = parseInt(id);
      try {
        const newComments = await getComments({
          parentID: parsedId,
          offset: 0,
          limit: MAX_COMMENT_LIMIT,
        });
        setComments(newComments);
        setHasMoreComments(newComments.length === MAX_COMMENT_LIMIT);
      } catch (err) {
        console.error("Failed to fetch initial replies", err);
      } finally {
      setIsFetchingComments(false);
      }
    };

    fetchInitial();
  }, [id]);

  // Checks to load more comments
  useEffect(() => {
    if (!hasMoreComments || isFetchingComments) return;
    console.log(commentOffset);
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (
        entry.isIntersecting &&
        !isFetchingComments &&
        hasMoreComments &&
        !fetchLock.current
      ) {
        fetchLock.current = true;
        setCommentOffset(prev => prev + MAX_COMMENT_LIMIT);
      }
    }, { threshold: 1 });

    const currentLoader = commentLoader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMoreComments, isFetchingComments, commentOffset]);

  const handleReply = async() => {
    setError("");
    setReplyLoading(true);
    const parsedId = parseInt(id ?? "");
    if (isNaN(parsedId)) return;
    try {
      await createComment(null, reply, parsedId);
      setReply("");
      toast.success("Comment Created");
    } catch (err) {
      console.error("Failed to create comment: ", err);
      toast.error("Something went wrong");
    } finally {
      setReplyLoading(false);
    }
  }

  useEffect(() => {
    const fetchThread = async () => {
      const parsedId = parseInt(id ?? "");
      if (isNaN(parsedId)) return;
      try {
        const data = await getCommentThread(parsedId);
        setThread(data.thread);
        setPostID(data.post_id)
        setMainComment(data.thread[data.thread.length - 1]);
      } catch (err) {
        console.error("Error fetching comment thread", err);
      } finally {
        setMainCommentLoading(false);
        fetchLock.current = false;
      }
    }

    if (id) fetchThread();
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      if (postID == null) return;
      try {
        const postData = await getPost(postID);
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post", err);
      }
    };

    fetchPost();
  }, [postID]);

  return (
    <div className="px-4">
      {/* Navigate Backwards */}
      <section className='py-3'>
        <div
          className={`${textColor} hover:cursor-pointer bg-transparent hover:bg-gray-700 w-10 h-10 
                      rounded-full flex items-center justify-center`}
          onClick={() => navigator(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft}/>
        </div>
      </section>
      <div className="pb-2">
        <div className={`border-1 rounded-2xl ${borderColor}`}>
          {/* Post Content and Reply */}
          <section className={`border-b-1 p-4 ${borderColor}`}>
            <div className={`flex justify-center flex-col`}>
              {post && <Post {...post}/>}
              {thread.map((c) => (
                <Comment key={c.id} {...c} />
              ))}
            </div>
            {/* Reply Section */}
            <section>
              <textarea
                className={`${reply.length > 255 ? "text-red-400" : textColor} focus:outline-none p-2 resize-none w-full`}
                placeholder='Reply'
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                style={{overflow : 'hidden'}}
              >
              </textarea>
              <div className={`flex justify-end items-center gap-x-4 pb-1`}>
                <p className={`${reply.length > 255 ? "text-red-400" : textColor}`}>{reply.length}/255</p>
                <button
                  className={`flex justify-center items-center border-1 ${borderColor} rounded-xl p-1 ${textColor} w-12
                              ${reply.length > 255 || reply.length == 0 ? "" : "hover:cursor-pointer"}
                              ${reply.length > 255 || reply.length == 0 ? "bg-transparent": "bg-blue-500"}
                              ${reply.length > 255 || reply.length == 0 ? "opacity-80" : "opacity-80 hover:opacity-100"}`}
                  disabled={reply.length > 255}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLoggedIn) {
                      handleReply();
                    } else {
                      (openLogin("login"));
                    }
                  }}
                >
                  SEND
                </button>
              </div>
            </section>
          </section>
          {/* Comments */}
          <section className={`${textColor} ${borderColor} border-b-1 flex flex-col`}>
            {comments.map((comment) => (
              <Comment key={comment.id} {...comment}/>
            ))}
          </section>
          {/* Reference to keep loading more comments */}
          <div
            className='text-gray-400 text-center'
            ref={commentLoader}
          >
            {!hasMoreComments && !isFetchingComments && <p>No More Comments!</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentPage