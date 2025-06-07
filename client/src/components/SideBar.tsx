import { useThemeStyles } from "../hooks/useThemeStyles";

interface SideBarProps {
  action: () => void;
  sideBarOpen: boolean;
}

const SideBar = ({ action, sideBarOpen }: SideBarProps) => {
  const { bgColor, textColor, borderColor, backgroundLayer } = useThemeStyles();

  return (
    <div
      className={`fixed h-[calc(100vh-4rem)] ${borderColor} border-r-2 ${textColor}`}
      style={{
        width: sideBarOpen ? "16rem" : "4rem",
        transition: "width 0.5s ease",
      }}
    >
      <button
        onClick={action}
        className={`relative w-8 h-8 top-1/2 -translate-y-1/2 rounded-full border-2 ${borderColor} hover:cursor-pointer`}
        style={{
          left: sideBarOpen ? "14.9rem" : "2.9rem",
          position: "relative",
          transition: "left 0.5s ease",
          backgroundColor: backgroundLayer,
        }}
      />
    </div>
  );
};

export default SideBar;
