import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../contexts/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import CogWindow from "./CogWindow";

const NavBar = () => {
  const { theme, setTheme } = useTheme();
  const { bgColor, textColor, borderColor } = useThemeStyles();
  const [openCog, setOpenCog] = useState(false);
  const [renderCog, setRenderCog] = useState(false);
  const cogRef = useRef<HTMLDivElement>(null);
  const cogColor = theme === 0 ? "black" : "white";

  const toggleTheme = () => {
    setTheme(theme === 0 ? 1 : 0);
  };

  const toggleCog = () => {
    if (!openCog) {
      setRenderCog(true);
      setOpenCog(true);
    } else {
      setOpenCog(false);
      setTimeout(() => setRenderCog(false), 200);
    }
  };

  useEffect(() => {
    if (!openCog) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (cogRef.current && !cogRef.current.contains(event.target as Node)) {
        setOpenCog(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCog]);

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-[4rem] border-b-2 ${borderColor} z-50 flex justify-between items-center px-6 ${textColor}`}
      style={{backgroundColor : bgColor }}
    >
      <div className="">HOME</div>
      <div className="space-x-6 flex">
        <button className="hover:cursor-pointer">LOGIN</button>
        <div className="relative" ref={cogRef}>
          <FontAwesomeIcon
            icon={faCog}
            color={cogColor}
            size="2xl"
            className="hover:cursor-pointer"
            onClick={toggleCog}
          />
          {renderCog && (
            <div
              className={`transition-opacity duration-500 ease-in-out ${
                openCog ? "opacity-100" : "opacity-0"
              }`}
            >
              <CogWindow />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
