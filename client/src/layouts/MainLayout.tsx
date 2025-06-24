import { useEffect, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { Outlet } from "react-router-dom";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const [sideBarOpen, setSideBarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoading } = useAuth();
  const [theme, setTheme] = useState<0 | 1>(() => {
    // Load from localStorage or default to 'dark'
    const saved = localStorage.getItem("theme");
    if (saved === "0" || saved === "1") {
      return Number(saved) as 0 | 1;
    }
    return 1;
  });

  // Set on theme change
  useEffect(() => {
    localStorage.setItem("theme", theme.toString());
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSideBarOpen(false);
    } else {
      setSideBarOpen(true);
    }
  }, [isMobile])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Background />
      {!isLoading && (
        <>
          <NavBar isMobile={isMobile} openSideBar={() => setSideBarOpen((prev) => !prev)}/>
          <div className="pt-[3em] flex">
            {
              <SideBar
                action={() => setSideBarOpen((prev) => !prev)}
                sideBarOpen={sideBarOpen}
                isMobile={isMobile}
              />
            }
            <div
              className="flex justify-center w-full h-full"
              style={{
                paddingLeft: !isMobile ? (sideBarOpen ? "16rem" : "4rem") : undefined,
                transition: "padding-left 0.5s ease",
              }}
            >
              <div className="w-full max-w-4xl"><Outlet/></div>
            </div>
          </div>
        </>)}
    </ThemeContext.Provider>
  );
};

export default MainLayout;
