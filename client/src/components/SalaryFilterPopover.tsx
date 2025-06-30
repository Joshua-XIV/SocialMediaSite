import { useEffect, useState } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface SalaryFilterPopoverProps {
  selected: {
    desired: number | null;
  };
  onApply: (value: { desired: number | null }) => void;
  onClose: () => void;
}

export const SalaryFilterPopover = ({ selected, onApply, onClose }: SalaryFilterPopoverProps) => {
  const { textColor, bgColor, borderColor } = useThemeStyles();
  const [inputValue, setInputValue] = useState(selected.desired?.toString() || "");

  const handleApply = () => {
    const parsed = parseInt(inputValue);
    onApply({
      desired: isNaN(parsed) ? null : parsed,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl ${borderColor} border-2 rounded-3xl p-4`}
        style={{ backgroundColor: bgColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`font-semibold mb-2 ${textColor}`}>Compensation Filter</h3>
        <input
          type="number"
          placeholder="Desired annual compensation (USD)"
          className={`no-spinner w-full p-2 rounded border ${borderColor} bg-transparent ${textColor} focus:outline-none`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          min={0}
          onKeyDown={(e) => {if (e.key === "Enter") handleApply();}}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button className={`px-2 py-1 rounded ${textColor}`} onClick={onClose}>
            Cancel
          </button>
          <button className="px-2 py-1 rounded bg-blue-500 text-white" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryFilterPopover;