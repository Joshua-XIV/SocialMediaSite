import React, { useState } from "react";
import { updateAvatarColor } from "../api/user";
import { useAuth } from "../contexts/AuthContext";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface AvatarColorPickerProps {
  currentColor: string;
  onColorChange?: (color: string) => void;
  className?: string;
}

const AvatarColorPicker: React.FC<AvatarColorPickerProps> = ({
  currentColor,
  onColorChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const { setAvatarColor } = useAuth();
  const { bgColor, borderColor } = useThemeStyles();

  const avatarColors = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Red", value: "#EF4444" },
    { name: "Green", value: "#10B981" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Purple", value: "#8B5CF6" },
  ];

  const handleColorSelect = async (color: string) => {
    try {
      await updateAvatarColor(color);
      setSelectedColor(color);
      setAvatarColor(color);
      onColorChange?.(color);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update avatar color:", error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700"
        style={{ borderColor }}
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm">Change Color</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg z-10"
          style={{ backgroundColor: bgColor }}
        >
          <div className="grid grid-cols-5 gap-2">
            {avatarColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === color.value
                    ? "border-gray-800"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarColorPicker;
