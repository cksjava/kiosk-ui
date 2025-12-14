export interface Album {
  id: number;              // numeric DB id
  album: string;
  artist: string;
  trackCount: number;
}

// types.ts
export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  durationSeconds?: number; // for future
  duration?: number;        // what the backend currently returns
}

export type LibrarySection = "home" | "albums" | "artists" | "tracks";

export interface PlayerMetadata {
  title: string;
  artist: string;
  album: string;
  coverUrl?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number; // seconds
  duration: number;    // seconds
  volume: number;      // 0–100
}
