import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'tr';

interface Translations {
  // Welcome Screen (index.tsx)
  appName: string;
  slogan: string;
  loadingSteps: {
    initConnection: string;
    loadDashboard: string;
    syncData: string;
    prepareWorkspace: string;
    almostReady: string;
  };

  // Login Screen
  welcomeBack: string;
  signInSubtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signInButton: string;
  signingIn: string;
  secureAccess: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Allync',
    slogan: 'Beyond human automation',
    loadingSteps: {
      initConnection: 'Initializing secure connection',
      loadDashboard: 'Loading your dashboard',
      syncData: 'Syncing services and data',
      prepareWorkspace: 'Preparing your workspace',
      almostReady: 'Almost ready',
    },
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to continue to your dashboard',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
    secureAccess: 'Secure access to your company dashboard',
  },
  tr: {
    appName: 'Allync',
    slogan: 'İnsan ötesi otomasyon',
    loadingSteps: {
      initConnection: 'Güvenli bağlantı kuruluyor',
      loadDashboard: 'Kontrol paneliniz yükleniyor',
      syncData: 'Servisler ve veriler senkronize ediliyor',
      prepareWorkspace: 'Çalışma alanınız hazırlanıyor',
      almostReady: 'Neredeyse hazır',
    },
    welcomeBack: 'Tekrar Hoşgeldiniz',
    signInSubtitle: 'Kontrol panelinize devam etmek için giriş yapın',
    emailPlaceholder: 'E-posta',
    passwordPlaceholder: 'Şifre',
    signInButton: 'Giriş Yap',
    signingIn: 'Giriş yapılıyor...',
    secureAccess: 'Şirket kontrol panelinize güvenli erişim',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en'); // Default: English

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage === 'en' || savedLanguage === 'tr') {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
