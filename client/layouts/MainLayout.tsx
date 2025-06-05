import { useEffect, useState } from "react"
import{ThemeContext} from '../contexts/ThemeContext'
import {Outlet} from "react-router-dom"
import Background from '../components/Background'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'


const MainLayout = () => {
  const [sideBarOpen, setSideBarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Load from localStorage or default to 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      <Background/>
      <NavBar/>
      <div className="pt-[4em]">
        {<SideBar action={() => setSideBarOpen(prev => !prev)} sideBarOpen={sideBarOpen}/>}
        <div 
          style={{
            paddingLeft: sideBarOpen ? '16rem' : '4rem',
            transition: 'padding-left 0.5s ease'
          }}><Outlet/>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}

export default MainLayout