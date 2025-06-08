import { useTheme } from '../contexts/ThemeContext';

export const useThemeStyles = () => {
  const { theme } = useTheme();

  return {
    theme,
    bgColor: theme === 0 ? '#fff' : '#252728',
    bgAntiColor: theme === 0 ? '#252728' : '#fff',
    popupColor: theme === 0 ? '#fff' : '#181c1f',
    hoverColor: theme === 0 ? '#f4f2ef' : '#2a3236',
    hoverColor_2: theme === 0 ? '#f4f2f4' : '#333d42',
    inputColor: theme === 0 ? '#fff' : '#25272a',
    textColor: theme === 0 ? 'text-black' : 'text-white',
    borderColor: theme === 0 ? 'border-black' : 'border-white/50',
    backgroundLayer: theme === 0 ? '#f4f2ee' : '#1c1c1d',
  };
};
