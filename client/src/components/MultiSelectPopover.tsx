import { useState, useEffect } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface MultiSelectPopoverProps<T extends string> {
  title: string;
  options: T[];
  selected: T[];
  onApply: (selected: T[]) => void;
  onClose: () => void;
}

export function MultiSelectPopover<T extends string>({ title, options, selected, onApply, onClose,}: MultiSelectPopoverProps<T>) {
  const [localSelection, setLocalSelection] = useState<Set<T>>(new Set(selected));
  const { bgColor, textColor, borderColor } = useThemeStyles();
  const toggle = (value: T) => {
    setLocalSelection(prev => {
      const newSet = new Set(prev);
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
      const updated = Array.from(newSet);
      onApply(updated);
      return newSet;
    });
  };

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`${borderColor} border-2 rounded-3xl p-4 max-w-xl w-full`}
        onClick={(e) => e.stopPropagation()}
        style={{backgroundColor : bgColor}}
      >
        <p className={`${textColor} font-semibold mb-4 text-lg`}>{title}</p>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {options.map(option => (
            <label key={option} className={`${textColor} flex items-center gap-2`}>
              <input
                className="hover:cursor-pointer"
                type="checkbox"
                checked={localSelection.has(option)}
                onChange={() => toggle(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => {
              onApply(Array.from(localSelection));
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
