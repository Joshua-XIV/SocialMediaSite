// client/src/components/AvatarUnifiedPickerWheel.tsx
import React, { useState } from 'react';
import AvatarColorPicker from './AvatarColorPicker';
import AvatarColorWheel from './AvatarColorWheel';
import { useThemeStyles } from '../hooks/useThemeStyles';

interface AvatarUnifiedPickerWheelProps {
  currentColor: string;
  onColorChange?: (color: string) => void;
  className?: string;
}

const AvatarUnifiedPickerWheel: React.FC<AvatarUnifiedPickerWheelProps> = ({
  currentColor,
  onColorChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { bgColor, borderColor } = useThemeStyles();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700"
        style={{ borderColor }}
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-sm">Change Color</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 pt-2 p-4 rounded-lg shadow-lg z-20"
          style={{ backgroundColor: bgColor }}
        >
          <div className="space-y-4">
            {/* Preset Colors */}
            <div>
              <h3 className="text-sm font-medium mb-3">Quick Colors</h3>
              <AvatarColorPicker
                currentColor={currentColor}
                onColorChange={onColorChange}
              />
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor }} />

            {/* Color Wheel */}
            <div>
              <h3 className="text-sm font-medium mb-3">Custom Color</h3>
              <AvatarColorWheel
                currentColor={currentColor}
                onColorChange={onColorChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUnifiedPickerWheel;