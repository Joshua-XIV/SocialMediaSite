import React from "react";

interface AvatarProps {
  displayName: string;
  avatarColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  displayName,
  avatarColor,
  size = "md",
  className = "",
}) => {
  // Get initials from display name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-xl",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: avatarColor }}
    >
      {getInitials(displayName)}
    </div>
  );
};

export default Avatar;
