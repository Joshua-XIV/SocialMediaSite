import { useThemeStyles } from "../hooks/useThemeStyles";
import { formatTimeShort } from "../util/formatTime";
import Avatar from "./Avatar";
import type { ConversationData } from "../api/message";

interface ConversationItemProps {
  conversation: ConversationData;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) => {
  const { textColor, borderColor } = useThemeStyles();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
        isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
      } ${borderColor} border-b`}
    >
      <Avatar
        displayName={conversation.display_name}
        avatarColor={conversation.avatar_color}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`font-medium ${textColor} truncate`}>
            {conversation.display_name}
          </h3>
          <span className="text-xs text-gray-500">
            {formatTimeShort(conversation.last_message_at)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-sm text-gray-600 truncate flex-1`}
          >
            {conversation.last_message_content}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {conversation.unread_count > 99
                ? "99+"
                : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
