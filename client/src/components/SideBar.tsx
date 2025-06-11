import { useThemeStyles } from "../hooks/useThemeStyles";

interface SideBarProps {
  action: () => void;
  sideBarOpen: boolean;
  isMobile: boolean;
}

const SideBar = ({ action, sideBarOpen, isMobile }: SideBarProps) => {
  const { textColor, borderColor, backgroundLayer } = useThemeStyles();

  return (
    <div
      className={`fixed h-[calc(100vh-3rem)] ${borderColor} border-r-2 ${textColor}`}
      style={{
        width: isMobile ? "0rem" : (sideBarOpen ? "16rem" : "4rem"),
        borderRightWidth: isMobile ? "0px" : "2px",
        borderRightStyle: "solid",
        transition: "width 0.5s ease, border-right-width 0.5s ease",
      }}
    >
      {<button
        onClick={action}
        className={`absolute w-8 h-8 top-1/2 -translate-y-1/2 rounded-full border-2 ${borderColor} hover:cursor-pointer`}
        style={{
          left: isMobile ? "-2rem" : (sideBarOpen ? "14.9rem" : "2.9rem"),
          position: "absolute",
          transition: "left 0.5s ease",
          backgroundColor: backgroundLayer,
        }}
      />}
    </div>
  );
};

export default SideBar;
