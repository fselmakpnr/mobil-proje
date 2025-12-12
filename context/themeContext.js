import React, { createContext, useState, useContext } from 'react';


const lightTheme = {
  dark: false,
  colors: {
    background: '#F5F7FA', 
    card: '#E0E0E0',       
    text: '#555555',       
    subText: '#888888',
    primary: '#8CAC94',    
    stop: '#BC6C6C',       
    reset: '#F5E8A6',      
    tint: '#8CAC94',       
    tabBar: '#F5F7FA',     
  }
};

const darkTheme = {
  dark: true,
  colors: {
    background: '#121212', 
    card: '#2C2C2C',       
    text: '#E0E0E0',       
    subText: '#A0A0A0',
    primary: '#8CAC94',    
    stop: '#CF6679',       
    reset: '#CFBC68',      
    tint: '#8CAC94',
    tabBar: '#121212',     
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false); 
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);