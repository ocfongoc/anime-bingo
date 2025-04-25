import React, { createContext, useContext, useState, useEffect } from 'react';
import { ja } from '../translations/ja';
import { zhTW } from '../translations/zh-TW';
import { en } from '../translations/en';
import { animeTranslations } from '../translations/anime';

type Language = 'ja' | 'zh-TW' | 'en';

interface Translation {
  title: string;
  saveImage: string;
  copyLink: string;
  watched: string;
  notWatched: string;
  linkCopied: string;
  stats: {
    watched: string;
    notWatched: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translation) => string;
  stats: Translation['stats'];
  translateAnime: (title: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translation> = {
  'ja': ja,
  'zh-TW': zhTW,
  'en': en
};

const getInitialLanguage = (): Language => {
  // First check localStorage
  const savedLanguage = localStorage.getItem('language') as Language;
  if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'zh-TW' || savedLanguage === 'en')) {
    return savedLanguage;
  }

  // Then check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh-')) {
    return 'zh-TW';
  }
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }

  // Default to English for other languages
  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof Translation): string => {
    return translations[language][key] as string;
  };

  const translateAnime = (title: string): string => {
    return animeTranslations[language]?.[title] || title;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      stats: translations[language].stats,
      translateAnime 
    }}>
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