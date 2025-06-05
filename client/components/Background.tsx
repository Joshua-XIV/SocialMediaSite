import { useTheme } from '../contexts/ThemeContext';

const Background = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';

  return (
    <div className={`h-screen w-screen fixed ${bgColor} -z-10`}/>
  )
}

export default Background