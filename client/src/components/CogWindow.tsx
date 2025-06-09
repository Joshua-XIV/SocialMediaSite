import { useTheme } from "../contexts/ThemeContext";
import { useThemeStyles } from "../hooks/useThemeStyles";
import CogButton from "./CogButton";
import SunImage from "../assets/sun.svg";
import MoonImage from "../assets/moon.svg";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../api/auth";

interface CogWindowProps {
  openLogin: () => void;
  closeWindow: () => void;
}

const CogWindow = ({openLogin, closeWindow} : CogWindowProps) => {
  const { theme, setTheme } = useTheme();
  const { bgColor, textColor } = useThemeStyles();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === 0 ? 1 : 0);
  };

  const handleSettings = () => {};

  const handleLogout = async() => {
    await logout();
    setIsLoggedIn(false);
  };

  return (
    <div
      className={`fixed mt-[1.5rem] mr-[1rem] right-0 flex flex-col justify-center items-center ${textColor} rounded-2xl p-2 shadow space-y-1`}
      style={{backgroundColor : bgColor }}
    >
      {!isLoggedIn && <CogButton onClick={ () => {openLogin(); closeWindow();}} text="Login/Sign-Up" />}
      {isLoggedIn && <CogButton onClick={() => ""} text="View Profile"/>}
      <CogButton onClick={handleSettings} text="Settings" />
      {isLoggedIn && <CogButton onClick={handleLogout} text="Logout"/>}
      <div className="flex justify-center items-center space-x-1">
        <img src={SunImage} className="w-5 h-5"></img>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={theme === 1}
            onChange={toggleTheme}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
          <div
            className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition-transform"
            aria-hidden="true"
          />
        </label>
        <img src={MoonImage} className="w-5 h-5"></img>
      </div>
    </div>
  );
};

export default CogWindow;
