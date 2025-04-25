import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AnimeBingo } from './components/AnimeBingo';
import styles from './App.module.css';

function App() {
  return (
    <LanguageProvider>
      <div className={styles.app}>
        <AnimeBingo />
      </div>
    </LanguageProvider>
  );
}

export default App;
