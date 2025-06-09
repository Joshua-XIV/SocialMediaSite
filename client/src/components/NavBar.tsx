import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../contexts/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import CogWindow from "./CogWindow";
import CloseIcon from '../assets/close.svg?react';
import LoginForm from './LoginForm';

// Starting to become Div & Effect Soup, need to just refactor and put some stuff into components

const NavBar = () => {
  const { theme } = useTheme();
  const { isLoggedIn, username, displayName } = useAuth();
  const { bgColor, bgAntiColor, textColor, borderColor, hoverColor, popupColor } = useThemeStyles();
  const [openCog, setOpenCog] = useState(false);
  const [renderCog, setRenderCog] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);
  const cogRef = useRef<HTMLDivElement>(null);
  const cogColor = theme === 0 ? "black" : "white";

  // Suppose to help with animation
  const toggleCog = () => {
    if (!openCog) {
      setRenderCog(true);
      setOpenCog(true);
    } else {
      setOpenCog(false);
      setTimeout(() => setRenderCog(false), 200);
    }
  };

  // Fetches username and display name


  // Closes Cog Window when click is outside element
  useEffect(() => {
    if (!openCog) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (cogRef.current && !cogRef.current.contains(event.target as Node)) {
        toggleCog();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCog]);

  // Closes Login Window when click is outside element
  useEffect(() => {
    if (!openLogin) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(event.target as Node)) {
        setOpenLogin(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openLogin]);

  // Closes Login Window when pressing ESC
  useEffect(() => {
    if (!openLogin) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenLogin(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [openLogin]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-screen h-[3rem] border-b-2 ${borderColor} 
                  z-10 flex justify-between items-center px-6 space-x-2 ${textColor}`}
        style={{backgroundColor : bgColor }}
      >
        <div>
          <button className={`hover:cursor-pointer ${borderColor} border-2 px-2 rounded-xl bg-gray-400/30 hover:bg-gray-400/60`}>
            HOME
          </button>
        </div>
        <div className={`${borderColor} border-2 px-3 py-0.5 rounded-3xl w-2xs sm:w-xs md:w-md opacity-80 hover:opacity-100`}>
            <input 
              type="text" 
              placeholder="Search..." 
              onChange={(e) => setSearchInput(e.target.value)}
              className={`focus:outline-none w-full placeholder:text-gray-400`}
            />
        </div>
        <div className="space-x-6 flex">
          {!isLoggedIn && <button 
            className={`hover:cursor-pointer ${borderColor} border-2 px-2 rounded-xl bg-gray-400/30 hover:bg-gray-400/60`} 
            onClick={() => setOpenLogin(true)}
          >
              LOGIN
          </button>}
          {/*isLoggedIn && <div>{username}</div>*/}
          {isLoggedIn && <div>{displayName}</div>}
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
                <CogWindow openLogin={() => setOpenLogin(true)} closeWindow={toggleCog} />
              </div>
            )}
          </div>
        </div>
      </div>
      {openLogin && 
        <div className="fixed inset-0 bg-black/50 z-10">
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow w-md z-20 rounded-3xl flex flex-col`}
            style={{ height : '100vh', maxHeight : '34rem', backgroundColor : popupColor}}
            ref={loginRef}
          >
            <button 
              className={`${textColor} w-8 h-8 right-0 mr-4 mt-4 absolute text-2xl hover:cursor-pointer 
                        rounded-full flex items-center justify-center hover:scale-110 opacity-65 hover:opacity-100`}
              style={{background : hoverColor}}
              onClick={() => setOpenLogin(false)}
            >
              <CloseIcon {...{fill: bgAntiColor} as React.SVGProps<SVGSVGElement>}/>
            </button>
            <LoginForm onClose={() => setOpenLogin(false)}/>
          </div>
        </div>
      }
    </>
  );
};

export default NavBar;
