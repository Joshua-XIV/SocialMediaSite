import Post from '../components/Post';
import { useParams, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPost } from '../api/post';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createComment, getComments } from '../api/comment';
import { toast } from 'sonner';
import Comment from '../components/Comment';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import type { PostData, CommentData } from '../util/types';

const PostPage = () => {
  const {id} = useParams<{ id:string }>();
  const [post ,setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentOffset, setCommentOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isFetchingComments, setIsFetchingComments] = useState(true);
  const commentLoader = useRef(null);
  const MAX_COMMENT_LIMIT = 10;
  const [reply, setReply] = useState("");
  const {borderColor, bgColor, backgroundLayer} = useThemeStyles();
  const [postLoading, setPostLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const { textColor } = useThemeStyles();
  const navigator = useNavigate();
  const { isLoggedIn } = useAuth();
  const { openLogin } = useModal();

  // Fetch Main Post Content
  useEffect(() => {
    console.log(commentOffset, "fetchPost")
    const fetchPost = async () => {
      const parsedId = parseInt(id ?? "");
      if (isNaN(parsedId)) return;
      try {
        const data = await getPost(parsedId);
        setPost(data);
      } catch (err) {
        console.error("Error Fetching Post", err)
      } finally {
        setPostLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  // Grabs Comments when needed
  const fetchComments = useCallback(async () => {
    if (!id || !hasMoreComments) return;
    setIsFetchingComments(true);
    console.log(commentOffset, "fetchComments")
    try {
      const parsedId = parseInt(id);
      const newComments = await getComments({
        postID: parsedId,
        offset: commentOffset,
        limit: MAX_COMMENT_LIMIT
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
    }
  }, [id, commentOffset, isFetchingComments, hasMoreComments]);

  // Once Offset changes, fetch comments
  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [commentOffset, id]);

    useEffect(() => {
    setComments([]);
    setCommentOffset(0);
    setHasMoreComments(true);
  }, [id]);

  // Checks to load more comments
  useEffect(() => {
    if (!hasMoreComments || isFetchingComments || comments.length == 0) return;
    console.log(commentOffset, "observeUseEffect")
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreComments && !isFetchingComments) {
        setCommentOffset(prev => prev + MAX_COMMENT_LIMIT);
      }
    }, { threshold: 1 });

    const currentLoader = commentLoader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMoreComments, isFetchingComments, commentOffset]);  

  // Reply Call
  const handleReply = async() => {
    setReplyLoading(true);
    const parsedId = parseInt(id ?? "");
    if (isNaN(parsedId)) return;
    try {
      await createComment(parsedId, reply, null);
      setReply("");
      toast.success("Comment Created");
    } catch (err) {
      console.error("Failed to create comment: ", err);
      toast.error("Something went wrong");
    } finally {
      setReplyLoading(false);
    }
  }

  return (
    <div className='px-4 '>
      {/* Navigate Backwards */}
      <section className='py-3 w-full' style={{position: "sticky", top: "3rem", zIndex: 50, backgroundColor: backgroundLayer}}>
        <div
          className={`${textColor} hover:cursor-pointer bg-transparent hover:bg-gray-700 w-10 h-10 
                      rounded-full flex items-center justify-center`}
          onClick={() => navigator(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft}/>
        </div>
      </section>
      <div className='pb-2'>
        <div className={`border-1 rounded-2xl ${borderColor}`} style={{backgroundColor : bgColor}}>
          {/* Post Content and Reply */}
          <section className={`p-4 ${borderColor} border-b-1`}>
            <div className={`flex justify-center`}>
              {postLoading && <p>Loading Post...</p>}
              {post && <Post {...post}/>}
            </div>
            {/* Reply Section */}
            <section>
              <textarea
                className={`${reply.length > 255 ? "text-red-400" : textColor} focus:outline-none p-2 resize-none w-full placeholder:text-gray-400`}
                placeholder='Reply'
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                style={{overflow : 'hidden'}}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (reply.length > 0 && reply.length <= 255) {
                      if (isLoggedIn) {
                        handleReply();
                      } else {
                        openLogin("login");
                      }
                    }
                  }
                }}
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
                  {replyLoading ? <p>...</p> : <p>Send</p>}D
                </button>
              </div>
            </section>
          </section>
          {/* Comments*/}
          <section className={`${textColor} ${borderColor} flex flex-col`}>
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

export default PostPage