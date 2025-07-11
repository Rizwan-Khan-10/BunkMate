import { createContext, useContext } from "react";

export const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { }
});

export const useTheme = () => {
    return useContext(ThemeContext);
}

export const ThemeProvider = ThemeContext.Provider;