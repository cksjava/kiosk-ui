// src/types.ts
export interface Album {
  album: string;
  artist: string;
  trackCount: number;
  coverUrl?: string; // optional, can be wired later
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  durationSeconds?: number;
  coverUrl?: string;
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
