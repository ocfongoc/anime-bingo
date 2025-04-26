import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { animeData, getInitialStats, animeIdMap, reverseAnimeIdMap } from "../data/animeData";
import { AnimeEntry, AnimeStats } from "../types/anime";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./AnimeBingo.module.css";
import originalBingoImage from "../assets/anime-generation-bingo.jpg";

export const AnimeBingo = () => {
  const { t, stats, translateAnime } = useLanguage();
  const [watchedAnime, setWatchedAnime] = useState<Set<string>>(new Set());
  const [animeStats, setAnimeStats] = useState<AnimeStats>(getInitialStats());
  const exportRef = useRef<HTMLDivElement>(null);

  // Load state from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const watchedParam = params.get("watched");
    if (watchedParam) {
      const decoded = decodeURIComponent(watchedParam);
      const watchedIds = decoded.split(",");
      const watchedTitles = watchedIds.map(id => reverseAnimeIdMap[id]);
      const newWatched = new Set(watchedTitles);
      setWatchedAnime(newWatched);

      // Update stats
      const total = Object.values(animeData).flat().length;
      setAnimeStats({
        watched: newWatched.size,
        notWatched: total - newWatched.size,
      });
    }
  }, []);

  const toggleAnime = (anime: AnimeEntry) => {
    const newWatched = new Set(watchedAnime);
    if (newWatched.has(anime.title)) {
      newWatched.delete(anime.title);
      setAnimeStats((prev) => ({
        watched: prev.watched - 1,
        notWatched: prev.notWatched + 1,
      }));
    } else {
      newWatched.add(anime.title);
      setAnimeStats((prev) => ({
        watched: prev.watched + 1,
        notWatched: prev.notWatched - 1,
      }));
    }
    setWatchedAnime(newWatched);
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#333",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = "anime-bingo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };

  const exportOriginalWithMarks = async () => {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create an image element for the original bingo image
    const img = new Image();
    img.src = originalBingoImage;

    // Wait for the image to load
    await new Promise((resolve) => {
      img.onload = () => {
        // Set canvas size to match original image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Calculate cell dimensions
        const gridStartX = 95; // Approximate X position where grid starts
        const gridStartY = 92; // Approximate Y position where grid starts
        const cellWidth = (img.width - gridStartX) / 10; // 10 columns
        const cellHeight = (img.height - gridStartY) / 19; // 19 rows (2006-2024)

        // Set circle style
        ctx.strokeStyle = "#f44336";
        ctx.lineWidth = 5;

        // Draw circles for watched anime
        Object.entries(animeData).forEach(([year, animes], rowIndex) => {
          animes.forEach((anime: AnimeEntry, colIndex: number) => {
            if (watchedAnime.has(anime.title)) {
              const x = gridStartX + colIndex * cellWidth + cellWidth / 2;
              const y = gridStartY + rowIndex * cellHeight + cellHeight / 2;
              const radius = Math.min(cellWidth, cellHeight) * 0.25;

              ctx.beginPath();
              ctx.arc(x, y, radius, 0, Math.PI * 2);
              ctx.stroke();
            }
          });
        });

        resolve(null);
      };
    });

    // Export the canvas as an image
    const link = document.createElement("a");
    link.download = "marked-anime-bingo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareState = () => {
    const watchedIds = Array.from(watchedAnime).map(title => animeIdMap[title]);
    const encoded = encodeURIComponent(watchedIds.join(","));
    const url = new URL(window.location.href);
    url.searchParams.set("watched", encoded);
    navigator.clipboard.writeText(url.toString());
    alert(t("linkCopied"));
  };

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <p>
          {t("description.message")}{" "}
          <a
            href="https://x.com/toarutoa/status/1912833603463155824"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            ({t("description.source")})
          </a>
        </p>
      </div>
      <div className={styles.bingoContainer} ref={exportRef}>
        <div className={styles.titleBar}>
          <h1 className={styles.title}>{t("title")}</h1>
        </div>

        <div className={styles.grid}>
          <div className={styles.yearColumn}>
            {Object.keys(animeData).map((year) => (
              <div key={year} className={styles.yearCell}>
                {year}
              </div>
            ))}
          </div>

          <div className={styles.animeGrid}>
            {Object.entries(animeData).map(([year, animes]) => (
              <div key={year} className={styles.row}>
                {animes.map((anime: AnimeEntry) => (
                  <button
                    key={anime.title}
                    className={`${styles.cell} ${
                      watchedAnime.has(anime.title) ? styles.watched : ""
                    }`}
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
            {t("saveImage")}
          </button>
          {/* <button className={styles.exportOriginalButton} onClick={exportOriginalWithMarks}>
            {t('saveOriginal')}
          </button> */}
          <button className={styles.shareButton} onClick={shareState}>
            {t('copyLink')}
          </button>
        </div>
        <LanguageSelector />
      </div>
    </div>
  );
};
