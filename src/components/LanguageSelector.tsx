import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './LanguageSelector.module.css';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={styles.languageSelector}>
      <select
        className={styles.languageSelect}
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'ja' | 'zh-TW' | 'en')}
      >
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="zh-TW">繁體中文</option>
      </select>
    </div>
  );
}; 