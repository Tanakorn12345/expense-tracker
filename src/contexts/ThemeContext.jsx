import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Helper to adjust color brightness
  const adjustColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, c => 
      ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).slice(-2)
    );
  };

  // Apply custom user theme color
  useEffect(() => {
    const checkUserTheme = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.themeColor) {
            const main = user.themeColor;
            document.documentElement.style.setProperty('--primary-main', main);
            document.documentElement.style.setProperty('--primary-light', adjustColor(main, 40));
            document.documentElement.style.setProperty('--primary-dark', adjustColor(main, -30));
            document.documentElement.style.setProperty('--accent', adjustColor(main, 80));
          } else {
            document.documentElement.style.removeProperty('--primary-main');
            document.documentElement.style.removeProperty('--primary-light');
            document.documentElement.style.removeProperty('--primary-dark');
            document.documentElement.style.removeProperty('--accent');
          }
        } else {
          document.documentElement.style.removeProperty('--primary-main');
          document.documentElement.style.removeProperty('--primary-light');
          document.documentElement.style.removeProperty('--primary-dark');
          document.documentElement.style.removeProperty('--accent');
        }
      } catch (e) {
        console.error('Error parsing user for theme', e);
      }
    };
    
    // Initial check
    checkUserTheme();
    
    // Listen for custom event or storage change
    window.addEventListener('userUpdated', checkUserTheme);
    window.addEventListener('storage', checkUserTheme);
    
    return () => {
      window.removeEventListener('userUpdated', checkUserTheme);
      window.removeEventListener('storage', checkUserTheme);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
