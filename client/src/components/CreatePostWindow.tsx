import { useEffect, useState, type RefObject } from "react";
import CloseIcon from "../assets/close.svg?react";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { createPost } from "../api/post";
import { toast } from "sonner";

interface CreatePostWindowProps {
  closePost: () => void;
  loginRef: RefObject<HTMLDivElement | null>;
}

const MAX_POST_LENGTH = 255;

const CreatePostWindow = ({ closePost, loginRef }: CreatePostWindowProps) => {
  const { textColor, hoverColor, bgAntiColor, popupColor, borderColor } =
    useThemeStyles();
  const [post, setPost] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!post.trim()) return;

    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handlePosts();
      }
    };

    document.addEventListener("keydown", handleEnter);
    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  }, []);

  const handlePosts = async () => {
    setError("");

    if (post.length > MAX_POST_LENGTH) {
      setError("Post cannot exceed 255 characters");
      return;
    }

    try {
      await createPost(post);
      toast.success("Post Created");
      closePost();
    } catch (err) {
      setError("Something went wrong creating post");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow w-md md:w-2xl z-20 rounded-3xl flex flex-col px-6`}
        style={{
          height: "100vh",
          maxHeight: "34rem",
          backgroundColor: popupColor,
        }}
        ref={loginRef}
      >
        {/* Close Window */}
        <button
          className={`${textColor} w-8 h-8 right-0 mr-4 mt-4 absolute text-2xl hover:cursor-pointer 
                    rounded-full flex items-center justify-center hover:scale-110 opacity-65 hover:opacity-100`}
          style={{ background: hoverColor }}
          onClick={closePost}
        >
          <CloseIcon
            {...({ fill: bgAntiColor } as React.SVGProps<SVGSVGElement>)}
          />
        </button>
        {/* Post Content */}
        <div
          className={`relative w-full h-56 border-2 ${
            post.length > MAX_POST_LENGTH ? "border-red-400" : borderColor
          } mt-16 rounded-2xl opacity-80 hover:opacity-100`}
          style={{ background: hoverColor }}
        >
          <textarea
            className={`p-4 ${textColor} w-full h-full outline-none resize-none`}
            placeholder="Enter Text..."
            onChange={(e) => setPost(e.target.value)}
          ></textarea>
          <div
            className={`${
              post.length > MAX_POST_LENGTH ? "text-red-400" : "text-gray-400"
            } absolute bottom-0 right-2`}
          >
            {post.length}/{MAX_POST_LENGTH}
          </div>
        </div>
        {/* Cancel/Send */}
        <div className="flex flex-row justify-between mx-2">
          <button
            type="button"
            onClick={closePost}
            className={`left-0 mt-4 px-4 py-2 rounded bg-red-600 ${textColor} cursor-pointer ${borderColor} 
                        border-1 shadow opacity-80 hover:opacity-100 w-[5rem] text-center`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!post || post.length > MAX_POST_LENGTH}
            onClick={handlePosts}
            className={`left-0 mt-4 px-4 py-2 rounded ${textColor} border-1 shadow text-center w-[5rem] ${borderColor} 
                        ${
                          !post.trim() || post.length > MAX_POST_LENGTH
                            ? ""
                            : "hover:cursor-pointer"
                        }
                        ${
                          !post.trim() || post.length > MAX_POST_LENGTH
                            ? "opacity-80"
                            : "opacity-80 hover:opacity-100"
                        } 
                        ${
                          !post.trim() || post.length > MAX_POST_LENGTH
                            ? hoverColor
                            : "bg-blue-600"
                        }`}
          >
            Send
          </button>
        </div>
        <div className="text-red-400">{error}</div>
      </div>
    </div>
  );
};

export default CreatePostWindow