import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    primary: string;
    border: string;
    cardBackground: string;
    success: string;
    error: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = {
  background: '#FFFFFF',
  text: '#1a1b1b',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  primary: '#0D6EFD',
  border: '#DEE2E6',
  cardBackground: '#F8F9FA',
  success: '#28a745',
  error: '#dc3545',
};

const darkTheme = {
  background: '#000000',
  text: '#F8F9FA',
  textSecondary: '#ADB5BD',
  textTertiary: '#6C757D',
  primary: '#0D6EFD',
  border: '#495057',
  cardBackground: '#1a1b1b',
  success: '#28a745',
  error: '#dc3545',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
