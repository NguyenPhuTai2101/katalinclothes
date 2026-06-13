import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (vi: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi');

  // Load initial language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ktl_language') as Language | null;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    } else {
      // Check browser preference
      const browserLang = navigator.language.toLowerCase();
      const initialLang = browserLang.startsWith('vi') ? 'vi' : 'en';
      setLanguageState(initialLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ktl_language', lang);
  };

  // Helper function to translate text on the fly
  const t = (vi: string, en: string): string => {
    return language === 'vi' ? vi : en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
