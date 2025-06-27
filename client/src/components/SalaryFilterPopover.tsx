import { useState } from "react";
import type { CompensationType } from "../util/types";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface SalaryFilterPopoverProps {
  selected: {
    type: CompensationType;
    desired: number | null;
  };
  onApply: (value: { type: CompensationType; desired: number | null }) => void;
  onClose: () => void;
}

export const SalaryFilterPopover = ({ selected, onApply, onClose }: SalaryFilterPopoverProps) => {
  const { textColor, bgColor, borderColor } = useThemeStyles();
  const [type, setType] = useState<CompensationType>(selected.type);
  const [inputValue, setInputValue] = useState(selected.desired?.toString() || "");

  const handleApply = () => {
    const parsed = parseInt(inputValue);
    onApply({
      type,
      desired: isNaN(parsed) ? null : parsed,
    });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl ${borderColor} border-2 rounded-3xl p-4`} 
        style={{backgroundColor : bgColor}}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`font-semibold mb-2 ${textColor}`}>Compensation Filter</h3>
        <div className="flex gap-2 mb-3">
          <button
            className={`px-2 py-1 rounded border ${textColor} ${borderColor} ${
              type === "Yearly" ? "bg-blue-500" : ""
            }`}
            onClick={() => setType("Yearly")}
          >
            Yearly
          </button>
          <button
            className={`px-2 py-1 rounded border ${textColor} ${borderColor} ${
              type === "Hourly" ? "bg-blue-500" : ""
            }`}
            onClick={() => setType("Hourly")}
          >
            Hourly
          </button>
        </div>
        <input
          type="number"
          placeholder={`Desired ${type.toLowerCase()} pay (USD)`}
          className={`no-spinner w-full p-2 rounded border ${borderColor} bg-transparent ${textColor} focus:outline-none`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}     
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            className={`px-2 py-1 rounded ${textColor}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-2 py-1 rounded bg-blue-500 text-white`}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryFilterPopover