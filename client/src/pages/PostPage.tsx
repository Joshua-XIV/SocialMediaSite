import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPost } from '../api/post';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useNavigate } from 'react-router-dom';
import { faArrowLeftLong, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      <div className='p-6'>
        <div
          className={`${textColor} hover:cursor-pointer bg-transparent hover:bg-gray-700 w-10 h-10 p-1 rounded-full flex items-center justify-center`}
          onClick={() => navigator(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft}/>
        </div>
      </div>
      <div className={`flex justify-center`}>
        {post && <Post {...post}/>}
      </div>
    </div>
  )
}

export default PostPage