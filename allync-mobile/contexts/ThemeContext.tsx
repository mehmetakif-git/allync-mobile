import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
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

// App is permanently locked to dark mode
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
  return (
    <ThemeContext.Provider value={{ colors: darkTheme }}>
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
