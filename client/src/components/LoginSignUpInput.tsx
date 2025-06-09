import { useEffect, useRef, useState } from "react";
import { useThemeStyles } from "../hooks/useThemeStyles"
import PassHideIcon from '../assets/passwordHide.svg?react';
import PassShowIcon from '../assets/passwordShow.svg?react'

interface LoginSignUpInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isPrivate?: boolean;
}

const LoginSignUpInput = ({placeholder, value, onChange, isPrivate} : LoginSignUpInputProps) => {
  const {hoverColor, textColor, hoverColor_2, borderColor, bgAntiColor} = useThemeStyles();
  const [enableInput, setEnableInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!enableInput) return;

    const handleUserClick = (event : MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setEnableInput(false);
      }
    }

    document.addEventListener('mousedown', handleUserClick);
    return () => {
      document.removeEventListener('mousedown', handleUserClick);
    }
  }, [enableInput])

  return (
    <div
      className={`w-full h-[4rem] rounded-3xl flex flex-col justify-center ${enableInput ? `border-2 ${borderColor}` : ""}`}
      style={{backgroundColor : isHovered ? hoverColor_2 : hoverColor}}
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
        <div className={`ml-[1rem] text-gray-400 transition-all duration-300 ${enableInput ? 'text-[12px]' : ''}`}>{placeholder}</div>
        {(enableInput || value) &&
          <input
            type={isPrivate && !showPassword ? "password" : "text" }
            className={`mx-4 outline-none ${textColor}`}
            ref={inputRef} onChange={(e) => onChange(e.target.value)}
          />
        }
      </div>
      {isPrivate && <div className="mr-6 hover:cursor-pointer opacity-50 hover:opacity-100" onClick={() => setShowPassword(prev => !prev)}>
        {!showPassword && <PassHideIcon {...{fill: bgAntiColor, width: 30, height: 30} as React.SVGProps<SVGSVGElement>}/>}
        {showPassword && <PassShowIcon {...{fill: bgAntiColor, width: 30, height: 30} as React.SVGProps<SVGSVGElement>}/>}
      </div>}
    </div>
    </div>
  )
}

export default LoginSignUpInput