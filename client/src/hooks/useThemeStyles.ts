import { useTheme } from '../contexts/ThemeContext';

export const useThemeStyles = () => {
  const { theme } = useTheme();

  return {
    theme,
    bgColor: theme === 0 ? '#fff' : '#252728',
    hoverColor: theme === 0 ? '#fff' : '#252728',
    textColor: theme === 0 ? 'text-black' : 'text-white',
    borderColor: theme === 0 ? 'border-black' : 'border-white/50',
    backgroundLayer: theme === 0 ? '#f4f2ee' : '#1c1c1d',
  };
};
