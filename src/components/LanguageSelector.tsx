import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './LanguageSelector.module.css';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'ja' | 'zh-TW' | 'en')}
      className={styles.select}
    >
      <option value="ja">日本語</option>
      <option value="zh-TW">繁體中文</option>
      <option value="en">English</option>
    </select>
  );
}; 