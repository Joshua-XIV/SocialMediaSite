import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPost } from '../api/post';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useNavigate } from 'react-router-dom';
import { faArrowLeftLong, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { text } from '@fortawesome/fontawesome-svg-core';

interface PostData {
  id: number;
  username: string;
  content: string;
  created_at: string;
  display_name: string;
  liked: boolean;
  total_likes: number;
}

const PostPage = () => {
  const {id} = useParams<{ id:string }>();
  const [post ,setPost] = useState<PostData | null>(null);
  const [reply, setReply] = useState("");
  const {borderColor} = useThemeStyles();
  const [loading, setLoading] = useState(true);
  const { textColor } = useThemeStyles();
  const navigator = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const parsedId = parseInt(id ?? "");
      if (isNaN(parsedId)) return;
      try {
        const data = await getPost(parsedId);
        setPost(data);
      } catch (err) {
        console.error("Error Fetching Posts", err)
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  return (
    <div>
      <div className='py-3'>
        <div
          className={`${textColor} hover:cursor-pointer bg-transparent hover:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center`}
          onClick={() => navigator(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft}/>
        </div>
      </div>
      <div className={`border-1 p-4 ${borderColor}`}>
        <div className={`flex justify-center`}>
          {post && <Post {...post}/>}
        </div>
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
          > 
            SEND 
          </button>
        </div>
      </div>
      <div className={`${textColor} ${borderColor} border-x-1 border-b-1 p-2`}>
          COMMENTS
      </div>
    </div>
  )
}

export default PostPage