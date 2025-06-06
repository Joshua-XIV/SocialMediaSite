import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../contexts/ThemeContext';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const NavBar = () => {
  const { theme, setTheme } = useTheme();
  const bgColor = theme === 0 ? 'bg-white' : 'bg-black';
  const textColor = theme === 0 ? 'text-black' : 'text-white';
  const borderColor = theme === 0 ? 'border-black' : 'border-white/50';
  const cogColor = theme === 0 ? 'black' : 'white';
  const [openCog, setOpenCog] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 0 ? 1 : 0);
  };

  return (
    <div className={`fixed top-0 left-0 ${bgColor} w-screen h-[4rem] border-b-2 ${borderColor} z-50 flex justify-between items-center px-6 ${textColor}`}>
      <div className="">HOME</div>
      <button onClick={toggleTheme}>THEME SWAP</button>
      <div className='space-x-6 flex'> 
        <button>LOGIN</button>
        <div>
          <FontAwesomeIcon icon={faCog} color={cogColor} size='2xl' className='hover:cursor-pointer' onClick={() => setOpenCog(prev => !prev)}/>
          {openCog && 
            <div className=' mt-[1rem] absolute border-2 border-amber-500'>

            </div>}
        </div>
      </div>
    </div>
  )
}

export default NavBar