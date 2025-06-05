import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  
  return (
    <div className={`${textColor} text-9xl px-6`}>
      {Array.from({length: 10}).map((_,i) => (
        <div key={i} className={``}>Hello World</div>
      ))}
    </div>
  )
}

export default HomePage