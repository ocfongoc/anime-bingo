export interface AnimeEntry {
  title: string;
  year: number;
  isWatched: boolean;
}

export interface AnimeData {
  [year: number]: AnimeEntry[];
}

export interface AnimeStats {
  watched: number;
  notWatched: number;
} 