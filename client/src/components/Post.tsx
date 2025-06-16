import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";

interface PostProps {
  username: string;
  display_name: string;
  content: string;
  created_at: string;
}

const Post = ({ username, content, created_at, display_name}: PostProps) => {
  const { postColor, textColor, postTextColor } = useThemeStyles();
  return (
    <div 
      className={`rounded-xl p-4 shadow w-full max-w-4xl`}
      style={{background : postColor}}
      >
      <div className={`text-sm ${textColor}`}>
        {display_name} • {` `}
        {`@${username}`} • {` `}
        {formatTimeShort(created_at)} • {` `}
        {new Date(created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
      </div>
      <div className={`text-md mt-2 ${postTextColor}`}>{content}</div>
    </div>
  );
};

export default Post