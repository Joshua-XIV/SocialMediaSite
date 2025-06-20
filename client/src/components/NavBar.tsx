import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../contexts/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import CogWindow from "./CogWindow";
import HomeIcon from '../assets/home.svg?react';
import SideBarIcon from "../assets/sidebar.svg?react"
import CreatePostWindow from './CreatePostWindow';
import { Link } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';

// Starting to become Div & Effect Soup, need to just refactor and put some stuff into components
interface NavBarProps {
  isMobile: boolean;
  openSideBar: () => void;
}
const NavBar = ({isMobile, openSideBar} : NavBarProps) => {
  const { theme } = useTheme();
  const { isLoggedIn, displayName } = useAuth();
  const { bgColor, bgAntiColor, textColor, borderColor } = useThemeStyles();
  const [openCog, setOpenCog] = useState(false);
  const [renderCog, setRenderCog] = useState(false);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [, setSearchInput] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);
  const cogRef = useRef<HTMLDivElement>(null);
  const cogColor = theme === 0 ? "black" : "white";
   const { openLogin } = useModal();

  // Suppose to help with window animation
  const toggleCog = () => {
    if (!openCog) {
      setRenderCog(true);
      setOpenCog(true);
    } else {
      setOpenCog(false);
      setTimeout(() => setRenderCog(false), 200);
    }
  };

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

  // Closes Post Window when pressing ESC
  useEffect(() => {
    if (!openCreatePost) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenCreatePost(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [openCreatePost]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-screen h-[3rem] border-b-2 ${borderColor} 
                  z-50 flex justify-between items-center px-6 space-x-2 ${textColor}`}
        style={{backgroundColor : bgColor }}
      >
        {/* Home And SideBar*/}
        <div className='flex items-center justify-center gap-x-4'>
          {isMobile && 
            <button className='hover:cursor-pointer' onClick={openSideBar}>
              <SideBarIcon {...{fill : bgAntiColor, fontSize: 40} as React.SVGProps<SVGSVGElement>}/>
            </button>
          }
          <Link to={'/'} className={`hover:cursor-pointer flex items-center`}>
            <HomeIcon {...{fill : bgAntiColor, width: 28, height: 28} as React.SVGProps<SVGSVGElement>}/>
          </Link>
        </div>
        {/* Search */}
        <div className={`${borderColor} border-2 px-3 py-0.5 rounded-3xl w-2xs sm:w-xs md:w-md opacity-80 hover:opacity-100`}>
            <input 
              type="text" 
              placeholder="Search..." 
              onChange={(e) => setSearchInput(e.target.value)}
              className={`focus:outline-none w-full placeholder:text-gray-400`}
            />
        </div>
        {/* Create or Login, Name, and CogWheel */}
        <div className="space-x-6 flex items-center">
          {/* Login */}
          {!isLoggedIn && <button 
            className={`hover:cursor-pointer ${borderColor} border-2 px-2 rounded-xl bg-gray-400/30 hover:bg-gray-400/60`} 
            onClick={() => openLogin("login")}
          >
              LOGIN
          </button>}
          {/* Create */}
          {isLoggedIn && 
            <div>
              <FontAwesomeIcon 
                icon={faPlus}
                color={cogColor}
                size='2xl'
                className='hover:cursor-pointer hover:scale-105'
                onClick={() => setOpenCreatePost(true)}
              />
            </div>}
          {isLoggedIn && <div>{displayName}</div>}
          {/* Cog Wheel & Cog Window */}
          <div className="relative" ref={cogRef}>
            <FontAwesomeIcon
              icon={faCog}
              color={cogColor}
              size="2xl"
              className="hover:cursor-pointer hover:scale-105"
              onClick={toggleCog}
            />
            {renderCog && (
              <div
                className={`transition-opacity duration-500 ease-in-out ${
                  openCog ? "opacity-100" : "opacity-0"
                }`}
              >
                <CogWindow openLogin={() => openLogin("login")} closeWindow={toggleCog}/>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Create Post */}
      {openCreatePost && 
        <CreatePostWindow
          closePost ={() => setOpenCreatePost(false)}
          loginRef={loginRef}
        />
      }
    </>
  );
};

export default NavBar;
