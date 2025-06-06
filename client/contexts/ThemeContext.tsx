import {createContext, useContext} from "react"

export const ThemeContext = createContext<{
  theme: 0 | 1;
  setTheme: (theme: 0 | 1) => void;
}>({
  theme: 1,
  setTheme: () => {}
})

export const useTheme = () => useContext(ThemeContext);