import { useRef } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface VerificationCodeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

const CODE_LENGTH = 6;

const VerificationCodeInput = ({
  value,
  onChange,
  disabled,
  error,
}: VerificationCodeInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const {textColor} = useThemeStyles();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value.replace(/\D/g, ""); // Only digits
    if (!val) return;
    const chars = val.split("");
    let newValue = value.split("");
    for (let i = 0; i < chars.length && idx + i < CODE_LENGTH; i++) {
      newValue[idx + i] = chars[i];
    }
    onChange(newValue.join("").slice(0, CODE_LENGTH));
    // Focus next
    if (idx + chars.length < CODE_LENGTH) {
      inputsRef.current[idx + chars.length]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        // Clear current
        const newValue = value.split("");
        newValue[idx] = "";
        onChange(newValue.join(""));
      } else if (idx > 0) {
        // Move to previous
        inputsRef.current[idx - 1]?.focus();
        const newValue = value.split("");
        newValue[idx - 1] = "";
        onChange(newValue.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (paste) {
      onChange(paste);
      // Focus last
      setTimeout(() => {
        inputsRef.current[paste.length - 1]?.focus();
      }, 0);
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-x-2">
      {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={el => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className={`w-10 h-12 text-center text-2xl rounded border focus:outline-none focus:ring-2 transition-colors ${textColor} ${
            error
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-300"
          }`}
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="off"
          name={`digit-${idx}`}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
