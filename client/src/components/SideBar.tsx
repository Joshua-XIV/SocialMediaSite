import { useThemeStyles } from "../hooks/useThemeStyles";
import SideBarContent from "./SideBarContent";

interface SideBarProps {
  action: () => void;
  sideBarOpen: boolean;
  isMobile: boolean;
}

const SideBar = ({ action, sideBarOpen, isMobile }: SideBarProps) => {
  const { textColor, borderColor, backgroundLayer } = useThemeStyles();
  const baseStyles = "top-[3rem] h-[calc(100vh-3rem)] z-40 transition-opacity transition-transform transition-[padding] transition-[width] duration-500";


  if (isMobile) {
    // Overlay for when screen is small
    return (
      <>
        {/* Backdrop */}
        {sideBarOpen && (
          <div
            className="fixed top-[3rem] left-0 right-0 bottom-0 bg-transparent bg-opacity-40 z-30"
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
            transition: 'left width 0.5s'
          }}
        >
        <div 
          style={{ 
            opacity: sideBarOpen ? 1 : 0, 
            pointerEvents: sideBarOpen ? 'auto' : 'none',  
            transition: 'opacity 0.3s'
          }}>
          <SideBarContent />
        </div>
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
        transition: 'width 0.5s'
      }}
    >
      <div 
        style={{ 
          opacity: sideBarOpen ? 1 : 0, 
          pointerEvents: sideBarOpen ? 'auto' : 'none', 
          transform: sideBarOpen ? 'translateX(0)' : 'translateX(-80px)',
          transition: 'opacity 0.3s ease, transform 0.5s ease' }}>
        <SideBarContent />
      </div>
      <button
        onClick={action}
        className={`absolute w-8 h-8 top-1/2 -translate-y-1/2 rounded-full border-2 ${borderColor} hover:cursor-pointer duration-500`}
        style={{
          left: sideBarOpen ? "14.9rem" : "2.9rem",
          backgroundColor: backgroundLayer,
          transition: 'left 0.5s'
        }}
      />
    </div>
  );
};

export default SideBar;
