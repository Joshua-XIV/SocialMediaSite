import { useEffect, useRef, useState } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles";
import PassHideIcon from "../assets/passwordHide.svg?react";
import PassShowIcon from "../assets/passwordShow.svg?react";

interface LoginSignUpInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
  name?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
}

const LoginSignUpInput = ({
  placeholder,
  value,
  onChange,
  type,
  error,
  autoComplete,
  name,
  inputMode,
}: LoginSignUpInputProps) => {
  const { hoverColor, textColor, hoverColor_2, borderColor, bgAntiColor } =
    useThemeStyles();
  const [enableInput, setEnableInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!enableInput) return;

    const handleUserClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setEnableInput(false);
      }
    };

    document.addEventListener("mousedown", handleUserClick);
    return () => {
      document.removeEventListener("mousedown", handleUserClick);
    };
  }, [enableInput]);

  return (
    <div>
      <div>
        <div
          className={`w-full h-[3.5rem] rounded-3xl flex flex-col justify-center 
                    ${error ? "border-2 border-red-400" : ""} ${
            enableInput ? `border-2 ${borderColor}` : ""
          }`}
          style={{ backgroundColor: isHovered ? hoverColor_2 : hoverColor }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            setEnableInput(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }}
          ref={containerRef}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`ml-[1rem] text-gray-400 transition-all duration-300 ${
                  enableInput ? "text-[12px]" : ""
                }`}
              >
                {placeholder}
              </div>
              {(enableInput || value) && (
                <input
                  type={type === "password" && showPassword ? "text" : type}
                  className={`mx-4 outline-none ${textColor}`}
                  ref={inputRef}
                  onChange={(e) => onChange(e.target.value)}
                  autoComplete={autoComplete || "off"}
                  name={name}
                  inputMode={inputMode}
                />
              )}
            </div>
            {type === "password" && (
              <div
                className="mr-6 hover:cursor-pointer opacity-50 hover:opacity-100"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {!showPassword && (
                  <PassHideIcon
                    {...({
                      fill: bgAntiColor,
                      width: 30,
                      height: 30,
                    } as React.SVGProps<SVGSVGElement>)}
                  />
                )}
                {showPassword && (
                  <PassShowIcon
                    {...({
                      fill: bgAntiColor,
                      width: 30,
                      height: 30,
                    } as React.SVGProps<SVGSVGElement>)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-red-400 ml-5 h-[1.5rem]">{error}</div>
    </div>
  );
};

export default LoginSignUpInput;
