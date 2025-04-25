import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { animeData, getInitialStats } from '../data/animeData';
import { AnimeEntry, AnimeStats } from '../types/anime';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './AnimeBingo.module.css';

export const AnimeBingo = () => {
  const { t, stats, translateAnime } = useLanguage();
  const [watchedAnime, setWatchedAnime] = useState<Set<string>>(new Set());
  const [animeStats, setAnimeStats] = useState<AnimeStats>(getInitialStats());
  const exportRef = useRef<HTMLDivElement>(null);

  // Load state from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const watchedParam = params.get('watched');
    if (watchedParam) {
      const decoded = decodeURIComponent(watchedParam);
      const watchedTitles = decoded.split(',');
      const newWatched = new Set(watchedTitles);
      setWatchedAnime(newWatched);
      
      // Update stats
      const total = Object.values(animeData).flat().length;
      setAnimeStats({
        watched: newWatched.size,
        notWatched: total - newWatched.size
      });
    }
  }, []);

  const toggleAnime = (anime: AnimeEntry) => {
    const newWatched = new Set(watchedAnime);
    if (newWatched.has(anime.title)) {
      newWatched.delete(anime.title);
      setAnimeStats(prev => ({
        watched: prev.watched - 1,
        notWatched: prev.notWatched + 1
      }));
    } else {
      newWatched.add(anime.title);
      setAnimeStats(prev => ({
        watched: prev.watched + 1,
        notWatched: prev.notWatched - 1
      }));
    }
    setWatchedAnime(newWatched);
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#333',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = 'anime-bingo.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  };

  const shareState = () => {
    const watchedTitles = Array.from(watchedAnime);
    const encoded = encodeURIComponent(watchedTitles.join(','));
    const url = new URL(window.location.href);
    url.searchParams.set('watched', encoded);
    navigator.clipboard.writeText(url.toString());
    alert(t('linkCopied'));
  };

  return (
    <div className={styles.container}>
      <div className={styles.bingoContainer} ref={exportRef}>
        <div className={styles.titleBar}>
          <h1 className={styles.title}>{t('title')}</h1>
        </div>
        
        <div className={styles.grid}>
          <div className={styles.yearColumn}>
            {Object.keys(animeData).map(year => (
              <div key={year} className={styles.yearCell}>{year}</div>
            ))}
          </div>
          
          <div className={styles.animeGrid}>
            {Object.entries(animeData).map(([year, animes]) => (
              <div key={year} className={styles.row}>
                {animes.map((anime: AnimeEntry) => (
                  <button
                    key={anime.title}
                    className={`${styles.cell} ${watchedAnime.has(anime.title) ? styles.watched : ''}`}
                    onClick={() => toggleAnime(anime)}
                  >
                    {translateAnime(anime.title)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span>{stats.watched}:</span>
            <span className={styles.count}>{animeStats.watched}</span>
          </div>
          <div className={styles.statItem}>
            <span>{stats.notWatched}:</span>
            <span className={styles.count}>{animeStats.notWatched}</span>
          </div>
        </div>
      </div>
      <div className={styles.floatingControls}>
        <div className={styles.buttonGroup}>
          <button className={styles.exportButton} onClick={exportAsImage}>
            {t('saveImage')}
          </button>
          <button className={styles.shareButton} onClick={shareState}>
            {t('copyLink')}
          </button>
        </div>
        <LanguageSelector />
      </div>
    </div>
  );
}; 