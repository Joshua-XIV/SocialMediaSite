import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "./Avatar";
import type { MessageData } from "../api/message";

interface MessageProps {
  message: MessageData;
  onDelete?: (messageId: number) => void;
}

const Message = ({ message, onDelete }: MessageProps) => {
  const { textColor, borderColor, bgColor } = useThemeStyles();
  const { id } = useAuth();
  const isOwnMessage = id === message.sender_id;

  const handleDelete = () => {
    if (onDelete && isOwnMessage) {
      onDelete(message.id);
    }
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`flex max-w-xs lg:max-w-md ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        } gap-2 items-start`}
      >
        {!isOwnMessage && (
          <Avatar
            displayName={message.display_name}
            avatarColor={message.avatar_color}
            size="sm"
          />
        )}

        <div
          className={`flex flex-col ${
            isOwnMessage ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwnMessage
                ? "bg-blue-500 text-white"
                : `${bgColor} ${textColor} ${borderColor} border`
            }`}
          >
            <p className="text-sm break-words break-all max-w-full">
              {message.content}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
              isOwnMessage ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <span>{formatTimeShort(message.created_at)}</span>
            {message.is_read && isOwnMessage && <span>✓</span>}
            {isOwnMessage && onDelete && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:opacity-100 transition-opacity"
                title="Delete message"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
