import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import CogWindow from "./CogWindow";
import HomeIcon from "../assets/home.svg?react";
import SideBarIcon from "../assets/sidebar.svg?react";
import CreatePostWindow from "./CreatePostWindow";
import { Link, useNavigate } from "react-router-dom";
import { useModal } from "../contexts/ModalContext";
import Avatar from "./Avatar";

// Starting to become Div & Effect Soup, need to just refactor and put some stuff into components
interface NavBarProps {
  isMobile: boolean;
  openSideBar: () => void;
}
const NavBar = ({ isMobile, openSideBar }: NavBarProps) => {
  const { theme } = useTheme();
  const { isLoggedIn, displayName, avatarColor } = useAuth();
  const {
    bgColor,
    bgAntiColor,
    textColor,
    borderColor,
    inputColor,
    popupColor,
    hoverColor,
  } = useThemeStyles();
  const [openCog, setOpenCog] = useState(false);
  const [renderCog, setRenderCog] = useState(false);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchCategory, setSearchCategory] = useState<
    "all" | "posts" | "people" | "jobs"
  >("all");
  const loginRef = useRef<HTMLDivElement>(null);
  const cogRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const cogColor = theme === 0 ? "black" : "white";
  const { openLogin } = useModal();
  const navigate = useNavigate();

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

  // Closes category dropdown when click is outside
  useEffect(() => {
    if (!showCategoryDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCategoryDropdown]);

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

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(
        `/search?q=${encodeURIComponent(searchInput)}&type=${searchCategory}`
      );
      setSearchInput("");
    }
  };

  const categoryOptions = [
    { key: "all", label: "All", icon: "🔍" },
    { key: "posts", label: "Posts", icon: "📝" },
    { key: "people", label: "People", icon: "👥" },
    { key: "jobs", label: "Jobs", icon: "💼" },
  ];

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-screen h-[3rem] border-b-2 ${borderColor} 
                  z-50 flex justify-between items-center px-6 space-x-2 ${textColor}`}
        style={{ backgroundColor: bgColor }}
      >
        {/* Home And SideBar*/}
        <div className="flex items-center justify-center gap-x-4">
          {isMobile && (
            <button className="hover:cursor-pointer" onClick={openSideBar}>
              <SideBarIcon
                {...({
                  fill: bgAntiColor,
                  fontSize: 40,
                } as React.SVGProps<SVGSVGElement>)}
              />
            </button>
          )}
          <Link to={"/"} className={`hover:cursor-pointer flex items-center`}>
            <HomeIcon
              {...({
                fill: bgAntiColor,
                width: 28,
                height: 28,
              } as React.SVGProps<SVGSVGElement>)}
            />
          </Link>
        </div>
        {/* Search with category selector */}
        <form
          onSubmit={handleSearch}
          className={`flex items-center ${borderColor} border-2 px-1 py-0.5 rounded-3xl w-2xs sm:w-xs md:w-md opacity-80 hover:opacity-100`}
          style={{ position: "relative", backgroundColor: inputColor }}
        >
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              className={`flex items-center gap-1 px-2 py-1 rounded-l-3xl border-none focus:outline-none cursor-pointer ${textColor}`}
              style={{
                backgroundColor: inputColor,
                transition: "background 0.2s",
              }}
              onClick={() => setShowCategoryDropdown((prev) => !prev)}
              tabIndex={0}
            >
              <span>
                {
                  categoryOptions.find((opt) => opt.key === searchCategory)
                    ?.icon
                }
              </span>
              <span className="font-medium">
                {
                  categoryOptions.find((opt) => opt.key === searchCategory)
                    ?.label
                }
              </span>
              <span className="ml-1">▼</span>
            </button>
            {showCategoryDropdown && (
              <div
                className={`absolute left-0 top-full mt-1 w-32 ${borderColor} border-2 rounded-lg shadow-lg z-50`}
                style={{ backgroundColor: popupColor }}
              >
                {categoryOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 cursor-pointer ${
                      searchCategory === option.key
                        ? "bg-blue-50 text-blue-600"
                        : textColor
                    }`}
                    style={{
                      backgroundColor:
                        searchCategory === option.key ? undefined : "",
                    }}
                    onClick={() => {
                      setSearchCategory(option.key as any);
                      setShowCategoryDropdown(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = hoverColor)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        searchCategory === option.key ? "" : "")
                    }
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {searchCategory === option.key && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`focus:outline-none w-full placeholder:text-gray-400 px-2 ${textColor}`}
            style={{ backgroundColor: inputColor }}
          />
          <button
            type="submit"
            className="px-2 py-1 rounded-2xl text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
        {/* Create or Login, Name, and CogWheel */}
        <div className="space-x-6 flex items-center">
          {/* Login */}
          {!isLoggedIn && (
            <button
              className={`hover:cursor-pointer ${borderColor} border-2 px-2 rounded-xl bg-gray-400/30 hover:bg-gray-400/60`}
              onClick={() => openLogin("login")}
            >
              LOGIN
            </button>
          )}
          {/* Create */}
          {isLoggedIn && (
            <div>
              <FontAwesomeIcon
                icon={faPlus}
                color={cogColor}
                size="2xl"
                className="hover:cursor-pointer hover:scale-105"
                onClick={() => setOpenCreatePost(true)}
              />
            </div>
          )}
          {isLoggedIn && <div>{displayName}</div>}
          {isLoggedIn && (
            <Avatar
              displayName={displayName || ""}
              avatarColor={avatarColor || "#3B82F6"}
              size="sm"
            />
          )}
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
                <CogWindow
                  openLogin={() => openLogin("login")}
                  closeWindow={toggleCog}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Create Post */}
      {openCreatePost && (
        <CreatePostWindow
          closePost={() => setOpenCreatePost(false)}
          loginRef={loginRef}
        />
      )}
    </>
  );
};

export default NavBar;
