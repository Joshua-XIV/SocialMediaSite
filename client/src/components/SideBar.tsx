import { useThemeStyles } from "../hooks/useThemeStyles";
import SideBarContent from "./SideBarContent";

interface SideBarProps {
  action: () => void;
  sideBarOpen: boolean;
  isMobile: boolean;
}

const SideBar = ({ action, sideBarOpen, isMobile }: SideBarProps) => {
  const { textColor, borderColor, backgroundLayer } = useThemeStyles();
  const baseStyles = "top-[3rem] h-[calc(100vh-3rem)] z-40 transition-all duration-500";


  if (isMobile) {
    // Overlay for when screen is small
    return (
      <>
        {/* Backdrop */}
        {sideBarOpen && (
          <div
            className="fixed top-[3rem] left-0 right-0 bottom-0 bg-transparent bg-opacity-40 z-40"
            onClick={action}
          />
        )}
        {/* SideBar */}
        <div
          className={`${baseStyles} fixed ${textColor} border-r-1 ${borderColor}`}
          style={{
            width: "16rem",
            left: sideBarOpen ? "0" : "-16rem",
            backgroundColor: backgroundLayer,
            boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
          }}
        >
          <SideBarContent></SideBarContent>
        </div>
      </>
    );
  }

  // Not Overlay, pushes/pulls main content left/right
  return (
    // SideBar with Button
    <div
      className={`fixed ${baseStyles} border-r-2 ${textColor} ${borderColor}`}
      style={{
        width: sideBarOpen ? "16rem" : "4rem",
        backgroundColor: backgroundLayer,
      }}
    >
      <SideBarContent></SideBarContent>
      <button
        onClick={action}
        className={`absolute w-8 h-8 top-1/2 -translate-y-1/2 rounded-full border-2 ${borderColor} hover:cursor-pointer transition-all duration-500`}
        style={{
          left: sideBarOpen ? "14.9rem" : "2.9rem",
          backgroundColor: backgroundLayer,
        }}
      />
    </div>
  );
};

export default SideBar;
