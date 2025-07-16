import React, { useState, useRef, useEffect } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface AvatarColorWheelProps {
  currentColor: string;
  onColorChange?: (color: string) => void;
  className?: string;
}

const AvatarColorWheel: React.FC<AvatarColorWheelProps> = ({
  currentColor,
  onColorChange,
  className = "",
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const { bgColor, borderColor, textColor } = useThemeStyles();
  const wheelRef = useRef<HTMLCanvasElement>(null);

  const HUE_MAX = 360;
  const SATURATION_MAX = 100;
  const LIGHTNESS_FIXED = 50;

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Convert hex to HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Draw color wheel
  const drawColorWheel = () => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      for (let sat = 0; sat <= radius; sat += 1) {
        const x = centerX + sat * Math.cos(((angle - 90) * Math.PI) / 180);
        const y = centerY + sat * Math.sin(((angle - 90) * Math.PI) / 180);

        const hue = angle;
        const saturation = (sat / radius) * 100;
        const lightness = 50;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw center (white to black gradient)
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius * 0.3
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Handle wheel click
  const handleWheelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      // Calculate hue and saturation
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      const sat = Math.min(distance / radius, 1) * 100;

      setHue(angle);
      setSaturation(sat);
    }
  };

  useEffect(() => {
    if (currentColor) {
      const [h, s] = hexToHsl(currentColor);
      setHue(h);
      setSaturation(s);
    }
  }, [currentColor]);

  useEffect(() => {
    const newColor = hslToHex(hue, saturation, 50);
    setSelectedColor(newColor);
  }, [hue, saturation]);

  useEffect(() => {
    drawColorWheel();
  }, []);

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        {/* Color Wheel */}
        <div className="flex justify-center">
          <canvas
            ref={wheelRef}
            width={200}
            height={200}
            onClick={handleWheelClick}
            className="cursor-crosshair border rounded-lg"
            style={{ borderColor }}
          />
        </div>

        {/* Color Preview */}
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: textColor,
              }}
            />
          </div>
        </div>

        {/* HSL Values */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block mb-1" style={{ color: textColor }}>
              H
            </label>
            <input
              type="number"
              min="0"
              max={HUE_MAX}
              value={Math.round(hue)}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: textColor,
              }}
            />
          </div>
          <div>
            <label className="block mb-1" style={{ color: textColor }}>
              S
            </label>
            <input
              type="number"
              min="0"
              max={SATURATION_MAX}
              value={Math.round(saturation)}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: textColor,
              }}
            />
          </div>
          <div>
            <label className="block mb-1" style={{ color: textColor }}>
              L
            </label>
            <input
              type="number"
              min="0"
              max={SATURATION_MAX}
              value={LIGHTNESS_FIXED}
              disabled
              className="w-full px-2 py-1 border rounded opacity-50"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: textColor,
              }}
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              onColorChange?.(selectedColor);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarColorWheel;
